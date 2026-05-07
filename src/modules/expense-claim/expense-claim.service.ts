import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExpenseClaimStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { CreateExpenseClaimDto } from './dto/create-expense-claim.dto';
import { UpdateExpenseClaimDto } from './dto/update-expense-claim.dto';

export interface PagedResult<T> {
  data: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class ExpenseClaimService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateExpenseClaimDto) {
    await this.ensureProjectExists(dto.projectId);
    await this.ensureEmployeeExists(dto.employeeId);

    const claim = await this.prisma.expenseClaim.create({
      data: {
        employeeId: dto.employeeId,
        projectId: dto.projectId,
        amount: dto.amount,
        category: dto.category.trim(),
        description: dto.description?.trim(),
        receiptUrl: dto.receiptUrl?.trim(),
        status: ExpenseClaimStatus.PENDING,
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await this.auditService.log({
      actor: { id: null, role: null },
      action: 'EXPENSE_CLAIM_CREATED',
      entityType: 'ExpenseClaim',
      entityId: claim.id,
      newData: dto,
    });

    return claim;
  }

  async findAll(query: {
    page: number;
    size: number;
    status?: ExpenseClaimStatus;
    projectId?: string;
    employeeId?: string;
  }): Promise<PagedResult<unknown>> {
    const where: Prisma.ExpenseClaimWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.projectId) {
      where.projectId = query.projectId;
    }

    if (query.employeeId) {
      where.employeeId = query.employeeId;
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.expenseClaim.count({ where }),
      this.prisma.expenseClaim.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.size,
        take: query.size,
      }),
    ]);

    return {
      data: rows,
      page: query.page,
      size: query.size,
      total,
      totalPages: Math.ceil(total / query.size) || 1,
    };
  }

  async findOne(id: string) {
    const claim = await this.prisma.expenseClaim.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!claim) {
      throw new NotFoundException('Expense claim not found');
    }

    return claim;
  }

  async update(id: string, dto: UpdateExpenseClaimDto) {
    const existing = await this.prisma.expenseClaim.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Expense claim not found');
    }

    if (existing.status !== ExpenseClaimStatus.PENDING) {
      throw new BadRequestException(
        'Only pending expense claims can be updated',
      );
    }

    const claim = await this.prisma.expenseClaim.update({
      where: { id },
      data: {
        amount: dto.amount,
        category: dto.category?.trim(),
        description: dto.description?.trim(),
        receiptUrl: dto.receiptUrl?.trim(),
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await this.auditService.log({
      actor: { id: null, role: null },
      action: 'EXPENSE_CLAIM_UPDATED',
      entityType: 'ExpenseClaim',
      entityId: claim.id,
      oldData: existing,
      newData: claim,
    });

    return claim;
  }

  async approve(id: string, actorId?: string) {
    const existing = await this.prisma.expenseClaim.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Expense claim not found');
    }

    if (existing.status !== ExpenseClaimStatus.PENDING) {
      throw new BadRequestException(
        'Only pending expense claims can be approved',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const claim = await tx.expenseClaim.update({
        where: { id },
        data: {
          status: ExpenseClaimStatus.APPROVED,
          approvedBy: actorId ?? null,
          approvedAt: new Date(),
        },
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const budget = await tx.projectBudget.findFirst({
        where: {
          projectId: claim.projectId,
          category: claim.category as Prisma.EnumBudgetCategoryFilter,
        },
      });

      if (budget) {
        await tx.projectBudget.update({
          where: { id: budget.id },
          data: {
            actualAmount: {
              increment: claim.amount,
            },
          },
        });
      }

      return claim;
    });

    await this.auditService.log({
      actor: { id: actorId ?? null, role: null },
      action: 'EXPENSE_CLAIM_APPROVED',
      entityType: 'ExpenseClaim',
      entityId: updated.id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async reject(id: string, rejectionReason?: string, actorId?: string) {
    const existing = await this.prisma.expenseClaim.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Expense claim not found');
    }

    if (existing.status !== ExpenseClaimStatus.PENDING) {
      throw new BadRequestException(
        'Only pending expense claims can be rejected',
      );
    }

    const claim = await this.prisma.expenseClaim.update({
      where: { id },
      data: {
        status: ExpenseClaimStatus.REJECTED,
        approvedBy: actorId ?? null,
        approvedAt: new Date(),
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await this.auditService.log({
      actor: { id: actorId ?? null, role: null },
      action: 'EXPENSE_CLAIM_REJECTED',
      entityType: 'ExpenseClaim',
      entityId: claim.id,
      oldData: existing,
      newData: { ...claim, rejectionReason },
    });

    return claim;
  }

  private async ensureProjectExists(projectId: string): Promise<void> {
    const exists = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('Project not found');
    }
  }

  private async ensureEmployeeExists(employeeId: string): Promise<void> {
    const exists = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('Employee not found');
    }
  }
}
