import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateCapabilityDto } from './dto/create-capability.dto';
import { UpdateCapabilityDto } from './dto/update-capability.dto';

@Injectable()
export class CapabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createCapability(dto: CreateCapabilityDto) {
    return this.prisma.capability.create({
      data: {
        name: dto.name.trim(),
        from: dto.from?.trim() ?? null,
        guideline: dto.guideline?.trim() ?? null,
        type: dto.type,
      },
    });
  }

  async listCapabilities() {
    return this.prisma.capability.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async updateCapability(user: AuthUser, id: string, dto: UpdateCapabilityDto) {
    const existing = await this.prisma.capability.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Capability not found');
    }

    const updated = await this.prisma.capability.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        from: dto.from === undefined ? undefined : dto.from?.trim() ?? null,
        guideline: dto.guideline === undefined ? undefined : dto.guideline?.trim() ?? null,
        type: dto.type,
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'CAPABILITY_UPDATED',
      entityType: 'CAPABILITY',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deleteCapability(user: AuthUser, id: string) {
    const existing = await this.prisma.capability.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Capability not found');
    }

    const inUseCount = await this.prisma.capabilitySettingItem.count({
      where: { capabilityId: id },
    });

    if (inUseCount > 0) {
      throw new BadRequestException('Cannot delete capability that is in use');
    }

    const deleted = await this.prisma.capability.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'CAPABILITY_DELETED',
      entityType: 'CAPABILITY',
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
