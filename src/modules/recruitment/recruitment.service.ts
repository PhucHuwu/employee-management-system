import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, JobRequisitionStatus, CandidateStatus, InterviewResult, RequisitionType } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@Injectable()
export class RecruitmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ─── Job Requisition ───

  async createJobRequisition(user: AuthUser, dto: CreateJobRequisitionDto) {
    const data: Prisma.JobRequisitionCreateInput = {
      title: dto.title.trim(),
      description: dto.description?.trim(),
      department: dto.department.trim(),
      location: dto.location?.trim(),
      salaryMin: dto.salaryMin ? new Prisma.Decimal(dto.salaryMin) : undefined,
      salaryMax: dto.salaryMax ? new Prisma.Decimal(dto.salaryMax) : undefined,
      status: dto.status ?? JobRequisitionStatus.DRAFT,
      type: dto.type ?? RequisitionType.STAFF,
      requestedBy: dto.requestedBy,
      openedAt: dto.status === JobRequisitionStatus.OPEN ? new Date() : undefined,
      position: dto.positionId ? { connect: { id: dto.positionId } } : undefined,
      subPosition: dto.subPositionId ? { connect: { id: dto.subPositionId } } : undefined,
    };

    const created = await this.prisma.jobRequisition.create({ data });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'JOB_REQUISITION_CREATED',
      entityType: 'JOB_REQUISITION',
      entityId: created.id,
      newData: created,
    });

    return created;
  }

  async getJobRequisitionById(id: string) {
    const record = await this.prisma.jobRequisition.findUnique({
      where: { id },
      include: { _count: { select: { candidates: true } } },
    });

    if (!record) {
      throw new NotFoundException('Job requisition not found');
    }

    return {
      ...record,
      candidateCount: record._count.candidates,
    };
  }

  async listJobRequisitions(query: { status?: JobRequisitionStatus; page: number; size: number }) {
    const where: Prisma.JobRequisitionWhereInput = {
      status: query.status,
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.jobRequisition.count({ where }),
      this.prisma.jobRequisition.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.size,
        take: query.size,
        include: { _count: { select: { candidates: true } } },
      }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        candidateCount: item._count.candidates,
      })),
      pagination: {
        page: query.page,
        size: query.size,
        total,
        totalPages: Math.ceil(total / query.size) || 1,
      },
    };
  }

  async updateJobRequisition(user: AuthUser, id: string, dto: UpdateJobRequisitionDto) {
    const existing = await this.prisma.jobRequisition.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Job requisition not found');
    }

    const data: Prisma.JobRequisitionUpdateInput = {
      title: dto.title?.trim(),
      description: dto.description?.trim(),
      department: dto.department?.trim(),
      location: dto.location?.trim(),
      salaryMin: dto.salaryMin !== undefined ? new Prisma.Decimal(dto.salaryMin) : undefined,
      salaryMax: dto.salaryMax !== undefined ? new Prisma.Decimal(dto.salaryMax) : undefined,
      status: dto.status,
      type: dto.type,
      position: dto.positionId === undefined ? undefined : dto.positionId ? { connect: { id: dto.positionId } } : { disconnect: true },
      subPosition: dto.subPositionId === undefined ? undefined : dto.subPositionId ? { connect: { id: dto.subPositionId } } : { disconnect: true },
    };

    if (dto.status === JobRequisitionStatus.OPEN && existing.status !== JobRequisitionStatus.OPEN) {
      data.openedAt = new Date();
    }

    if (
      (dto.status === JobRequisitionStatus.CLOSED || dto.status === JobRequisitionStatus.FILLED) &&
      existing.status !== JobRequisitionStatus.CLOSED &&
      existing.status !== JobRequisitionStatus.FILLED
    ) {
      data.closedAt = new Date();
    }

    const updated = await this.prisma.jobRequisition.update({ where: { id }, data });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'JOB_REQUISITION_UPDATED',
      entityType: 'JOB_REQUISITION',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deleteJobRequisition(user: AuthUser, id: string) {
    const existing = await this.prisma.jobRequisition.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Job requisition not found');
    }

    await this.prisma.jobRequisition.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'JOB_REQUISITION_DELETED',
      entityType: 'JOB_REQUISITION',
      entityId: id,
      oldData: existing,
    });

    return { deleted: true };
  }

  // ─── Candidate ───

  async createCandidate(user: AuthUser, dto: CreateCandidateDto) {
    await this.assertJobRequisitionExists(dto.jobRequisitionId);

    const created = await this.prisma.candidate.create({
      data: {
        fullName: dto.fullName.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim(),
        resumeUrl: dto.resumeUrl?.trim(),
        cvUrl: dto.cvUrl?.trim(),
        avatarUrl: dto.avatarUrl?.trim(),
        source: dto.source?.trim(),
        status: dto.status ?? CandidateStatus.NEW,
        notes: dto.notes?.trim(),
        jobRequisitionId: dto.jobRequisitionId,
        educationId: dto.educationId,
        branchId: dto.branchId,
        cvSourceId: dto.cvSourceId,
        assignTo: dto.assignTo,
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'CANDIDATE_CREATED',
      entityType: 'CANDIDATE',
      entityId: created.id,
      newData: created,
    });

    return created;
  }

  async getCandidateById(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        jobRequisition: { select: { id: true, title: true } },
        interviews: { orderBy: { scheduledAt: 'desc' } },
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  async listCandidates(query: {
    jobRequisitionId?: string;
    status?: CandidateStatus;
    page: number;
    size: number;
  }) {
    const where: Prisma.CandidateWhereInput = {
      jobRequisitionId: query.jobRequisitionId,
      status: query.status,
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.candidate.count({ where }),
      this.prisma.candidate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.size,
        take: query.size,
        include: {
          jobRequisition: { select: { id: true, title: true } },
          interviews: { orderBy: { scheduledAt: 'desc' } },
        },
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

  async updateCandidate(user: AuthUser, id: string, dto: UpdateCandidateDto) {
    const existing = await this.prisma.candidate.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Candidate not found');
    }

    if (dto.jobRequisitionId) {
      await this.assertJobRequisitionExists(dto.jobRequisitionId);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const candidate = await tx.candidate.update({
        where: { id },
        data: {
          fullName: dto.fullName?.trim(),
          email: dto.email?.trim().toLowerCase(),
          phone: dto.phone?.trim(),
          resumeUrl: dto.resumeUrl?.trim(),
          cvUrl: dto.cvUrl?.trim(),
          avatarUrl: dto.avatarUrl?.trim(),
          source: dto.source?.trim(),
          status: dto.status,
          notes: dto.notes?.trim(),
          jobRequisitionId: dto.jobRequisitionId,
          educationId: dto.educationId,
          branchId: dto.branchId,
          cvSourceId: dto.cvSourceId,
          assignTo: dto.assignTo,
        },
      });

      if (dto.status === CandidateStatus.ONBOARDED && existing.status !== CandidateStatus.ONBOARDED) {
        await tx.jobRequisition.update({
          where: { id: candidate.jobRequisitionId },
          data: { status: JobRequisitionStatus.FILLED, closedAt: new Date() },
        });
      }

      return candidate;
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'CANDIDATE_UPDATED',
      entityType: 'CANDIDATE',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    if (dto.status === CandidateStatus.ONBOARDED && existing.status !== CandidateStatus.ONBOARDED) {
      await this.auditService.log({
        actor: this.toAuditActor(user),
        action: 'CANDIDATE_ONBOARDED',
        entityType: 'CANDIDATE',
        entityId: id,
        newData: { status: CandidateStatus.ONBOARDED },
      });
    }

    return updated;
  }

  async deleteCandidate(user: AuthUser, id: string) {
    const existing = await this.prisma.candidate.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Candidate not found');
    }

    await this.prisma.candidate.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'CANDIDATE_DELETED',
      entityType: 'CANDIDATE',
      entityId: id,
      oldData: existing,
    });

    return { deleted: true };
  }

  // ─── Interview ───

  async createInterview(user: AuthUser, dto: CreateInterviewDto) {
    await this.assertCandidateExists(dto.candidateId);

    const created = await this.prisma.interview.create({
      data: {
        scheduledAt: dto.scheduledAt,
        round: dto.round ?? 1,
        interviewer: dto.interviewer.trim(),
        result: dto.result ?? InterviewResult.PENDING,
        score: dto.score,
        notes: dto.notes?.trim(),
        candidateId: dto.candidateId,
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'INTERVIEW_CREATED',
      entityType: 'INTERVIEW',
      entityId: created.id,
      newData: created,
    });

    return created;
  }

  async getInterviewById(id: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        candidate: { select: { id: true, fullName: true } },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const jobRequisition = await this.prisma.jobRequisition.findFirst({
      where: { candidates: { some: { id: interview.candidateId } } },
      select: { id: true, title: true },
    });

    return {
      ...interview,
      jobRequisition,
    };
  }

  async listInterviews(query: { candidateId?: string; page: number; size: number }) {
    const where: Prisma.InterviewWhereInput = {
      candidateId: query.candidateId,
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.interview.count({ where }),
      this.prisma.interview.findMany({
        where,
        orderBy: { scheduledAt: 'desc' },
        skip: (query.page - 1) * query.size,
        take: query.size,
        include: {
          candidate: { select: { id: true, fullName: true } },
        },
      }),
    ]);

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const jobRequisition = await this.prisma.jobRequisition.findFirst({
          where: { candidates: { some: { id: item.candidateId } } },
          select: { id: true, title: true },
        });
        return { ...item, jobRequisition };
      }),
    );

    return {
      items: enrichedItems,
      pagination: {
        page: query.page,
        size: query.size,
        total,
        totalPages: Math.ceil(total / query.size) || 1,
      },
    };
  }

  async updateInterview(user: AuthUser, id: string, dto: UpdateInterviewDto) {
    const existing = await this.prisma.interview.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Interview not found');
    }

    const updated = await this.prisma.interview.update({
      where: { id },
      data: {
        scheduledAt: dto.scheduledAt,
        round: dto.round,
        interviewer: dto.interviewer?.trim(),
        result: dto.result,
        score: dto.score,
        notes: dto.notes?.trim(),
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'INTERVIEW_UPDATED',
      entityType: 'INTERVIEW',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    if (dto.result === InterviewResult.PASSED && existing.result !== InterviewResult.PASSED) {
      const isFinalRound = dto.round !== undefined ? dto.round >= 3 : existing.round >= 3;
      if (isFinalRound) {
        const candidate = await this.prisma.candidate.findUnique({
          where: { id: existing.candidateId },
          select: { status: true },
        });

        if (candidate && candidate.status !== CandidateStatus.ACCEPTED_OFFER && candidate.status !== CandidateStatus.ONBOARDED) {
          await this.prisma.candidate.update({
            where: { id: existing.candidateId },
            data: { status: CandidateStatus.ACCEPTED_OFFER },
          });

          await this.auditService.log({
            actor: this.toAuditActor(user),
            action: 'CANDIDATE_ACCEPTED_OFFER',
            entityType: 'CANDIDATE',
            entityId: existing.candidateId,
            newData: { status: CandidateStatus.ACCEPTED_OFFER },
          });
        }
      }
    }

    return updated;
  }

  async deleteInterview(user: AuthUser, id: string) {
    const existing = await this.prisma.interview.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Interview not found');
    }

    await this.prisma.interview.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'INTERVIEW_DELETED',
      entityType: 'INTERVIEW',
      entityId: id,
      oldData: existing,
    });

    return { deleted: true };
  }

  async assignCandidateToRequisition(user: AuthUser, candidateId: string, jobRequisitionId: string) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) throw new NotFoundException('Candidate not found');
    await this.assertJobRequisitionExists(jobRequisitionId);

    const updated = await this.prisma.candidate.update({
      where: { id: candidateId },
      data: { jobRequisitionId },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'CANDIDATE_ASSIGNED_TO_REQUISITION',
      entityType: 'CANDIDATE',
      entityId: candidateId,
      newData: { jobRequisitionId },
    });

    return updated;
  }

  async closeRequisition(user: AuthUser, id: string) {
    const existing = await this.prisma.jobRequisition.findUnique({
      where: { id },
      include: { candidates: { select: { id: true, status: true } } },
    });

    if (!existing) throw new NotFoundException('Job requisition not found');

    const terminalStatuses: CandidateStatus[] = [
      CandidateStatus.FAILED_TEST,
      CandidateStatus.FAILED_INTERVIEW,
      CandidateStatus.REJECTED_INTERVIEW,
      CandidateStatus.REJECTED_OFFER,
      CandidateStatus.ONBOARDED,
      CandidateStatus.REJECTED_TEST,
      CandidateStatus.REJECTED_APPLY,
    ];

    const activeCandidates = existing.candidates.filter((c) => !terminalStatuses.includes(c.status));
    if (activeCandidates.length > 0) {
      throw new BadRequestException('Cannot close requisition with active candidates');
    }

    const updated = await this.prisma.jobRequisition.update({
      where: { id },
      data: { status: JobRequisitionStatus.CLOSED, closedAt: new Date() },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'JOB_REQUISITION_CLOSED',
      entityType: 'JOB_REQUISITION',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async cloneRequisition(user: AuthUser, id: string) {
    const existing = await this.prisma.jobRequisition.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Job requisition not found');

    const cloned = await this.prisma.jobRequisition.create({
      data: {
        title: `${existing.title} (Clone)`,
        description: existing.description,
        department: existing.department,
        location: existing.location,
        salaryMin: existing.salaryMin,
        salaryMax: existing.salaryMax,
        status: JobRequisitionStatus.DRAFT,
        type: existing.type,
        requestedBy: user.id,
        positionId: existing.positionId,
        subPositionId: existing.subPositionId,
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'JOB_REQUISITION_CLONED',
      entityType: 'JOB_REQUISITION',
      entityId: cloned.id,
      newData: cloned,
    });

    return cloned;
  }

  // ─── Helpers ───

  private toAuditActor(user: AuthUser): { id: string; role: Role } {
    return {
      id: user.id,
      role: user.role,
    };
  }

  private async assertJobRequisitionExists(id: string): Promise<void> {
    const exists = await this.prisma.jobRequisition.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new BadRequestException('Job requisition does not exist');
    }
  }

  private async assertCandidateExists(id: string): Promise<void> {
    const exists = await this.prisma.candidate.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new BadRequestException('Candidate does not exist');
    }
  }
}
