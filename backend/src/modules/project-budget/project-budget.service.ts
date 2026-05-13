import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, BudgetCategory } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { CreateProjectBudgetDto } from './dto/create-project-budget.dto';
import { UpdateProjectBudgetDto } from './dto/update-project-budget.dto';

export interface PagedResult<T> {
  data: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class ProjectBudgetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateProjectBudgetDto) {
    await this.ensureProjectExists(dto.projectId);

    const budget = await this.prisma.projectBudget.create({
      data: {
        projectId: dto.projectId,
        category: dto.category,
        budgetedAmount: dto.budgetedAmount,
        actualAmount: 0,
        note: dto.note?.trim(),
      },
      include: {
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
      action: 'PROJECT_BUDGET_CREATED',
      entityType: 'ProjectBudget',
      entityId: budget.id,
      newData: dto,
    });

    return budget;
  }

  async findAll(query: {
    page: number;
    size: number;
    projectId?: string;
  }): Promise<PagedResult<unknown>> {
    const where: Prisma.ProjectBudgetWhereInput = {};

    if (query.projectId) {
      where.projectId = query.projectId;
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.projectBudget.count({ where }),
      this.prisma.projectBudget.findMany({
        where,
        include: {
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
    const budget = await this.prisma.projectBudget.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!budget) {
      throw new NotFoundException('Project budget not found');
    }

    return budget;
  }

  async update(id: string, dto: UpdateProjectBudgetDto) {
    const existing = await this.prisma.projectBudget.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Project budget not found');
    }

    const budget = await this.prisma.projectBudget.update({
      where: { id },
      data: {
        category: dto.category,
        budgetedAmount: dto.budgetedAmount,
        note: dto.note?.trim(),
      },
      include: {
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
      action: 'PROJECT_BUDGET_UPDATED',
      entityType: 'ProjectBudget',
      entityId: budget.id,
      oldData: existing,
      newData: budget,
    });

    return budget;
  }

  async remove(id: string) {
    const existing = await this.prisma.projectBudget.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Project budget not found');
    }

    await this.prisma.projectBudget.delete({ where: { id } });

    await this.auditService.log({
      actor: { id: null, role: null },
      action: 'PROJECT_BUDGET_DELETED',
      entityType: 'ProjectBudget',
      entityId: id,
      oldData: existing,
    });

    return { deleted: true };
  }

  async getBudgetVsActual(projectId: string) {
    await this.ensureProjectExists(projectId);

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const budgets = await this.prisma.projectBudget.findMany({
      where: { projectId },
    });

    const revenues = await this.prisma.projectRevenue.findMany({
      where: {
        projectId,
        revenueType: 'ACTUAL',
      },
    });

    const totalRevenue = revenues.reduce((sum, r) => sum + Number(r.amount), 0);

    const budgetRows = budgets.map((b) => ({
      category: b.category,
      budgeted: Number(b.budgetedAmount),
      actual: Number(b.actualAmount),
      variance: Number(b.budgetedAmount) - Number(b.actualAmount),
    }));

    const totalBudgeted = budgetRows.reduce((sum, b) => sum + b.budgeted, 0);
    const totalActual = budgetRows.reduce((sum, b) => sum + b.actual, 0);

    return {
      projectId: project.id,
      projectName: project.name,
      budgets: budgetRows,
      totalBudgeted,
      totalActual,
      totalRevenue,
    };
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
}
