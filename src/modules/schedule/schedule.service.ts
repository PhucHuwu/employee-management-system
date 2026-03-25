import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  Role,
  ScheduleRequestStatus,
  ScheduleRequestType,
} from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { DailyDrilldownQueryDto } from './dto/daily-drilldown-query.dto';
import { DailySummaryQueryDto } from './dto/daily-summary-query.dto';
import { ScheduleRequestQueryDto } from './dto/schedule-request-query.dto';

interface PagedResult<T> {
  data: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

interface DailySummaryItem {
  date: string;
  counts: Record<ScheduleRequestType, number>;
  total: number;
}

@Injectable()
export class ScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getScheduleRequests(
    user: AuthUser,
    query: ScheduleRequestQueryDto,
  ): Promise<PagedResult<unknown>> {
    const page = query.page;
    const size = query.size;

    const where: Prisma.ScheduleRequestWhereInput = {
      status: query.status ?? ScheduleRequestStatus.PENDING,
      requestType: query.type,
      employeeId: query.employeeId,
      requestDate: this.buildDateRangeFilter(query.from, query.to),
      employee: this.buildEmployeeScopeFilter(user),
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.scheduleRequest.count({ where }),
      this.prisma.scheduleRequest.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
              departmentId: true,
              fixedSchedule: true,
            },
          },
        },
        orderBy: [{ requestDate: 'asc' }, { createdAt: 'asc' }],
        skip: (page - 1) * size,
        take: size,
      }),
    ]);

    return {
      data: rows,
      page,
      size,
      total,
      totalPages: Math.ceil(total / size) || 1,
    };
  }

  async approveRequest(user: AuthUser, requestId: string): Promise<unknown> {
    const request = await this.prisma.scheduleRequest.findUnique({
      where: { id: requestId },
      include: {
        employee: {
          select: {
            id: true,
            fixedSchedule: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Schedule request not found');
    }

    await this.assertCanAccessEmployee(user, request.employeeId);

    if (request.status !== ScheduleRequestStatus.PENDING) {
      throw new ConflictException('Schedule request has already been processed');
    }

    await this.assertApprovalConflictRules(request);

    const approvedAt = new Date();
    const actor = {
      id: user.id,
      role: user.role,
    };

    const updated = await this.prisma.$transaction(async (tx) => {
      const approvedRequest = await tx.scheduleRequest.update({
        where: { id: request.id },
        data: {
          status: ScheduleRequestStatus.APPROVED,
          approvedBy: user.id,
          approvedAt,
          rejectionReason: null,
        },
      });

      if (request.requestType === ScheduleRequestType.CHANGE_FIXED_SCHEDULE) {
        if (!request.requestedSchedule) {
          throw new BadRequestException(
            'Requested schedule is required for change fixed schedule request',
          );
        }

        await tx.employee.update({
          where: { id: request.employeeId },
          data: { fixedSchedule: request.requestedSchedule },
        });
      }

      return approvedRequest;
    });

    await this.auditService.log({
      actor,
      action: 'SCHEDULE_REQUEST_APPROVED',
      entityType: 'SCHEDULE_REQUEST',
      entityId: request.id,
      oldData: {
        status: request.status,
        employeeFixedSchedule: request.employee.fixedSchedule,
      },
      newData: {
        status: updated.status,
        approvedAt: updated.approvedAt?.toISOString(),
        employeeFixedSchedule:
          request.requestType === ScheduleRequestType.CHANGE_FIXED_SCHEDULE
            ? request.requestedSchedule
            : request.employee.fixedSchedule,
      },
    });

    return updated;
  }

  async rejectRequest(
    user: AuthUser,
    requestId: string,
    rejectionReason: string,
  ): Promise<unknown> {
    const request = await this.prisma.scheduleRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        status: true,
        employeeId: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Schedule request not found');
    }

    await this.assertCanAccessEmployee(user, request.employeeId);

    if (request.status !== ScheduleRequestStatus.PENDING) {
      throw new ConflictException('Schedule request has already been processed');
    }

    const updated = await this.prisma.scheduleRequest.update({
      where: { id: request.id },
      data: {
        status: ScheduleRequestStatus.REJECTED,
        rejectionReason,
        approvedBy: user.id,
        approvedAt: new Date(),
      },
    });

    await this.auditService.log({
      actor: {
        id: user.id,
        role: user.role,
      },
      action: 'SCHEDULE_REQUEST_REJECTED',
      entityType: 'SCHEDULE_REQUEST',
      entityId: request.id,
      oldData: { status: request.status },
      newData: {
        status: updated.status,
        rejectionReason: updated.rejectionReason,
      },
    });

    return updated;
  }

  async getDailySummary(
    user: AuthUser,
    query: DailySummaryQueryDto,
  ): Promise<DailySummaryItem[]> {
    const where: Prisma.ScheduleRequestWhereInput = {
      status: ScheduleRequestStatus.APPROVED,
      requestDate: this.buildDateRangeFilter(query.from, query.to),
      employee: {
        ...this.buildEmployeeScopeFilter(user),
        departmentId: query.departmentId,
        projectMembers: query.projectId
          ? {
              some: {
                projectId: query.projectId,
                leftAt: null,
              },
            }
          : undefined,
      },
    };

    const rows = await this.prisma.scheduleRequest.groupBy({
      by: ['requestDate', 'requestType', 'employeeId'],
      where,
      orderBy: [
        { requestDate: 'asc' },
        { requestType: 'asc' },
        { employeeId: 'asc' },
      ],
    });

    const byDate = new Map<string, DailySummaryItem>();

    for (const row of rows) {
      const key = row.requestDate.toISOString().slice(0, 10);
      const current = byDate.get(key) ?? {
        date: key,
        counts: this.emptyScheduleTypeCounts(),
        total: 0,
      };

      current.counts[row.requestType] += 1;
      current.total += 1;
      byDate.set(key, current);
    }

    return Array.from(byDate.values());
  }

  async getDailyDrilldown(
    user: AuthUser,
    query: DailyDrilldownQueryDto,
  ): Promise<unknown[]> {
    const rows = await this.prisma.scheduleRequest.findMany({
      where: {
        status: ScheduleRequestStatus.APPROVED,
        requestType: query.type,
        requestDate: new Date(query.date),
        employee: this.buildEmployeeScopeFilter(user),
      },
      distinct: ['employeeId'],
      select: {
        id: true,
        requestType: true,
        requestDate: true,
        employee: {
          select: {
            id: true,
            fullName: true,
            departmentId: true,
            fixedSchedule: true,
          },
        },
      },
      orderBy: {
        employee: {
          fullName: 'asc',
        },
      },
    });

    return rows;
  }

  private buildDateRangeFilter(
    from?: string,
    to?: string,
  ): Prisma.DateTimeFilter | undefined {
    if (!from && !to) {
      return undefined;
    }

    const dateFilter: Prisma.DateTimeFilter = {};

    if (from) {
      dateFilter.gte = new Date(from);
    }

    if (to) {
      dateFilter.lte = new Date(to);
    }

    return dateFilter;
  }

  private buildEmployeeScopeFilter(
    user: AuthUser,
  ): Prisma.EmployeeWhereInput {
    if (user.role === Role.ADMIN) {
      return {};
    }

    const scopeFilter: Prisma.EmployeeWhereInput = {};

    if (user.departmentScopeId) {
      scopeFilter.departmentId = user.departmentScopeId;
    }

    if ((user.projectScopeIds ?? []).length > 0) {
      scopeFilter.projectMembers = {
        some: {
          projectId: { in: user.projectScopeIds ?? [] },
          leftAt: null,
        },
      };
    }

    if ((user.scopeEmployeeIds ?? []).length > 0) {
      scopeFilter.id = {
        in: user.scopeEmployeeIds ?? [],
      };
    }

    if (!scopeFilter.departmentId && !scopeFilter.projectMembers) {
      return {
        id: {
          in: ['00000000-0000-0000-0000-000000000000'],
        },
      };
    }

    return scopeFilter;
  }

  private async assertCanAccessEmployee(user: AuthUser, employeeId: string): Promise<void> {
    if (user.role === Role.ADMIN) {
      return;
    }

    if ((user.scopeEmployeeIds ?? []).length > 0) {
      if (!(user.scopeEmployeeIds ?? []).includes(employeeId)) {
        throw new ForbiddenException('You do not have permission for this employee');
      }

      return;
    }

    const employee = await this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        ...this.buildEmployeeScopeFilter(user),
      },
      select: {
        id: true,
      },
    });

    if (!employee) {
      throw new ForbiddenException('You do not have permission for this employee');
    }
  }

  private async assertApprovalConflictRules(
    request: {
      id: string;
      employeeId: string;
      requestDate: Date;
      requestType: ScheduleRequestType;
    },
  ): Promise<void> {
    if (request.requestType === ScheduleRequestType.CHANGE_FIXED_SCHEDULE) {
      return;
    }

    const approvedSameDay = await this.prisma.scheduleRequest.findMany({
      where: {
        employeeId: request.employeeId,
        requestDate: request.requestDate,
        status: ScheduleRequestStatus.APPROVED,
        id: { not: request.id },
      },
      select: {
        requestType: true,
      },
    });

    const approvedTypes = new Set(approvedSameDay.map((item) => item.requestType));

    if (
      approvedTypes.has(ScheduleRequestType.OFF_FULL_DAY) ||
      approvedTypes.has(ScheduleRequestType.REMOTE_FULL_DAY)
    ) {
      throw new ConflictException('Existing approved full-day request conflicts');
    }

    if (
      request.requestType === ScheduleRequestType.OFF_FULL_DAY ||
      request.requestType === ScheduleRequestType.REMOTE_FULL_DAY
    ) {
      const hasHalfDay = [
        ScheduleRequestType.OFF_AM,
        ScheduleRequestType.OFF_PM,
        ScheduleRequestType.REMOTE_AM,
        ScheduleRequestType.REMOTE_PM,
      ].some((type) => approvedTypes.has(type));

      if (hasHalfDay) {
        throw new ConflictException('Existing approved half-day request conflicts');
      }
    }

    if (request.requestType === ScheduleRequestType.OFF_AM && approvedTypes.has(ScheduleRequestType.REMOTE_AM)) {
      throw new ConflictException('Conflicting approved AM request exists');
    }

    if (request.requestType === ScheduleRequestType.REMOTE_AM && approvedTypes.has(ScheduleRequestType.OFF_AM)) {
      throw new ConflictException('Conflicting approved AM request exists');
    }

    if (request.requestType === ScheduleRequestType.OFF_PM && approvedTypes.has(ScheduleRequestType.REMOTE_PM)) {
      throw new ConflictException('Conflicting approved PM request exists');
    }

    if (request.requestType === ScheduleRequestType.REMOTE_PM && approvedTypes.has(ScheduleRequestType.OFF_PM)) {
      throw new ConflictException('Conflicting approved PM request exists');
    }
  }

  private emptyScheduleTypeCounts(): Record<ScheduleRequestType, number> {
    return {
      [ScheduleRequestType.OFF_FULL_DAY]: 0,
      [ScheduleRequestType.REMOTE_FULL_DAY]: 0,
      [ScheduleRequestType.OFF_AM]: 0,
      [ScheduleRequestType.OFF_PM]: 0,
      [ScheduleRequestType.REMOTE_AM]: 0,
      [ScheduleRequestType.REMOTE_PM]: 0,
      [ScheduleRequestType.CHANGE_FIXED_SCHEDULE]: 0,
    };
  }
}
