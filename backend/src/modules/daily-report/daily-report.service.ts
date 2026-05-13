import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateDailyReportDto } from './dto/create-daily-report.dto';
import { DailyReportQueryDto } from './dto/daily-report-query.dto';
import { ProjectDailyProgressQueryDto } from './dto/project-daily-progress-query.dto';
import { UpdateDailyReportDto } from './dto/update-daily-report.dto';

interface PagedResult<T> {
  data: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class DailyReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailyReports(
    user: AuthUser,
    query: DailyReportQueryDto,
  ): Promise<PagedResult<unknown>> {
    const effectiveEmployeeId = user.role === Role.EMPLOYEE && user.employeeId
      ? user.employeeId
      : query.employeeId;

    this.assertEmployeeScope(user, effectiveEmployeeId);

    const where: Prisma.DailyReportWhereInput = {
      employeeId: effectiveEmployeeId,
      projectId: query.projectId,
      reportDate: this.buildDateRangeFilter(query.from, query.to),
      employee: this.buildEmployeeScopeFilter(user),
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.dailyReport.count({ where }),
      this.prisma.dailyReport.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
            },
          },
          project: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
        orderBy: [{ reportDate: 'desc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.size,
        take: query.size,
      }),
    ]);

    return {
      data: rows,
      page: query.page,
      size: query.size,
      total,
      totalPages: Math.ceil(total / query.size) || 1,
    };
  }

  async getProjectDailyProgress(
    user: AuthUser,
    projectId: string,
    query: ProjectDailyProgressQueryDto,
  ): Promise<unknown[]> {
    this.assertEmployeeScope(user, query.memberId);

    return this.prisma.dailyReport.findMany({
      where: {
        projectId,
        employeeId: query.memberId,
        reportDate: this.buildDateRangeFilter(query.from, query.to),
        employee: this.buildEmployeeScopeFilter(user),
      },
      select: {
        id: true,
        reportDate: true,
        task: true,
        workContent: true,
        employee: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: [{ reportDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  private buildDateRangeFilter(
    from?: string,
    to?: string,
  ): Prisma.DateTimeFilter | undefined {
    if (!from && !to) {
      return undefined;
    }

    const range: Prisma.DateTimeFilter = {};

    if (from) {
      range.gte = new Date(from);
    }

    if (to) {
      range.lte = new Date(to);
    }

    return range;
  }

  private buildEmployeeScopeFilter(user: AuthUser): Prisma.EmployeeWhereInput {
    if (user.role === Role.ADMIN) {
      return {};
    }

    if (user.role === Role.EMPLOYEE && user.employeeId) {
      return { id: user.employeeId };
    }

    const scopeFilter: Prisma.EmployeeWhereInput = {};

    if (user.departmentScopeId) {
      scopeFilter.departmentId = user.departmentScopeId;
    }

    if ((user.projectScopeIds ?? []).length > 0) {
      scopeFilter.projectMembers = {
        some: {
          projectId: {
            in: user.projectScopeIds ?? [],
          },
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

  private assertEmployeeScope(user: AuthUser, employeeId?: string): void {
    if (!employeeId || user.role === Role.ADMIN) {
      return;
    }

    if (user.role === Role.EMPLOYEE && user.employeeId) {
      if (employeeId !== user.employeeId) {
        throw new ForbiddenException('You do not have permission for this employee');
      }
      return;
    }

    const isByDepartment = Boolean(user.departmentScopeId);
    const isByProject = (user.projectScopeIds ?? []).length > 0;
    const isByEmployeeList = (user.scopeEmployeeIds ?? []).length > 0;

    if (!isByDepartment && !isByProject && !isByEmployeeList) {
      throw new ForbiddenException('You do not have permission for this employee');
    }

    if (isByEmployeeList && !(user.scopeEmployeeIds ?? []).includes(employeeId)) {
      throw new ForbiddenException('You do not have permission for this employee');
    }
  }

  async createDailyReport(user: AuthUser, dto: CreateDailyReportDto) {
    this.assertEmployeeScope(user, dto.employeeId);

    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('employee not found');
    }

    try {
      return await this.prisma.dailyReport.create({
        data: {
          reportDate: new Date(dto.reportDate),
          employeeId: dto.employeeId,
          projectId: dto.projectId ?? null,
          task: dto.task,
          workContent: dto.workContent,
        },
      });
    } catch (error) {
      this.rethrowPrismaError(error, 'daily report already exists for this employee, date and project');
    }
  }

  async updateDailyReport(user: AuthUser, id: string, dto: UpdateDailyReportDto) {
    const existing = await this.prisma.dailyReport.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('daily report not found');
    }

    this.assertEmployeeScope(user, existing.employeeId);

    if (dto.employeeId) {
      this.assertEmployeeScope(user, dto.employeeId);
      const employee = await this.prisma.employee.findUnique({
        where: { id: dto.employeeId },
      });
      if (!employee) {
        throw new NotFoundException('employee not found');
      }
    }

    try {
      return await this.prisma.dailyReport.update({
        where: { id },
        data: {
          ...(dto.reportDate !== undefined && { reportDate: new Date(dto.reportDate) }),
          ...(dto.employeeId !== undefined && { employeeId: dto.employeeId }),
          ...(dto.projectId !== undefined && { projectId: dto.projectId ?? null }),
          ...(dto.task !== undefined && { task: dto.task }),
          ...(dto.workContent !== undefined && { workContent: dto.workContent }),
        },
      });
    } catch (error) {
      this.rethrowPrismaError(error, 'daily report already exists for this employee, date and project');
    }
  }

  async deleteDailyReport(user: AuthUser, id: string) {
    const existing = await this.prisma.dailyReport.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('daily report not found');
    }

    this.assertEmployeeScope(user, existing.employeeId);

    await this.prisma.dailyReport.delete({
      where: { id },
    });
  }

  private rethrowPrismaError(error: unknown, conflictMessage: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException(conflictMessage);
    }

    throw error;
  }
}
