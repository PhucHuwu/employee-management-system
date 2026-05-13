import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createDepartment(dto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: {
        name: dto.name.trim(),
      },
    });
  }

  async listDepartments() {
    return this.prisma.department.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async updateDepartment(user: AuthUser, id: string, dto: UpdateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Department not found');
    }

    const updated = await this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'DEPARTMENT_UPDATED',
      entityType: 'DEPARTMENT',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deleteDepartment(user: AuthUser, id: string) {
    const existing = await this.prisma.department.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Department not found');
    }

    const inUseCount = await this.prisma.employee.count({
      where: {
        departmentId: id,
        deletedAt: null,
      },
    });

    if (inUseCount > 0) {
      throw new BadRequestException('Cannot delete department that has employees');
    }

    const deleted = await this.prisma.department.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'DEPARTMENT_DELETED',
      entityType: 'DEPARTMENT',
      entityId: id,
      oldData: deleted,
    });

    return { deleted: true };
  }

  private toAuditActor(user: AuthUser): { id: string; role: Role } {
    return {
      id: user.id,
      role: user.role,
    };
  }
}
