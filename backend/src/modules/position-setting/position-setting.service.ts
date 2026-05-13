import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreatePositionSettingDto } from './dto/create-position-setting.dto';
import { UpdatePositionSettingDto } from './dto/update-position-setting.dto';

@Injectable()
export class PositionSettingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createPositionSetting(dto: CreatePositionSettingDto) {
    await this.assertSubPositionExists(dto.subPositionId);

    return this.prisma.positionSetting.create({
      data: {
        userType: dto.userType.trim(),
        lmsConfig: dto.lmsConfig?.trim(),
        subPositionId: dto.subPositionId,
      },
      include: {
        subPosition: {
          include: {
            position: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async listPositionSettings(subPositionId?: string) {
    return this.prisma.positionSetting.findMany({
      where: subPositionId ? { subPositionId } : undefined,
      include: {
        subPosition: {
          include: {
            position: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async updatePositionSetting(
    user: AuthUser,
    id: string,
    dto: UpdatePositionSettingDto,
  ) {
    const existing = await this.prisma.positionSetting.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Position setting not found');
    }

    if (dto.subPositionId) {
      await this.assertSubPositionExists(dto.subPositionId);
    }

    const updated = await this.prisma.positionSetting.update({
      where: { id },
      data: {
        userType: dto.userType?.trim(),
        lmsConfig: dto.lmsConfig?.trim(),
        subPositionId: dto.subPositionId,
      },
      include: {
        subPosition: {
          include: {
            position: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'POSITION_SETTING_UPDATED',
      entityType: 'POSITION_SETTING',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deletePositionSetting(user: AuthUser, id: string) {
    const existing = await this.prisma.positionSetting.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Position setting not found');
    }

    const deleted = await this.prisma.positionSetting.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'POSITION_SETTING_DELETED',
      entityType: 'POSITION_SETTING',
      entityId: id,
      oldData: deleted,
    });

    return { deleted: true };
  }

  private async assertSubPositionExists(subPositionId: string): Promise<void> {
    const exists = await this.prisma.subPosition.findUnique({
      where: { id: subPositionId },
      select: { id: true },
    });

    if (!exists) {
      throw new BadRequestException('Sub position does not exist');
    }
  }

  private toAuditActor(user: AuthUser): { id: string; role: Role } {
    return {
      id: user.id,
      role: user.role,
    };
  }
}
