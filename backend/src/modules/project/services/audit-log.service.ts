import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

interface AuditPayload {
  action: string;
  entityType: string;
  entityId: string;
  oldData?: unknown;
  newData?: unknown;
  actorId?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(payload: AuditPayload): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        oldData: payload.oldData as object | undefined,
        newData: payload.newData as object | undefined,
        actorId: payload.actorId,
      },
    });
  }
}
