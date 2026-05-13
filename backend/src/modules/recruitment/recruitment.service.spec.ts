import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, JobRequisitionStatus, CandidateStatus, RequisitionType, InterviewResult } from '@prisma/client';
import { RecruitmentService } from './recruitment.service';

describe('RecruitmentService', () => {
  const user = {
    id: '00000000-0000-0000-0000-000000000900',
    role: 'ADMIN' as const,
  };

  function setup() {
    const prisma = {
      jobRequisition: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      candidate: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        updateMany: jest.fn(),
      },
      interview: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation(async (arg: unknown): Promise<unknown> => {
      if (Array.isArray(arg)) {
        return Promise.all(arg as Promise<unknown>[]);
      }
      if (typeof arg === 'function') {
        const callback = arg as (tx: typeof prisma) => Promise<unknown>;
        return callback(prisma);
      }
      return arg;
    });

    const auditService = { log: jest.fn() };
    const service = new RecruitmentService(prisma as never, auditService as never);
    return { service, prisma, auditService };
  }

  // ─── Job Requisition ───

  describe('createJobRequisition', () => {
    it('creates with correct trimmed data and defaults', async () => {
      const { service, prisma, auditService } = setup();
      prisma.jobRequisition.create.mockResolvedValue({ id: 'jr1' });

      const result = await service.createJobRequisition(user, {
        title: '  Engineer  ',
        description: '  desc  ',
        department: '  Eng  ',
        location: '  HN  ',
        salaryMin: 1000,
        salaryMax: 2000,
        status: JobRequisitionStatus.DRAFT,
        type: RequisitionType.STAFF,
        requestedBy: user.id,
      } as never);

      expect(result).toEqual({ id: 'jr1' });
      const data = ((prisma.jobRequisition.create.mock.calls[0] as unknown[])[0] as unknown) as { data: Record<string, unknown> };
      expect(data.data.title).toBe('Engineer');
      expect(data.data.description).toBe('desc');
      expect(data.data.department).toBe('Eng');
      expect(data.data.location).toBe('HN');
      expect(data.data.salaryMin).toBeInstanceOf(Prisma.Decimal);
      expect(data.data.salaryMax).toBeInstanceOf(Prisma.Decimal);
      expect(auditService.log).toHaveBeenCalled();
    });

    it('sets openedAt when status is OPEN', async () => {
      const { service, prisma } = setup();
      prisma.jobRequisition.create.mockResolvedValue({ id: 'jr2' });

      await service.createJobRequisition(user, {
        title: 'Title',
        department: 'Dept',
        status: JobRequisitionStatus.OPEN,
      } as never);

      const data = ((prisma.jobRequisition.create.mock.calls[0] as unknown[])[0] as unknown) as { data: Record<string, unknown> };
      expect(data.data.openedAt).toBeInstanceOf(Date);
    });
  });

  describe('getJobRequisitionById', () => {
    it('returns requisition with candidateCount', async () => {
      const { service, prisma } = setup();
      prisma.jobRequisition.findUnique.mockResolvedValue({
        id: 'jr1',
        title: 'Title',
        _count: { candidates: 5 },
      } as never);

      const result = await service.getJobRequisitionById('jr1');
      expect(result.candidateCount).toBe(5);
    });

    it('throws NotFoundException when missing', async () => {
      const { service, prisma } = setup();
      prisma.jobRequisition.findUnique.mockResolvedValue(null);

      await expect(service.getJobRequisitionById('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('listJobRequisitions', () => {
    it('returns paginated results with candidateCount', async () => {
      const { service, prisma } = setup();
      prisma.jobRequisition.count.mockResolvedValue(10);
      prisma.jobRequisition.findMany.mockResolvedValue([
        { id: 'jr1', _count: { candidates: 2 } },
        { id: 'jr2', _count: { candidates: 0 } },
      ] as never);

      const result = await service.listJobRequisitions({ status: JobRequisitionStatus.OPEN, page: 1, size: 2 });

      expect(result.items).toHaveLength(2);
      expect(result.items[0].candidateCount).toBe(2);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.totalPages).toBe(5);
    });
  });

  describe('updateJobRequisition', () => {
    it('updates fields and sets openedAt when transitioning to OPEN', async () => {
      const { service, prisma } = setup();
      prisma.jobRequisition.findUnique.mockResolvedValue({ id: 'jr1', status: JobRequisitionStatus.DRAFT } as never);
      prisma.jobRequisition.update.mockResolvedValue({ id: 'jr1', status: JobRequisitionStatus.OPEN } as never);

      await service.updateJobRequisition(user, 'jr1', { status: JobRequisitionStatus.OPEN } as never);

      const data = ((prisma.jobRequisition.update.mock.calls[0] as unknown[])[0] as unknown) as { data: Record<string, unknown> };
      expect(data.data.openedAt).toBeInstanceOf(Date);
    });

    it('sets closedAt when transitioning to CLOSED', async () => {
      const { service, prisma } = setup();
      prisma.jobRequisition.findUnique.mockResolvedValue({ id: 'jr1', status: JobRequisitionStatus.OPEN } as never);
      prisma.jobRequisition.update.mockResolvedValue({ id: 'jr1', status: JobRequisitionStatus.CLOSED } as never);

      await service.updateJobRequisition(user, 'jr1', { status: JobRequisitionStatus.CLOSED } as never);

      const data = ((prisma.jobRequisition.update.mock.calls[0] as unknown[])[0] as unknown) as { data: Record<string, unknown> };
      expect(data.data.closedAt).toBeInstanceOf(Date);
    });

    it('throws NotFoundException when missing', async () => {
      const { service, prisma } = setup();
      prisma.jobRequisition.findUnique.mockResolvedValue(null);

      await expect(service.updateJobRequisition(user, 'missing', {} as never)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('deleteJobRequisition', () => {
    it('deletes and logs audit', async () => {
      const { service, prisma, auditService } = setup();
      prisma.jobRequisition.findUnique.mockResolvedValue({ id: 'jr1' } as never);
      prisma.jobRequisition.delete.mockResolvedValue({ id: 'jr1' } as never);

      const result = await service.deleteJobRequisition(user, 'jr1');
      expect(result).toEqual({ deleted: true });
      expect(prisma.jobRequisition.delete).toHaveBeenCalledWith({ where: { id: 'jr1' } });
      expect(auditService.log).toHaveBeenCalled();
    });

    it('throws NotFoundException when missing', async () => {
      const { service, prisma } = setup();
      prisma.jobRequisition.findUnique.mockResolvedValue(null);

      await expect(service.deleteJobRequisition(user, 'missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ─── Candidate ───

  describe('createCandidate', () => {
    it('creates with trimmed fields', async () => {
      const { service, prisma } = setup();
      prisma.jobRequisition.findUnique.mockResolvedValue({ id: 'jr1' } as never);
      prisma.candidate.create.mockResolvedValue({ id: 'c1' } as never);

      await service.createCandidate(user, {
        fullName: '  John Doe  ',
        email: '  John@EXAMPLE.COM  ',
        phone: '  123  ',
        resumeUrl: '  http://r  ',
        cvUrl: '  http://cv  ',
        avatarUrl: '  http://a  ',
        source: '  LinkedIn  ',
        notes: '  notes  ',
        jobRequisitionId: 'jr1',
      } as never);

      const data = ((prisma.candidate.create.mock.calls[0] as unknown[])[0] as unknown) as { data: Record<string, unknown> };
      expect(data.data.fullName).toBe('John Doe');
      expect(data.data.email).toBe('john@example.com');
      expect(data.data.phone).toBe('123');
      expect(data.data.resumeUrl).toBe('http://r');
      expect(data.data.cvUrl).toBe('http://cv');
      expect(data.data.avatarUrl).toBe('http://a');
      expect(data.data.source).toBe('LinkedIn');
      expect(data.data.notes).toBe('notes');
    });

    it('throws BadRequestException when requisition does not exist', async () => {
      const { service, prisma } = setup();
      prisma.jobRequisition.findUnique.mockResolvedValue(null);

      await expect(service.createCandidate(user, { jobRequisitionId: 'missing' } as never)).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('getCandidateById', () => {
    it('returns candidate with jobRequisition and interviews', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue({
        id: 'c1',
        jobRequisition: { id: 'jr1', title: 'Title' },
        interviews: [],
      } as never);

      const result = await service.getCandidateById('c1');
      expect(result.jobRequisition).toEqual({ id: 'jr1', title: 'Title' });
    });

    it('throws NotFoundException when missing', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue(null);

      await expect(service.getCandidateById('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('listCandidates', () => {
    it('returns paginated results with filters', async () => {
      const { service, prisma } = setup();
      prisma.candidate.count.mockResolvedValue(5);
      prisma.candidate.findMany.mockResolvedValue([{ id: 'c1' }] as never);

      const result = await service.listCandidates({ jobRequisitionId: 'jr1', status: CandidateStatus.NEW, page: 1, size: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(5);
    });
  });

  describe('updateCandidate', () => {
    it('updates fields', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue({ id: 'c1', status: CandidateStatus.NEW, jobRequisitionId: 'jr1' } as never);
      prisma.candidate.update.mockResolvedValue({ id: 'c1' } as never);

      await service.updateCandidate(user, 'c1', { fullName: 'Updated' } as never);

      expect(prisma.candidate.update).toHaveBeenCalled();
    });

    it('fills requisition when onboarded', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue({ id: 'c1', status: CandidateStatus.ACCEPTED_OFFER, jobRequisitionId: 'jr1' } as never);
      prisma.candidate.update.mockResolvedValue({ id: 'c1', status: CandidateStatus.ONBOARDED, jobRequisitionId: 'jr1' } as never);

      await service.updateCandidate(user, 'c1', { status: CandidateStatus.ONBOARDED } as never);

      expect(prisma.jobRequisition.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: JobRequisitionStatus.FILLED }),
        }),
      );
    });

    it('throws NotFoundException when candidate missing', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue(null);

      await expect(service.updateCandidate(user, 'missing', {} as never)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('deleteCandidate', () => {
    it('deletes and logs audit', async () => {
      const { service, prisma, auditService } = setup();
      prisma.candidate.findUnique.mockResolvedValue({ id: 'c1' } as never);
      prisma.candidate.delete.mockResolvedValue({ id: 'c1' } as never);

      const result = await service.deleteCandidate(user, 'c1');
      expect(result).toEqual({ deleted: true });
      expect(auditService.log).toHaveBeenCalled();
    });

    it('throws NotFoundException when missing', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue(null);

      await expect(service.deleteCandidate(user, 'missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('assignCandidateToRequisition', () => {
    it('updates jobRequisitionId', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue({ id: 'c1' } as never);
      prisma.jobRequisition.findUnique.mockResolvedValue({ id: 'jr2' } as never);
      prisma.candidate.update.mockResolvedValue({ id: 'c1', jobRequisitionId: 'jr2' } as never);

      const result = await service.assignCandidateToRequisition(user, 'c1', 'jr2');
      expect(result.jobRequisitionId).toBe('jr2');
    });

    it('throws NotFoundException when candidate missing', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue(null);

      await expect(service.assignCandidateToRequisition(user, 'missing', 'jr1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('cloneCandidate', () => {
    it('creates new candidate with status NEW', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue({
        id: 'c1',
        fullName: 'John',
        email: 'john@example.com',
        status: CandidateStatus.ONBOARDED,
      } as never);
      prisma.candidate.create.mockResolvedValue({ id: 'c2', status: CandidateStatus.NEW } as never);

      const result = await service.cloneCandidate(user, 'c1');
      const data = ((prisma.candidate.create.mock.calls[0] as unknown[])[0] as unknown) as { data: Record<string, unknown> };
      expect(data.data.status).toBe(CandidateStatus.NEW);
      expect(result.status).toBe(CandidateStatus.NEW);
    });

    it('throws NotFoundException when candidate missing', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue(null);

      await expect(service.cloneCandidate(user, 'missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('changeCandidateStatus', () => {
    it('updates status', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue({ id: 'c1', status: CandidateStatus.NEW, jobRequisitionId: 'jr1' } as never);
      prisma.candidate.update.mockResolvedValue({ id: 'c1', status: CandidateStatus.SCHEDULED_TEST } as never);

      const result = await service.changeCandidateStatus(user, 'c1', CandidateStatus.SCHEDULED_TEST);
      expect(result.status).toBe(CandidateStatus.SCHEDULED_TEST);
    });

    it('blocks backwards from ONBOARDED', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue({ id: 'c1', status: CandidateStatus.ONBOARDED } as never);

      await expect(service.changeCandidateStatus(user, 'c1', CandidateStatus.NEW)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('fills requisition when onboarded', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue({ id: 'c1', status: CandidateStatus.ACCEPTED_OFFER, jobRequisitionId: 'jr1' } as never);
      prisma.candidate.update.mockResolvedValue({ id: 'c1', status: CandidateStatus.ONBOARDED, jobRequisitionId: 'jr1' } as never);

      await service.changeCandidateStatus(user, 'c1', CandidateStatus.ONBOARDED);

      expect(prisma.jobRequisition.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: JobRequisitionStatus.FILLED }),
        }),
      );
    });

    it('throws NotFoundException when candidate missing', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue(null);

      await expect(service.changeCandidateStatus(user, 'missing', CandidateStatus.NEW)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('uploadCandidateCv', () => {
    it('updates cvUrl', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue({ id: 'c1', cvUrl: 'old' } as never);
      prisma.candidate.update.mockResolvedValue({ id: 'c1', cvUrl: 'new' } as never);

      const result = await service.uploadCandidateCv(user, 'c1', '  new  ');
      const data = ((prisma.candidate.update.mock.calls[0] as unknown[])[0] as unknown) as { data: Record<string, unknown> };
      expect(data.data.cvUrl).toBe('new');
      expect(result.cvUrl).toBe('new');
    });

    it('throws NotFoundException when candidate missing', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findUnique.mockResolvedValue(null);

      await expect(service.uploadCandidateCv(user, 'missing', 'url')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('closeRequisition', () => {
    it('closes when no active candidates', async () => {
      const { service, prisma } = setup();
      prisma.jobRequisition.findUnique.mockResolvedValue({
        id: 'jr1',
        candidates: [
          { id: 'c1', status: CandidateStatus.ONBOARDED },
          { id: 'c2', status: CandidateStatus.FAILED_INTERVIEW },
        ],
      } as never);
      prisma.jobRequisition.update.mockResolvedValue({ id: 'jr1', status: JobRequisitionStatus.CLOSED } as never);

      const result = await service.closeRequisition(user, 'jr1');
      expect(result.status).toBe(JobRequisitionStatus.CLOSED);
    });

    it('blocks if active candidates exist', async () => {
      const { service, prisma } = setup();
      prisma.jobRequisition.findUnique.mockResolvedValue({
        id: 'jr1',
        candidates: [{ id: 'c1', status: CandidateStatus.NEW }],
      } as never);

      await expect(service.closeRequisition(user, 'jr1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws NotFoundException when missing', async () => {
      const { service, prisma } = setup();
      prisma.jobRequisition.findUnique.mockResolvedValue(null);

      await expect(service.closeRequisition(user, 'missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('cloneRequisition', () => {
    it('creates clone with DRAFT status', async () => {
      const { service, prisma } = setup();
      prisma.jobRequisition.findUnique.mockResolvedValue({
        id: 'jr1',
        title: 'Title',
        description: 'Desc',
        department: 'Eng',
        location: 'HN',
        salaryMin: new Prisma.Decimal(1000),
        salaryMax: new Prisma.Decimal(2000),
        status: JobRequisitionStatus.OPEN,
        type: RequisitionType.STAFF,
        positionId: 'p1',
        subPositionId: 'sp1',
      } as never);
      prisma.jobRequisition.create.mockResolvedValue({ id: 'jr2' } as never);

      const result = await service.cloneRequisition(user, 'jr1');
      const data = ((prisma.jobRequisition.create.mock.calls[0] as unknown[])[0] as unknown) as { data: Record<string, unknown> };
      expect(data.data.title).toBe('Title (Clone)');
      expect(data.data.status).toBe(JobRequisitionStatus.DRAFT);
      expect(data.data.requestedBy).toBe(user.id);
    });

    it('throws NotFoundException when missing', async () => {
      const { service, prisma } = setup();
      prisma.jobRequisition.findUnique.mockResolvedValue(null);

      await expect(service.cloneRequisition(user, 'missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getRecruitmentOverview', () => {
    it('aggregates counts', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findMany.mockResolvedValue([
        { status: CandidateStatus.NEW, source: 'LinkedIn' },
        { status: CandidateStatus.NEW, source: null },
        { status: CandidateStatus.ONBOARDED, source: 'Referral' },
      ] as never);
      prisma.jobRequisition.findMany.mockResolvedValue([
        { status: JobRequisitionStatus.OPEN },
        { status: JobRequisitionStatus.OPEN },
        { status: JobRequisitionStatus.CLOSED },
      ] as never);

      const result = await service.getRecruitmentOverview();
      expect(result.candidatesByStatus).toEqual(expect.arrayContaining([
        { key: CandidateStatus.NEW, count: 2 },
        { key: CandidateStatus.ONBOARDED, count: 1 },
      ]));
      expect(result.requisitionsByStatus).toEqual(expect.arrayContaining([
        { key: JobRequisitionStatus.OPEN, count: 2 },
        { key: JobRequisitionStatus.CLOSED, count: 1 },
      ]));
      expect(result.candidatesBySource).toEqual(expect.arrayContaining([
        { key: 'LinkedIn', count: 1 },
        { key: 'Unknown', count: 1 },
        { key: 'Referral', count: 1 },
      ]));
    });
  });

  describe('getStaffSources', () => {
    it('groups by cvSource', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findMany.mockResolvedValue([
        { cvSourceId: 's1', cvSource: { id: 's1', name: 'Source A' } },
        { cvSourceId: 's1', cvSource: { id: 's1', name: 'Source A' } },
        { cvSourceId: null, cvSource: null },
      ] as never);

      const result = await service.getStaffSources();
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 's1', name: 'Source A', count: 2 }),
        expect.objectContaining({ id: null, name: 'Unknown', count: 1 }),
      ]));
    });
  });

  describe('getInternSources', () => {
    it('groups by cvSource for interns', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findMany.mockResolvedValue([
        { cvSourceId: 's2', cvSource: { id: 's2', name: 'Uni Portal' } },
      ] as never);

      const result = await service.getInternSources();
      expect(result).toEqual([expect.objectContaining({ id: 's2', name: 'Uni Portal', count: 1 })]);
    });
  });

  describe('getInternEducations', () => {
    it('groups by education with optional date and branch filters', async () => {
      const { service, prisma } = setup();
      prisma.candidate.findMany.mockResolvedValue([
        { educationId: 'e1', education: { id: 'e1', name: 'MIT' } },
        { educationId: 'e1', education: { id: 'e1', name: 'MIT' } },
        { educationId: null, education: null },
      ] as never);

      const result = await service.getInternEducations(new Date('2024-01-01'), new Date('2024-12-31'), 'b1');
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'e1', name: 'MIT', count: 2 }),
        expect.objectContaining({ id: null, name: 'Unknown', count: 1 }),
      ]));
    });
  });
});
