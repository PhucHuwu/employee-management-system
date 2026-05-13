import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateCapabilitySettingDto } from './dto/create-capability-setting.dto';
import { UpdateCapabilitySettingDto } from './dto/update-capability-setting.dto';

@Injectable()
export class CapabilitySettingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createCapabilitySetting(dto: CreateCapabilitySettingDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('At least one item is required');
    }

    return this.prisma.capabilitySetting.create({
      data: {
        userType: dto.userType.trim(),
        positionId: dto.positionId.trim(),
        items: {
          create: dto.items.map((item) => ({
            capabilityId: item.capabilityId.trim(),
            coefficient: item.coefficient,
            guideline: item.guideline?.trim() ?? null,
          })),
        },
      },
      include: { items: true },
    });
  }

  async listCapabilitySettings() {
    return this.prisma.capabilitySetting.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: { items: true },
    });
  }

  async updateCapabilitySetting(
    user: AuthUser,
    id: string,
    dto: UpdateCapabilitySettingDto,
  ) {
    const existing = await this.prisma.capabilitySetting.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) {
      throw new NotFoundException('Capability setting not found');
    }

    if (dto.items !== undefined && dto.items.length === 0) {
      throw new BadRequestException('At least one item is required');
    }

    const updated = await this.prisma.capabilitySetting.update({
      where: { id },
      data: {
        userType: dto.userType?.trim(),
        positionId: dto.positionId?.trim(),
        items: dto.items
          ? {
              deleteMany: {},
              create: dto.items.map((item) => ({
                capabilityId: item.capabilityId.trim(),
                coefficient: item.coefficient,
                guideline: item.guideline?.trim() ?? null,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'CAPABILITY_SETTING_UPDATED',
      entityType: 'CAPABILITY_SETTING',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deleteCapabilitySetting(user: AuthUser, id: string) {
    const existing = await this.prisma.capabilitySetting.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Capability setting not found');
    }

    const deleted = await this.prisma.capabilitySetting.delete({
      where: { id },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'CAPABILITY_SETTING_DELETED',
      entityType: 'CAPABILITY_SETTING',
      entityId: id,
      oldData: deleted,
    });

    return { deleted: true };
  }

  async cloneCapabilitySetting(
    id: string,
    targetUserType: string,
    targetPositionId: string,
  ) {
    const existing = await this.prisma.capabilitySetting.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) {
      throw new NotFoundException('Capability setting not found');
    }

    const duplicate = await this.prisma.capabilitySetting.findUnique({
      where: {
        userType_positionId: {
          userType: targetUserType.trim(),
          positionId: targetPositionId.trim(),
        },
      },
    });

    if (duplicate) {
      throw new BadRequestException(
        'A capability setting already exists for the target userType and positionId',
      );
    }

    return this.prisma.capabilitySetting.create({
      data: {
        userType: targetUserType.trim(),
        positionId: targetPositionId.trim(),
        items: {
          create: existing.items.map((item) => ({
            capabilityId: item.capabilityId,
            coefficient: item.coefficient,
            guideline: item.guideline,
          })),
        },
      },
      include: { items: true },
    });
  }

  private toAuditActor(user: AuthUser): { id: string; role: Role } {
    return {
      id: user.id,
      role: user.role,
    };
  }
}
