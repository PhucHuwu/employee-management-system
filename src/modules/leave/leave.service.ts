import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ScheduleRequestType } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { CreateLeaveBalanceDto } from './dto/create-leave-balance.dto';
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto';

export interface PagedResult<T> {
  data: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listLeaveBalances(query: {
    page: number;
    size: number;
  }): Promise<PagedResult<unknown>> {
    const { page, size } = query;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.leaveBalance.count(),
      this.prisma.leaveBalance.findMany({
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
    ]);

    return {
      data: rows,
      page,
      size,
      total,
      totalPages: Math.ceil(total / size) || 1,
    };
  }

  async getLeaveBalance(
    employeeId: string,
    year: number,
  ): Promise<unknown> {
    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_year: {
          employeeId,
          year,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!balance) {
      throw new NotFoundException('Leave balance not found');
    }

    return balance;
  }

  async createLeaveBalance(dto: CreateLeaveBalanceDto): Promise<unknown> {
    const existing = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_year: {
          employeeId: dto.employeeId,
          year: dto.year,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Leave balance already exists for this employee and year',
      );
    }

    const balance = await this.prisma.leaveBalance.create({
      data: {
        employeeId: dto.employeeId,
        year: dto.year,
        annualLeave: dto.annualLeave,
        sickLeave: dto.sickLeave,
      },
    });

    await this.auditService.log({
      actor: { id: null, role: null },
      action: 'LEAVE_BALANCE_CREATED',
      entityType: 'LEAVE_BALANCE',
      entityId: balance.id,
      newData: dto,
    });

    return balance;
  }

  async updateLeaveBalance(
    id: string,
    dto: UpdateLeaveBalanceDto,
  ): Promise<unknown> {
    const existing = await this.prisma.leaveBalance.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Leave balance not found');
    }

    const balance = await this.prisma.leaveBalance.update({
      where: { id },
      data: {
        annualLeave: dto.annualLeave,
        sickLeave: dto.sickLeave,
      },
    });

    await this.auditService.log({
      actor: { id: null, role: null },
      action: 'LEAVE_BALANCE_UPDATED',
      entityType: 'LEAVE_BALANCE',
      entityId: balance.id,
      oldData: existing,
      newData: balance,
    });

    return balance;
  }

  async listTransactions(
    employeeId: string,
    query: { page: number; size: number },
  ): Promise<PagedResult<unknown>> {
    const { page, size } = query;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.leaveTransaction.count({ where: { employeeId } }),
      this.prisma.leaveTransaction.findMany({
        where: { employeeId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
    ]);

    return {
      data: rows,
      page,
      size,
      total,
      totalPages: Math.ceil(total / size) || 1,
    };
  }

  async deductLeaveOnApproval(
    tx: Prisma.TransactionClient,
    employeeId: string,
    requestType: ScheduleRequestType,
    requestDate: Date,
  ): Promise<void> {
    const year = requestDate.getFullYear();

    let balance = await tx.leaveBalance.findUnique({
      where: {
        employeeId_year: {
          employeeId,
          year,
        },
      },
    });

    if (!balance) {
      balance = await tx.leaveBalance.create({
        data: {
          employeeId,
          year,
          annualLeave: 12,
          sickLeave: 6,
          unpaidTaken: 0,
        },
      });
    }

    const deduction =
      requestType === ScheduleRequestType.OFF_FULL_DAY ? 1 : 0.5;

    let newAnnualLeave = balance.annualLeave;
    let newSickLeave = balance.sickLeave;
    let newUnpaidTaken = balance.unpaidTaken;

    if (newAnnualLeave >= deduction) {
      newAnnualLeave -= deduction;
    } else if (newSickLeave >= deduction) {
      newSickLeave -= deduction;
    } else {
      newUnpaidTaken += deduction;
    }

    await tx.leaveBalance.update({
      where: { id: balance.id },
      data: {
        annualLeave: newAnnualLeave,
        sickLeave: newSickLeave,
        unpaidTaken: newUnpaidTaken,
      },
    });

    await tx.leaveTransaction.create({
      data: {
        employeeId,
        year,
        days: deduction,
        type: requestType,
        description: `Deducted ${deduction} day(s) for ${requestType}`,
      },
    });
  }
}
