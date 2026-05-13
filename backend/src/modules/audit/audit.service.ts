import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

export interface AuditActor {
  id: string | null;
  role: Role | null;
}

export interface CreateAuditLogInput {
  actor: AuditActor;
  action: string;
  entityType: string;
  entityId: string;
  oldData?: unknown;
  newData?: unknown;
}

export interface AuditQueryInput {
  entityType?: string;
  entityId?: string;
  action?: string;
  from?: Date;
  to?: Date;
  page: number;
  size: number;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: CreateAuditLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorId: input.actor.id,
        actorRole: input.actor.role,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldData: this.toPrismaJsonInput(input.oldData),
        newData: this.toPrismaJsonInput(input.newData),
      },
    });
  }

  async logAction(input: CreateAuditLogInput): Promise<void> {
    await this.log(input);
  }

  async findLogs(query: AuditQueryInput) {
    const where: Prisma.AuditLogWhereInput = {
      entityType: query.entityType,
      entityId: query.entityId,
      action: query.action,
      createdAt:
        query.from || query.to
          ? {
              gte: query.from,
              lte: query.to,
            }
          : undefined,
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.size,
        take: query.size,
      }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        size: query.size,
        total,
        totalPages: Math.ceil(total / query.size) || 1,
      },
    };
  }

  private toPrismaJsonInput(
    value: unknown,
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return Prisma.JsonNull;
    }

    return this.toSerializable(value) as Prisma.InputJsonValue;
  }

  private toSerializable(value: unknown): unknown {
    if (value === null) {
      return null;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.toSerializable(item));
    }

    if (typeof value === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
        result[key] = this.toSerializable(nestedValue);
      }
      return result;
    }

    return String(value);
  }
}
