import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateSubPositionDto } from './dto/create-sub-position.dto';
import { UpdateSubPositionDto } from './dto/update-sub-position.dto';

@Injectable()
export class SubPositionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createSubPosition(dto: CreateSubPositionDto) {
    await this.assertPositionExists(dto.positionId);

    return this.prisma.subPosition.create({
      data: {
        name: dto.name.trim(),
        color: dto.color?.trim(),
        positionId: dto.positionId,
      },
    });
  }

  async listSubPositions(positionId?: string) {
    return this.prisma.subPosition.findMany({
      where: positionId ? { positionId } : undefined,
      include: {
        position: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async updateSubPosition(user: AuthUser, id: string, dto: UpdateSubPositionDto) {
    const existing = await this.prisma.subPosition.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Sub position not found');
    }

    if (dto.positionId) {
      await this.assertPositionExists(dto.positionId);
    }

    const updated = await this.prisma.subPosition.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        color: dto.color?.trim(),
        positionId: dto.positionId,
      },
      include: {
        position: {
          select: {
            name: true,
          },
        },
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'SUB_POSITION_UPDATED',
      entityType: 'SUB_POSITION',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deleteSubPosition(user: AuthUser, id: string) {
    const existing = await this.prisma.subPosition.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Sub position not found');
    }

    const inUseCount = await this.prisma.positionSetting.count({
      where: { subPositionId: id },
    });

    if (inUseCount > 0) {
      throw new BadRequestException('Cannot delete sub position that is in use');
    }

    const deleted = await this.prisma.subPosition.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'SUB_POSITION_DELETED',
      entityType: 'SUB_POSITION',
      entityId: id,
      oldData: deleted,
    });

    return { deleted: true };
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
