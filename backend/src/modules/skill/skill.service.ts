import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createSkill(dto: CreateSkillDto) {
    return this.prisma.skill.create({
      data: {
        name: dto.name.trim(),
      },
    });
  }

  async listSkills() {
    return this.prisma.skill.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async updateSkill(user: AuthUser, id: string, dto: UpdateSkillDto) {
    const existing = await this.prisma.skill.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Skill not found');
    }

    const updated = await this.prisma.skill.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'SKILL_UPDATED',
      entityType: 'SKILL',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deleteSkill(user: AuthUser, id: string) {
    const existing = await this.prisma.skill.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Skill not found');
    }

    const inUseCount = await this.prisma.employeeSkill.count({
      where: { skillId: id },
    });

    if (inUseCount > 0) {
      throw new BadRequestException('Cannot delete skill that is in use');
    }

    const deleted = await this.prisma.skill.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'SKILL_DELETED',
      entityType: 'SKILL',
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
