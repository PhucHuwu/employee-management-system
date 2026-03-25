import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RevenueType } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AddProjectMemberDto } from '../dto/add-project-member.dto';
import { CreateProjectDto } from '../dto/create-project.dto';
import { CreateRevenueDto } from '../dto/create-revenue.dto';
import { ProjectProgressQueryDto } from '../dto/project-progress-query.dto';
import { ProjectQueryDto } from '../dto/project-query.dto';
import { RevenueQueryDto } from '../dto/revenue-query.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { UpdateRevenueDto } from '../dto/update-revenue.dto';
import { UploadProjectDocumentDto } from '../dto/upload-project-document.dto';
import { AuditLogService } from './audit-log.service';
import { STORAGE_ADAPTER, StorageAdapter } from './storage/storage.adapter';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    @Inject(STORAGE_ADAPTER)
    private readonly storageAdapter: StorageAdapter,
  ) {}

  async createProject(dto: CreateProjectDto) {
    this.validateProjectDates(dto.startDate, dto.endDate);

    try {
      return await this.prisma.project.create({
        data: {
          code: dto.code.trim(),
          name: dto.name.trim(),
          status: dto.status,
          startDate: this.toDateOrNull(dto.startDate),
          endDate: this.toDateOrNull(dto.endDate),
          description: dto.description?.trim(),
        },
      });
    } catch (error) {
      this.rethrowPrismaError(error, 'project code already exists');
    }
  }

  async listProjects(query: ProjectQueryDto) {
    const where: Prisma.ProjectWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.keyword?.trim()) {
      const keyword = query.keyword.trim();
      where.OR = [
        { code: { contains: keyword, mode: 'insensitive' } },
        { name: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.size;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        skip,
        take: query.size,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              members: true,
              customers: true,
              documents: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        size: query.size,
        total,
      },
    };
  }

  async getProjectById(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            employee: {
              select: {
                id: true,
                fullName: true,
                employmentStatus: true,
              },
            },
          },
          orderBy: { joinedAt: 'desc' },
        },
        customers: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('project not found');
    }

    return project;
  }

  async updateProject(projectId: string, dto: UpdateProjectDto) {
    await this.ensureProjectExists(projectId);
    this.validateProjectDates(dto.startDate, dto.endDate);

    const oldProject = await this.prisma.project.findUniqueOrThrow({
      where: { id: projectId },
    });

    try {
      const updated = await this.prisma.project.update({
        where: { id: projectId },
        data: {
          code: dto.code?.trim(),
          name: dto.name?.trim(),
          status: dto.status,
          startDate: this.toDateOrUndefined(dto.startDate),
          endDate: this.toDateOrUndefined(dto.endDate),
          description: dto.description?.trim(),
        },
      });

      await this.auditLogService.log({
        action: 'PROJECT_UPDATED',
        entityType: 'Project',
        entityId: projectId,
        oldData: oldProject,
        newData: updated,
      });

      return updated;
    } catch (error) {
      this.rethrowPrismaError(error, 'project code already exists');
    }
  }

  async deleteProject(projectId: string) {
    await this.ensureProjectExists(projectId);

    const [memberCount, customerCount, documentCount, revenueCount, dailyCount] = await this.prisma.$transaction([
      this.prisma.projectMember.count({ where: { projectId } }),
      this.prisma.projectCustomer.count({ where: { projectId } }),
      this.prisma.projectDocument.count({ where: { projectId } }),
      this.prisma.projectRevenue.count({ where: { projectId } }),
      this.prisma.dailyReport.count({ where: { projectId } }),
    ]);

    if (memberCount + customerCount + documentCount + revenueCount + dailyCount > 0) {
      throw new BadRequestException('cannot delete project with related data');
    }

    const deleted = await this.prisma.project.delete({ where: { id: projectId } });

    await this.auditLogService.log({
      action: 'PROJECT_DELETED',
      entityType: 'Project',
      entityId: deleted.id,
      oldData: deleted,
    });

    return { deleted: true };
  }

  async addMember(projectId: string, dto: AddProjectMemberDto) {
    await this.ensureProjectExists(projectId);
    await this.ensureEmployeeExists(dto.employeeId);

    if (dto.joinedAt && dto.leftAt && new Date(dto.leftAt) < new Date(dto.joinedAt)) {
      throw new BadRequestException('leftAt must be greater than or equal to joinedAt');
    }

    try {
      return await this.prisma.projectMember.create({
        data: {
          projectId,
          employeeId: dto.employeeId,
          roleInProject: dto.roleInProject?.trim(),
          joinedAt: this.toDateOrNull(dto.joinedAt),
          leftAt: this.toDateOrNull(dto.leftAt),
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
    } catch (error) {
      this.rethrowPrismaError(error, 'employee is already a member of this project');
    }
  }

  async removeMember(projectId: string, employeeId: string) {
    await this.ensureProjectExists(projectId);

    const membership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_employeeId: {
          projectId,
          employeeId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('project member not found');
    }

    await this.prisma.projectMember.delete({
      where: { id: membership.id },
    });

    return { deleted: true };
  }

  async getProjectDailyProgress(projectId: string, query: ProjectProgressQueryDto) {
    await this.ensureProjectExists(projectId);

    const dateFilters = this.resolveDateRange(query.from, query.to, query.days);
    const where: Prisma.DailyReportWhereInput = {
      projectId,
      employeeId: query.memberId,
      reportDate: dateFilters,
    };

    const skip = (query.page - 1) * query.size;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.dailyReport.findMany({
        where,
        skip,
        take: query.size,
        orderBy: { reportDate: 'desc' },
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      }),
      this.prisma.dailyReport.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        size: query.size,
        total,
      },
    };
  }

  async listRevenues(projectId: string, query: RevenueQueryDto) {
    await this.ensureProjectExists(projectId);

    const where: Prisma.ProjectRevenueWhereInput = {
      projectId,
      periodMonth: query.periodMonth,
      periodYear: query.periodYear,
      revenueType: query.revenueType,
    };

    const skip = (query.page - 1) * query.size;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.projectRevenue.findMany({
        where,
        skip,
        take: query.size,
        orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.projectRevenue.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        size: query.size,
        total,
      },
    };
  }

  async createRevenue(projectId: string, dto: CreateRevenueDto) {
    await this.ensureProjectExists(projectId);
    this.validateRevenue(dto.periodMonth, dto.periodYear, dto.revenueType, dto.amount);

    const revenue = await this.prisma.projectRevenue.create({
      data: {
        projectId,
        periodMonth: dto.periodMonth,
        periodYear: dto.periodYear,
        revenueType: dto.revenueType,
        amount: dto.amount,
        currency: dto.currency.trim().toUpperCase(),
        note: dto.note?.trim(),
      },
    });

    await this.auditLogService.log({
      action: 'PROJECT_REVENUE_CREATED',
      entityType: 'ProjectRevenue',
      entityId: revenue.id,
      newData: revenue,
    });

    return revenue;
  }

  async updateRevenue(projectId: string, revenueId: string, dto: UpdateRevenueDto) {
    await this.ensureProjectExists(projectId);
    const oldRevenue = await this.prisma.projectRevenue.findFirst({
      where: { id: revenueId, projectId },
    });

    if (!oldRevenue) {
      throw new NotFoundException('project revenue not found');
    }

    this.validateRevenue(
      dto.periodMonth ?? oldRevenue.periodMonth,
      dto.periodYear ?? oldRevenue.periodYear,
      dto.revenueType ?? oldRevenue.revenueType,
      dto.amount ?? Number(oldRevenue.amount),
    );

    const updated = await this.prisma.projectRevenue.update({
      where: { id: revenueId },
      data: {
        periodMonth: dto.periodMonth,
        periodYear: dto.periodYear,
        revenueType: dto.revenueType,
        amount: dto.amount,
        currency: dto.currency?.trim().toUpperCase(),
        note: dto.note?.trim(),
      },
    });

    await this.auditLogService.log({
      action: 'PROJECT_REVENUE_UPDATED',
      entityType: 'ProjectRevenue',
      entityId: updated.id,
      oldData: oldRevenue,
      newData: updated,
    });

    return updated;
  }

  async deleteRevenue(projectId: string, revenueId: string) {
    await this.ensureProjectExists(projectId);

    const revenue = await this.prisma.projectRevenue.findFirst({
      where: { id: revenueId, projectId },
    });

    if (!revenue) {
      throw new NotFoundException('project revenue not found');
    }

    await this.prisma.projectRevenue.delete({ where: { id: revenueId } });

    await this.auditLogService.log({
      action: 'PROJECT_REVENUE_DELETED',
      entityType: 'ProjectRevenue',
      entityId: revenue.id,
      oldData: revenue,
    });

    return { deleted: true };
  }

  async uploadDocument(projectId: string, dto: UploadProjectDocumentDto) {
    await this.ensureProjectExists(projectId);

    const content = Buffer.from(dto.contentBase64, 'base64');
    if (content.length === 0) {
      throw new BadRequestException('document content is empty');
    }

    const storageKey = await this.storageAdapter.upload({
      fileName: dto.fileName,
      content,
    });

    const document = await this.prisma.projectDocument.create({
      data: {
        projectId,
        fileName: dto.fileName,
        mimeType: dto.mimeType,
        sizeBytes: BigInt(dto.sizeBytes),
        storageKey,
        uploadedBy: dto.uploadedBy ?? '00000000-0000-0000-0000-000000000000',
      },
    });

    await this.auditLogService.log({
      action: 'PROJECT_DOCUMENT_UPLOADED',
      entityType: 'ProjectDocument',
      entityId: document.id,
      newData: document,
      actorId: dto.uploadedBy,
    });

    return {
      ...document,
      sizeBytes: Number(document.sizeBytes),
    };
  }

  async listDocuments(projectId: string, query: { page: number; size: number }) {
    await this.ensureProjectExists(projectId);

    const skip = (query.page - 1) * query.size;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.projectDocument.findMany({
        where: { projectId },
        skip,
        take: query.size,
        orderBy: { uploadedAt: 'desc' },
      }),
      this.prisma.projectDocument.count({ where: { projectId } }),
    ]);

    return {
      items: items.map((item) => ({ ...item, sizeBytes: Number(item.sizeBytes) })),
      pagination: {
        page: query.page,
        size: query.size,
        total,
      },
    };
  }

  async downloadDocument(projectId: string, documentId: string) {
    await this.ensureProjectExists(projectId);

    const document = await this.prisma.projectDocument.findFirst({
      where: { id: documentId, projectId },
    });

    if (!document) {
      throw new NotFoundException('project document not found');
    }

    const content = await this.storageAdapter.download(document.storageKey);

    return {
      id: document.id,
      fileName: document.fileName,
      mimeType: document.mimeType,
      contentBase64: content.toString('base64'),
    };
  }

  async deleteDocument(projectId: string, documentId: string) {
    await this.ensureProjectExists(projectId);

    const document = await this.prisma.projectDocument.findFirst({
      where: { id: documentId, projectId },
    });

    if (!document) {
      throw new NotFoundException('project document not found');
    }

    await this.storageAdapter.delete(document.storageKey);
    await this.prisma.projectDocument.delete({ where: { id: documentId } });

    await this.auditLogService.log({
      action: 'PROJECT_DOCUMENT_DELETED',
      entityType: 'ProjectDocument',
      entityId: document.id,
      oldData: document,
    });

    return { deleted: true };
  }

  private async ensureProjectExists(projectId: string): Promise<void> {
    const exists = await this.prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException('project not found');
    }
  }

  private async ensureEmployeeExists(employeeId: string): Promise<void> {
    const exists = await this.prisma.employee.findUnique({ where: { id: employeeId }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException('employee not found');
    }
  }

  private validateProjectDates(startDate?: string, endDate?: string): void {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException('endDate must be greater than or equal to startDate');
    }
  }

  private validateRevenue(month: number, year: number, revenueType: RevenueType, amount: number): void {
    if (month < 1 || month > 12) {
      throw new BadRequestException('periodMonth must be in range 1..12');
    }

    if (year < 2000 || year > 2100) {
      throw new BadRequestException('periodYear must be in range 2000..2100');
    }

    if (!Object.values(RevenueType).includes(revenueType)) {
      throw new BadRequestException('revenueType is invalid');
    }

    if (amount < 0) {
      throw new BadRequestException('amount must be greater than or equal to 0');
    }
  }

  private resolveDateRange(from?: string, to?: string, days?: number): Prisma.DateTimeFilter | undefined {
    if (from || to) {
      return {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      };
    }

    if (!days) {
      return undefined;
    }

    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - days + 1);

    return {
      gte: start,
      lte: now,
    };
  }

  private toDateOrNull(value?: string): Date | null {
    if (!value) {
      return null;
    }

    return new Date(value);
  }

  private toDateOrUndefined(value?: string): Date | undefined {
    if (value === undefined) {
      return undefined;
    }

    return new Date(value);
  }

  private rethrowPrismaError(error: unknown, conflictMessage: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException(conflictMessage);
    }

    throw error;
  }
}
