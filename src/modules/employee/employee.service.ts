import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createEmployee(user: AuthUser, dto: CreateEmployeeDto) {
    this.validateDob(dto.dob);
    const normalizedName = this.normalizeFullName(dto.fullName);

    await this.assertDepartmentExists(dto.departmentId);
    await this.assertPositionExists(dto.positionId);

    const projectConnect = await this.resolveProjectConnections(dto.projectIds);

    const created = await this.prisma.employee.create({
      data: {
        fullName: normalizedName,
        dob: dto.dob,
        address: dto.address.trim(),
        departmentId: dto.departmentId,
        positionId: dto.positionId,
        fixedSchedule: dto.fixedSchedule,
        projectMembers: projectConnect.length
          ? {
              create: projectConnect.map((projectId) => ({ projectId })),
            }
          : undefined,
      },
      include: this.employeeInclude(),
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'EMPLOYEE_CREATED',
      entityType: 'EMPLOYEE',
      entityId: created.id,
      newData: created,
    });

    return created;
  }

  async getEmployeeById(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: this.employeeInclude(),
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async listEmployees(query: EmployeeQueryDto) {
    const where: Prisma.EmployeeWhereInput = {
      deletedAt: null,
      employmentStatus: query.status,
      departmentId: query.departmentId,
      positionId: query.positionId,
      projectMembers: query.projectId
        ? {
            some: {
              projectId: query.projectId,
              leftAt: null,
            },
          }
        : undefined,
      titleHistories: query.jobTitleId
        ? {
            some: {
              newJobTitleId: query.jobTitleId,
            },
          }
        : undefined,
    };

    if (query.keyword?.trim()) {
      const keyword = query.keyword.trim();
      where.OR = [
        { fullName: { contains: keyword, mode: 'insensitive' } },
        { address: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.employee.count({ where }),
      this.prisma.employee.findMany({
        where,
        include: this.employeeInclude(),
        orderBy: [{ createdAt: 'desc' }],
        skip: (query.page - 1) * query.size,
        take: query.size,
      }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        size: query.size,
        total,
        totalPages: Math.ceil(total / query.size) || 1,
      },
    };
  }

  async updateEmployee(user: AuthUser, id: string, dto: UpdateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({
      where: { id },
      include: this.employeeInclude(),
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Employee not found');
    }

    if (dto.dob) {
      this.validateDob(dto.dob);
    }

    if (dto.departmentId) {
      await this.assertDepartmentExists(dto.departmentId);
    }

    if (dto.positionId) {
      await this.assertPositionExists(dto.positionId);
    }

    const normalizedName = dto.fullName ? this.normalizeFullName(dto.fullName) : undefined;
    const projectIds = await this.resolveProjectConnections(dto.projectIds);

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.projectIds) {
        await tx.projectMember.deleteMany({ where: { employeeId: id } });

        if (projectIds.length) {
          await tx.projectMember.createMany({
            data: projectIds.map((projectId) => ({ employeeId: id, projectId })),
            skipDuplicates: true,
          });
        }
      }

      return tx.employee.update({
        where: { id },
        data: {
          fullName: normalizedName,
          dob: dto.dob,
          address: dto.address?.trim(),
          departmentId: dto.departmentId,
          positionId: dto.positionId,
          fixedSchedule: dto.fixedSchedule,
          employmentStatus: dto.employmentStatus,
        },
        include: this.employeeInclude(),
      });
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'EMPLOYEE_UPDATED',
      entityType: 'EMPLOYEE',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async softDeleteEmployee(user: AuthUser, id: string) {
    const existing = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Employee not found');
    }

    await this.assertDeleteConstraints(id);

    const deleted = await this.prisma.employee.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        employmentStatus: 'INACTIVE',
      },
      include: this.employeeInclude(),
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'EMPLOYEE_SOFT_DELETED',
      entityType: 'EMPLOYEE',
      entityId: id,
      oldData: existing,
      newData: deleted,
    });

    return { deleted: true };
  }

  private employeeInclude(): Prisma.EmployeeInclude {
    return {
      department: true,
      position: true,
      projectMembers: {
        where: { leftAt: null },
        include: {
          project: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      },
      titleHistories: {
        include: {
          newJobTitle: true,
          oldJobTitle: true,
        },
        orderBy: { effectiveDate: 'desc' },
      },
    };
  }

  private validateDob(dob: Date): void {
    const now = new Date();
    if (dob > now) {
      throw new BadRequestException('DOB cannot be in the future');
    }

    const age = now.getFullYear() - dob.getFullYear();
    if (age < 18) {
      throw new BadRequestException('Employee must be at least 18 years old');
    }
  }

  private normalizeFullName(fullName: string): string {
    return fullName.trim().replace(/\s+/g, ' ');
  }

  private async resolveProjectConnections(projectIds?: string[]): Promise<string[]> {
    if (!projectIds) {
      return [];
    }

    const uniqueIds = Array.from(new Set(projectIds));
    if (uniqueIds.length === 0) {
      return [];
    }

    const count = await this.prisma.project.count({
      where: {
        id: {
          in: uniqueIds,
        },
      },
    });

    if (count !== uniqueIds.length) {
      throw new BadRequestException('One or more projects do not exist');
    }

    return uniqueIds;
  }

  private async assertDepartmentExists(departmentId: string): Promise<void> {
    const exists = await this.prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true },
    });

    if (!exists) {
      throw new BadRequestException('Department does not exist');
    }
  }

  private async assertPositionExists(positionId: string): Promise<void> {
    const exists = await this.prisma.position.findUnique({
      where: { id: positionId },
      select: { id: true },
    });

    if (!exists) {
      throw new BadRequestException('Position does not exist');
    }
  }

  private async assertDeleteConstraints(employeeId: string): Promise<void> {
    const [scheduleCount, dailyCount, membershipCount] = await this.prisma.$transaction([
      this.prisma.scheduleRequest.count({ where: { employeeId } }),
      this.prisma.dailyReport.count({ where: { employeeId } }),
      this.prisma.projectMember.count({ where: { employeeId } }),
    ]);

    if (scheduleCount + dailyCount + membershipCount > 0) {
      throw new BadRequestException(
        'Cannot delete employee with related schedule, daily report, or project membership data',
      );
    }
  }

  private toAuditActor(user: AuthUser): { id: string; role: Role } {
    return {
      id: user.id,
      role: user.role,
    };
  }
}
