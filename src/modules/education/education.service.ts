import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { ListEducationQueryDto } from './dto/list-education-query.dto';

@Injectable()
export class EducationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createEducation(dto: CreateEducationDto) {
    await this.assertEducationTypeExists(dto.educationTypeId);

    return this.prisma.education.create({
      data: {
        name: dto.name.trim(),
        color: dto.color?.trim(),
        educationTypeId: dto.educationTypeId,
      },
      include: {
        educationType: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async listEducations(query: ListEducationQueryDto) {
    return this.prisma.education.findMany({
      where: {
        educationTypeId: query.educationTypeId,
      },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        educationType: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async updateEducation(
    user: AuthUser,
    id: string,
    dto: UpdateEducationDto,
  ) {
    const existing = await this.prisma.education.findUnique({
      where: { id },
      include: {
        educationType: {
          select: { id: true, name: true },
        },
      },
    });
    if (!existing) {
      throw new NotFoundException('Education not found');
    }

    if (dto.educationTypeId) {
      await this.assertEducationTypeExists(dto.educationTypeId);
    }

    const updated = await this.prisma.education.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        color: dto.color?.trim(),
        educationTypeId: dto.educationTypeId,
      },
      include: {
        educationType: {
          select: { id: true, name: true },
        },
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'EDUCATION_UPDATED',
      entityType: 'EDUCATION',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deleteEducation(user: AuthUser, id: string) {
    const existing = await this.prisma.education.findUnique({
      where: { id },
      include: {
        educationType: {
          select: { id: true, name: true },
        },
      },
    });
    if (!existing) {
      throw new NotFoundException('Education not found');
    }

    const inUseCount = await this.prisma.candidate.count({
      where: {
        educationId: id,
      },
    });

    if (inUseCount > 0) {
      throw new BadRequestException(
        'Cannot delete education that is in use by candidates',
      );
    }

    const deleted = await this.prisma.education.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'EDUCATION_DELETED',
      entityType: 'EDUCATION',
      entityId: id,
      oldData: deleted,
    });

    return { deleted: true };
  }

  private async assertEducationTypeExists(educationTypeId: string): Promise<void> {
    const exists = await this.prisma.educationType.findUnique({
      where: { id: educationTypeId },
      select: { id: true },
    });

    if (!exists) {
      throw new BadRequestException('Education type does not exist');
    }
  }

  private toAuditActor(user: AuthUser): { id: string; role: Role } {
    return {
      id: user.id,
      role: user.role,
    };
  }
}
