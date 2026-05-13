import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateTrainingPlanDto } from './dto/create-training-plan.dto';
import { UpdateTrainingPlanDto } from './dto/update-training-plan.dto';
import { CreateTrainingRecordDto } from './dto/create-training-record.dto';
import { UpdateTrainingRecordDto } from './dto/update-training-record.dto';

@Injectable()
export class TrainingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ─── TrainingPlan ───

  async createTrainingPlan(user: AuthUser, dto: CreateTrainingPlanDto) {
    this.validateDateRange(dto.startDate, dto.endDate);

    const created = await this.prisma.trainingPlan.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim(),
        provider: dto.provider?.trim(),
        location: dto.location?.trim(),
        startDate: dto.startDate,
        endDate: dto.endDate,
        cost: dto.cost ? new Prisma.Decimal(dto.cost) : null,
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'TRAINING_PLAN_CREATED',
      entityType: 'TRAINING_PLAN',
      entityId: created.id,
      newData: created,
    });

    return created;
  }

  async getTrainingPlanById(id: string) {
    const plan = await this.prisma.trainingPlan.findUnique({
      where: { id },
      include: { _count: { select: { records: true } } },
    });

    if (!plan) {
      throw new NotFoundException('Training plan not found');
    }

    return plan;
  }

  async listTrainingPlans() {
    const items = await this.prisma.trainingPlan.findMany({
      include: { _count: { select: { records: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return { items };
  }

  async updateTrainingPlan(
    user: AuthUser,
    id: string,
    dto: UpdateTrainingPlanDto,
  ) {
    const existing = await this.prisma.trainingPlan.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Training plan not found');
    }

    if (dto.startDate || dto.endDate) {
      this.validateDateRange(
        dto.startDate ?? existing.startDate,
        dto.endDate ?? existing.endDate,
      );
    }

    const updated = await this.prisma.trainingPlan.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        description: dto.description?.trim(),
        provider: dto.provider?.trim(),
        location: dto.location?.trim(),
        startDate: dto.startDate,
        endDate: dto.endDate,
        cost: dto.cost ? new Prisma.Decimal(dto.cost) : undefined,
      },
      include: { _count: { select: { records: true } } },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'TRAINING_PLAN_UPDATED',
      entityType: 'TRAINING_PLAN',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deleteTrainingPlan(user: AuthUser, id: string) {
    const existing = await this.prisma.trainingPlan.findUnique({
      where: { id },
      include: { _count: { select: { records: true } } },
    });

    if (!existing) {
      throw new NotFoundException('Training plan not found');
    }

    if (existing._count.records > 0) {
      throw new BadRequestException(
        'Cannot delete training plan with existing records',
      );
    }

    await this.prisma.trainingPlan.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'TRAINING_PLAN_DELETED',
      entityType: 'TRAINING_PLAN',
      entityId: id,
      oldData: existing,
    });

    return { deleted: true };
  }

  // ─── TrainingRecord ───

  async createTrainingRecord(user: AuthUser, dto: CreateTrainingRecordDto) {
    await this.assertEmployeeExists(dto.employeeId);
    await this.assertTrainingPlanExists(dto.trainingPlanId);

    const created = await this.prisma.trainingRecord.create({
      data: {
        employeeId: dto.employeeId,
        trainingPlanId: dto.trainingPlanId,
        completionDate: dto.completionDate ?? null,
        certificateUrl: dto.certificateUrl?.trim() ?? null,
        certificateExpiry: dto.certificateExpiry ?? null,
        score: dto.score ?? null,
        notes: dto.notes?.trim() ?? null,
      },
      include: {
        employee: { select: { id: true, fullName: true } },
        trainingPlan: { select: { id: true, title: true } },
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'TRAINING_RECORD_CREATED',
      entityType: 'TRAINING_RECORD',
      entityId: created.id,
      newData: created,
    });

    return created;
  }

  async getTrainingRecordById(id: string) {
    const record = await this.prisma.trainingRecord.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, fullName: true } },
        trainingPlan: { select: { id: true, title: true } },
      },
    });

    if (!record) {
      throw new NotFoundException('Training record not found');
    }

    return record;
  }

  async listTrainingRecords(query: {
    employeeId?: string;
    trainingPlanId?: string;
  }) {
    const where: Prisma.TrainingRecordWhereInput = {
      employeeId: query.employeeId,
      trainingPlanId: query.trainingPlanId,
    };

    const items = await this.prisma.trainingRecord.findMany({
      where,
      include: {
        employee: { select: { id: true, fullName: true } },
        trainingPlan: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { items };
  }

  async updateTrainingRecord(
    user: AuthUser,
    id: string,
    dto: UpdateTrainingRecordDto,
  ) {
    const existing = await this.prisma.trainingRecord.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Training record not found');
    }

    if (dto.employeeId) {
      await this.assertEmployeeExists(dto.employeeId);
    }

    if (dto.trainingPlanId) {
      await this.assertTrainingPlanExists(dto.trainingPlanId);
    }

    const updated = await this.prisma.trainingRecord.update({
      where: { id },
      data: {
        employeeId: dto.employeeId,
        trainingPlanId: dto.trainingPlanId,
        completionDate: dto.completionDate,
        certificateUrl: dto.certificateUrl?.trim(),
        certificateExpiry: dto.certificateExpiry,
        score: dto.score,
        notes: dto.notes?.trim(),
      },
      include: {
        employee: { select: { id: true, fullName: true } },
        trainingPlan: { select: { id: true, title: true } },
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'TRAINING_RECORD_UPDATED',
      entityType: 'TRAINING_RECORD',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deleteTrainingRecord(user: AuthUser, id: string) {
    const existing = await this.prisma.trainingRecord.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Training record not found');
    }

    await this.prisma.trainingRecord.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'TRAINING_RECORD_DELETED',
      entityType: 'TRAINING_RECORD',
      entityId: id,
      oldData: existing,
    });

    return { deleted: true };
  }

  async getExpiringSoonRecords() {
    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(now.getDate() + 30);

    const items = await this.prisma.trainingRecord.findMany({
      where: {
        certificateExpiry: {
          gte: now,
          lte: thirtyDaysLater,
        },
      },
      include: {
        employee: { select: { id: true, fullName: true } },
        trainingPlan: { select: { id: true, title: true } },
      },
      orderBy: { certificateExpiry: 'asc' },
    });

    return { items };
  }

  // ─── Helpers ───

  private validateDateRange(startDate: Date, endDate: Date): void {
    if (startDate > endDate) {
      throw new BadRequestException('Start date must not be after end date');
    }
  }

  private async assertEmployeeExists(employeeId: string): Promise<void> {
    const exists = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true },
    });

    if (!exists) {
      throw new BadRequestException('Employee does not exist');
    }
  }

  private async assertTrainingPlanExists(
    trainingPlanId: string,
  ): Promise<void> {
    const exists = await this.prisma.trainingPlan.findUnique({
      where: { id: trainingPlanId },
      select: { id: true },
    });

    if (!exists) {
      throw new BadRequestException('Training plan does not exist');
    }
  }

  private toAuditActor(user: AuthUser): { id: string; role: AuthUser['role'] } {
    return {
      id: user.id,
      role: user.role,
    };
  }
}
