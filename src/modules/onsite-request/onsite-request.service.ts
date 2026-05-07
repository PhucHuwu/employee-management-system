import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OnsiteRequestStatus } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateOnsiteRequestDto } from './dto/create-onsite-request.dto';
import { UpdateOnsiteRequestDto } from './dto/update-onsite-request.dto';

@Injectable()
export class OnsiteRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(user: AuthUser, dto: CreateOnsiteRequestDto) {
    const data = await this.prisma.onsiteRequest.create({
      data: {
        employeeId: dto.employeeId,
        requestDate: new Date(dto.requestDate),
        period: dto.period,
        hours: dto.hours ?? null,
        reason: dto.reason?.trim() ?? null,
      },
      include: { employee: true },
    });

    await this.auditService.log({
      actor: { id: user.id, role: user.role },
      action: 'ONSITE_REQUEST_CREATED',
      entityType: 'ONSITE_REQUEST',
      entityId: data.id,
      newData: data,
    });

    return data;
  }

  async findAll() {
    return this.prisma.onsiteRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { employee: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.onsiteRequest.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!item) throw new NotFoundException('Onsite request not found');
    return item;
  }

  async update(user: AuthUser, id: string, dto: UpdateOnsiteRequestDto) {
    const existing = await this.findOne(id);

    const data = await this.prisma.onsiteRequest.update({
      where: { id },
      data: {
        requestDate: dto.requestDate ? new Date(dto.requestDate) : undefined,
        period: dto.period,
        hours: dto.hours === undefined ? undefined : dto.hours ?? null,
        reason: dto.reason === undefined ? undefined : dto.reason?.trim() ?? null,
      },
      include: { employee: true },
    });

    await this.auditService.log({
      actor: { id: user.id, role: user.role },
      action: 'ONSITE_REQUEST_UPDATED',
      entityType: 'ONSITE_REQUEST',
      entityId: id,
      oldData: existing,
      newData: data,
    });

    return data;
  }

  async approve(user: AuthUser, id: string) {
    const item = await this.findOne(id);
    if (item.status !== OnsiteRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be approved');
    }

    const data = await this.prisma.onsiteRequest.update({
      where: { id },
      data: {
        status: OnsiteRequestStatus.APPROVED,
        approvedBy: user.id,
        approvedAt: new Date(),
      },
      include: { employee: true },
    });

    await this.auditService.log({
      actor: { id: user.id, role: user.role },
      action: 'ONSITE_REQUEST_APPROVED',
      entityType: 'ONSITE_REQUEST',
      entityId: id,
      oldData: { status: item.status },
      newData: { status: data.status, approvedAt: data.approvedAt },
    });

    return data;
  }

  async reject(user: AuthUser, id: string) {
    const item = await this.findOne(id);
    if (item.status !== OnsiteRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    const data = await this.prisma.onsiteRequest.update({
      where: { id },
      data: {
        status: OnsiteRequestStatus.REJECTED,
        approvedBy: user.id,
        approvedAt: new Date(),
      },
      include: { employee: true },
    });

    await this.auditService.log({
      actor: { id: user.id, role: user.role },
      action: 'ONSITE_REQUEST_REJECTED',
      entityType: 'ONSITE_REQUEST',
      entityId: id,
      oldData: { status: item.status },
      newData: { status: data.status, approvedAt: data.approvedAt },
    });

    return data;
  }

  async cancel(user: AuthUser, id: string) {
    const item = await this.findOne(id);
    if (item.status !== OnsiteRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be cancelled');
    }

    const data = await this.prisma.onsiteRequest.update({
      where: { id },
      data: { status: OnsiteRequestStatus.CANCELLED },
      include: { employee: true },
    });

    await this.auditService.log({
      actor: { id: user.id, role: user.role },
      action: 'ONSITE_REQUEST_CANCELLED',
      entityType: 'ONSITE_REQUEST',
      entityId: id,
      oldData: { status: item.status },
      newData: { status: data.status },
    });

    return data;
  }

  async remove(user: AuthUser, id: string) {
    const existing = await this.findOne(id);
    await this.prisma.onsiteRequest.delete({ where: { id } });

    await this.auditService.log({
      actor: { id: user.id, role: user.role },
      action: 'ONSITE_REQUEST_DELETED',
      entityType: 'ONSITE_REQUEST',
      entityId: id,
      oldData: existing,
    });
  }
}
