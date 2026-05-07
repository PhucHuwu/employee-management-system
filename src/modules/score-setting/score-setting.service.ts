import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateScoreSettingDto } from './dto/create-score-setting.dto';
import { UpdateScoreSettingDto } from './dto/update-score-setting.dto';

@Injectable()
export class ScoreSettingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createScoreSetting(dto: CreateScoreSettingDto) {
    if (dto.scoreFrom >= dto.scoreTo) {
      throw new BadRequestException('scoreFrom must be less than scoreTo');
    }

    await this.validateNoOverlap(
      dto.userType,
      dto.positionId,
      dto.scoreFrom,
      dto.scoreTo,
    );

    return this.prisma.scoreSetting.create({
      data: {
        userType: dto.userType.trim(),
        positionId: dto.positionId.trim(),
        scoreFrom: dto.scoreFrom,
        scoreTo: dto.scoreTo,
        level: dto.level.trim(),
      },
    });
  }

  async listScoreSettings() {
    return this.prisma.scoreSetting.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async updateScoreSetting(
    user: AuthUser,
    id: string,
    dto: UpdateScoreSettingDto,
  ) {
    const existing = await this.prisma.scoreSetting.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Score setting not found');
    }

    const scoreFrom = dto.scoreFrom ?? existing.scoreFrom;
    const scoreTo = dto.scoreTo ?? existing.scoreTo;

    if (scoreFrom >= scoreTo) {
      throw new BadRequestException('scoreFrom must be less than scoreTo');
    }

    const userType = dto.userType?.trim() ?? existing.userType;
    const positionId = dto.positionId?.trim() ?? existing.positionId;

    await this.validateNoOverlap(
      userType,
      positionId,
      scoreFrom,
      scoreTo,
      id,
    );

    const updated = await this.prisma.scoreSetting.update({
      where: { id },
      data: {
        userType: dto.userType?.trim(),
        positionId: dto.positionId?.trim(),
        scoreFrom: dto.scoreFrom,
        scoreTo: dto.scoreTo,
        level: dto.level?.trim(),
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'SCORE_SETTING_UPDATED',
      entityType: 'SCORE_SETTING',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deleteScoreSetting(user: AuthUser, id: string) {
    const existing = await this.prisma.scoreSetting.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Score setting not found');
    }

    const deleted = await this.prisma.scoreSetting.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'SCORE_SETTING_DELETED',
      entityType: 'SCORE_SETTING',
      entityId: id,
      oldData: deleted,
    });

    return { deleted: true };
  }

  private async validateNoOverlap(
    userType: string,
    positionId: string,
    scoreFrom: number,
    scoreTo: number,
    excludeId?: string,
  ) {
    const overlapping = await this.prisma.scoreSetting.findFirst({
      where: {
        userType,
        positionId,
        id: excludeId ? { not: excludeId } : undefined,
        OR: [
          {
            scoreFrom: { lte: scoreFrom },
            scoreTo: { gt: scoreFrom },
          },
          {
            scoreFrom: { lt: scoreTo },
            scoreTo: { gte: scoreTo },
          },
          {
            scoreFrom: { gte: scoreFrom },
            scoreTo: { lte: scoreTo },
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        'Score range overlaps with an existing setting for the same userType and positionId',
      );
    }
  }

  private toAuditActor(user: AuthUser): { id: string; role: Role } {
    return {
      id: user.id,
      role: user.role,
    };
  }
}
