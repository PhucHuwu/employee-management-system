import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateCvSourceDto } from './dto/create-cv-source.dto';
import { UpdateCvSourceDto } from './dto/update-cv-source.dto';

@Injectable()
export class CvSourceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createCvSource(dto: CreateCvSourceDto) {
    return this.prisma.cVSource.create({
      data: {
        name: dto.name.trim(),
        color: dto.color?.trim(),
        referenceTo: dto.referenceTo?.trim(),
      },
    });
  }

  async listCvSources() {
    return this.prisma.cVSource.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async updateCvSource(user: AuthUser, id: string, dto: UpdateCvSourceDto) {
    const existing = await this.prisma.cVSource.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('CV source not found');
    }

    const updated = await this.prisma.cVSource.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        color: dto.color?.trim(),
        referenceTo: dto.referenceTo?.trim(),
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'CV_SOURCE_UPDATED',
      entityType: 'CV_SOURCE',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deleteCvSource(user: AuthUser, id: string) {
    const existing = await this.prisma.cVSource.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('CV source not found');
    }

    const inUseCount = await this.prisma.candidate.count({
      where: { cvSourceId: id },
    });

    if (inUseCount > 0) {
      throw new BadRequestException('Cannot delete CV source that is in use');
    }

    const deleted = await this.prisma.cVSource.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'CV_SOURCE_DELETED',
      entityType: 'CV_SOURCE',
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
