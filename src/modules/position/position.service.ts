import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { BulkUpdateEmployeePositionDto } from './dto/bulk-update-employee-position.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdateEmployeePositionDto } from './dto/update-employee-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createPosition(dto: CreatePositionDto) {
    return this.prisma.position.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
        active: dto.active ?? true,
      },
    });
  }

  async listPositions() {
    return this.prisma.position.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async updatePosition(user: AuthUser, id: string, dto: UpdatePositionDto) {
    const existing = await this.prisma.position.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Position not found');
    }

    const updated = await this.prisma.position.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
        active: dto.active,
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'POSITION_UPDATED',
      entityType: 'POSITION',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deletePosition(user: AuthUser, id: string) {
    const existing = await this.prisma.position.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Position not found');
    }

    const inUseCount = await this.prisma.employee.count({
      where: {
        positionId: id,
        deletedAt: null,
      },
    });

    if (inUseCount > 0) {
      throw new BadRequestException('Cannot delete position that is in use by employees');
    }

    const deleted = await this.prisma.position.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'POSITION_DELETED',
      entityType: 'POSITION',
      entityId: id,
      oldData: deleted,
    });

    return { deleted: true };
  }

  async updateEmployeePosition(
    user: AuthUser,
    employeeId: string,
    dto: UpdateEmployeePositionDto,
  ) {
    await this.assertPositionExists(dto.positionId);

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee || employee.deletedAt) {
      throw new NotFoundException('Employee not found');
    }

    const updated = await this.prisma.employee.update({
      where: { id: employeeId },
      data: { positionId: dto.positionId },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'EMPLOYEE_POSITION_UPDATED',
      entityType: 'EMPLOYEE',
      entityId: employeeId,
      oldData: { positionId: employee.positionId },
      newData: { positionId: updated.positionId },
    });

    return updated;
  }

  async bulkUpdateEmployeePosition(user: AuthUser, dto: BulkUpdateEmployeePositionDto) {
    await this.assertPositionExists(dto.positionId);
    const uniqueEmployeeIds = Array.from(new Set(dto.employeeIds));

    if (uniqueEmployeeIds.length === 0) {
      return { updatedCount: 0 };
    }

    const existingEmployees = await this.prisma.employee.findMany({
      where: {
        id: { in: uniqueEmployeeIds },
        deletedAt: null,
      },
      select: {
        id: true,
        positionId: true,
      },
    });

    if (existingEmployees.length !== uniqueEmployeeIds.length) {
      throw new BadRequestException('One or more employees do not exist');
    }

    const result = await this.prisma.employee.updateMany({
      where: {
        id: { in: uniqueEmployeeIds },
      },
      data: {
        positionId: dto.positionId,
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'EMPLOYEE_POSITION_BULK_UPDATED',
      entityType: 'POSITION',
      entityId: dto.positionId,
      oldData: existingEmployees,
      newData: {
        employeeIds: uniqueEmployeeIds,
        positionId: dto.positionId,
        updatedCount: result.count,
      },
    });

    return { updatedCount: result.count };
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

  private toAuditActor(user: AuthUser): { id: string; role: Role } {
    return {
      id: user.id,
      role: user.role,
    };
  }
}
