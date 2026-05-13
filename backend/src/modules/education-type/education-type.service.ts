import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateEducationTypeDto } from './dto/create-education-type.dto';
import { UpdateEducationTypeDto } from './dto/update-education-type.dto';

@Injectable()
export class EducationTypeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createEducationType(dto: CreateEducationTypeDto) {
    return this.prisma.educationType.create({
      data: {
        name: dto.name.trim(),
      },
    });
  }

  async listEducationTypes() {
    return this.prisma.educationType.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async updateEducationType(
    user: AuthUser,
    id: string,
    dto: UpdateEducationTypeDto,
  ) {
    const existing = await this.prisma.educationType.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Education type not found');
    }

    const updated = await this.prisma.educationType.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'EDUCATION_TYPE_UPDATED',
      entityType: 'EDUCATION_TYPE',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deleteEducationType(user: AuthUser, id: string) {
    const existing = await this.prisma.educationType.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Education type not found');
    }

    const inUseCount = await this.prisma.education.count({
      where: {
        educationTypeId: id,
      },
    });

    if (inUseCount > 0) {
      throw new BadRequestException(
        'Cannot delete education type that is in use',
      );
    }

    const deleted = await this.prisma.educationType.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'EDUCATION_TYPE_DELETED',
      entityType: 'EDUCATION_TYPE',
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
