import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateJobTitleDto } from './dto/create-job-title.dto';
import { PromoteEmployeeDto } from './dto/promote-employee.dto';
import { UpdateJobTitleDto } from './dto/update-job-title.dto';

@Injectable()
export class JobTitleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listJobTitles() {
    return this.prisma.jobTitle.findMany({
      orderBy: [{ levelOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createJobTitle(dto: CreateJobTitleDto) {
    return this.prisma.jobTitle.create({
      data: {
        name: dto.name.trim(),
        levelOrder: dto.levelOrder,
        description: dto.description?.trim(),
        active: dto.active ?? true,
      },
    });
  }

  async updateJobTitle(id: string, dto: UpdateJobTitleDto) {
    const existing = await this.prisma.jobTitle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Job title not found');
    }

    return this.prisma.jobTitle.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        levelOrder: dto.levelOrder,
        description: dto.description?.trim(),
        active: dto.active,
      },
    });
  }

  async deleteJobTitle(id: string) {
    const inUse = await this.prisma.employeeTitleHistory.count({
      where: {
        OR: [{ oldJobTitleId: id }, { newJobTitleId: id }],
      },
    });

    if (inUse > 0) {
      throw new BadRequestException('Cannot delete job title referenced by promotion history');
    }

    await this.prisma.jobTitle.delete({ where: { id } });
    return { deleted: true };
  }

  async promoteEmployee(user: AuthUser, employeeId: string, dto: PromoteEmployeeDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        titleHistories: {
          orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
          take: 1,
          include: {
            newJobTitle: true,
          },
        },
      },
    });

    if (!employee || employee.deletedAt) {
      throw new NotFoundException('Employee not found');
    }

    const newJobTitle = await this.prisma.jobTitle.findUnique({
      where: { id: dto.newJobTitleId },
    });
    if (!newJobTitle) {
      throw new NotFoundException('Target job title not found');
    }

    const currentHistory = employee.titleHistories[0];
    const oldJobTitleId = currentHistory?.newJobTitleId ?? null;
    const currentLevelOrder = currentHistory?.newJobTitle?.levelOrder;

    if (
      dto.strictPolicy &&
      currentLevelOrder !== undefined &&
      newJobTitle.levelOrder <= currentLevelOrder
    ) {
      throw new BadRequestException(
        'Strict policy violation: new job title must have higher level order',
      );
    }

    const duplicate = await this.prisma.employeeTitleHistory.findUnique({
      where: {
        employeeId_effectiveDate: {
          employeeId,
          effectiveDate: dto.effectiveDate,
        },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new ConflictException('Promotion with this effectiveDate already exists');
    }

    const created = await this.prisma.employeeTitleHistory.create({
      data: {
        employeeId,
        oldJobTitleId,
        newJobTitleId: dto.newJobTitleId,
        effectiveDate: dto.effectiveDate,
        reason: dto.reason?.trim(),
        createdBy: user.id,
      },
      include: {
        oldJobTitle: true,
        newJobTitle: true,
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'EMPLOYEE_PROMOTED',
      entityType: 'EMPLOYEE',
      entityId: employeeId,
      oldData: {
        oldJobTitleId,
        oldLevelOrder: currentLevelOrder,
      },
      newData: {
        newJobTitleId: dto.newJobTitleId,
        newLevelOrder: newJobTitle.levelOrder,
        effectiveDate: dto.effectiveDate.toISOString(),
        reason: dto.reason,
      },
    });

    return created;
  }

  async getEmployeePromotions(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.prisma.employeeTitleHistory.findMany({
      where: { employeeId },
      include: {
        oldJobTitle: true,
        newJobTitle: true,
      },
      orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  private toAuditActor(user: AuthUser): { id: string; role: Role } {
    return {
      id: user.id,
      role: user.role,
    };
  }
}
