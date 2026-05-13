import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ReviewInternService } from './review-intern.service';

describe('ReviewInternService', () => {
  const user = {
    id: '00000000-0000-0000-0000-000000000900',
    role: 'ADMIN' as const,
  };

  function setup() {
    const prisma = {
      reviewIntern: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const auditService = {
      log: jest.fn(),
    };

    const service = new ReviewInternService(prisma as never, auditService as never);
    return { service, prisma, auditService };
  }

  const defaultInclude = {
    intern: true,
    reviewer: true,
    details: { include: { capability: true } },
  };

  describe('create', () => {
    it('creates review with details', async () => {
      const { service, prisma } = setup();
      const created = {
        id: 'ri1',
        month: 5,
        year: 2026,
        internId: 'i1',
        reviewerId: 'r1',
        details: [{ capabilityId: 'c1', score: 8, comment: 'good' }],
      };
      prisma.reviewIntern.create.mockResolvedValue(created);

      const result = await service.create({
        month: 5,
        year: 2026,
        internId: 'i1',
        reviewerId: 'r1',
        details: [{ capabilityId: 'c1', score: 8, comment: 'good' }],
      });

      expect(result).toBe(created);
      expect(prisma.reviewIntern.create).toHaveBeenCalledWith({
        data: {
          month: 5,
          year: 2026,
          internId: 'i1',
          reviewerId: 'r1',
          details: {
            create: [{ capabilityId: 'c1', score: 8, comment: 'good' }],
          },
        },
        include: defaultInclude,
      });
    });

    it('creates review without details when omitted', async () => {
      const { service, prisma } = setup();
      const created = { id: 'ri1', month: 5, year: 2026, internId: 'i1', reviewerId: 'r1' };
      prisma.reviewIntern.create.mockResolvedValue(created);

      await service.create({
        month: 5,
        year: 2026,
        internId: 'i1',
        reviewerId: 'r1',
      });

      const calls = prisma.reviewIntern.create.mock.calls as unknown[][];
      expect((calls[0]?.[0] as { data: { details?: unknown } }).data.details).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('returns all reviews ordered by createdAt desc', async () => {
      const { service, prisma } = setup();
      const reviews = [{ id: 'ri1' }, { id: 'ri2' }];
      prisma.reviewIntern.findMany.mockResolvedValue(reviews);

      const result = await service.findAll();

      expect(result).toBe(reviews);
      expect(prisma.reviewIntern.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        include: defaultInclude,
      });
    });

    it('filters by reviewerId', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findMany.mockResolvedValue([]);

      await service.findAll('r1');

      expect(prisma.reviewIntern.findMany).toHaveBeenCalledWith({
        where: { reviewerId: 'r1' },
        orderBy: { createdAt: 'desc' },
        include: defaultInclude,
      });
    });

    it('filters by internId', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findMany.mockResolvedValue([]);

      await service.findAll(undefined, 'i1');

      expect(prisma.reviewIntern.findMany).toHaveBeenCalledWith({
        where: { internId: 'i1' },
        orderBy: { createdAt: 'desc' },
        include: defaultInclude,
      });
    });

    it('filters by both reviewerId and internId', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findMany.mockResolvedValue([]);

      await service.findAll('r1', 'i1');

      expect(prisma.reviewIntern.findMany).toHaveBeenCalledWith({
        where: { reviewerId: 'r1', internId: 'i1' },
        orderBy: { createdAt: 'desc' },
        include: defaultInclude,
      });
    });
  });

  describe('getReports', () => {
    it('returns reports without filters', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findMany.mockResolvedValue([]);

      await service.getReports();

      expect(prisma.reviewIntern.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        include: defaultInclude,
      });
    });

    it('filters by month and year when valid', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findMany.mockResolvedValue([]);

      await service.getReports('5', '2026');

      expect(prisma.reviewIntern.findMany).toHaveBeenCalledWith({
        where: { month: 5, year: 2026 },
        orderBy: { createdAt: 'desc' },
        include: defaultInclude,
      });
    });

    it('ignores invalid month/year strings', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findMany.mockResolvedValue([]);

      await service.getReports('abc', 'xyz');

      expect(prisma.reviewIntern.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        include: defaultInclude,
      });
    });
  });

  describe('findOne', () => {
    it('returns review when found', async () => {
      const { service, prisma } = setup();
      const review = { id: 'ri1', status: 'DRAFT' };
      prisma.reviewIntern.findUnique.mockResolvedValue(review);

      const result = await service.findOne('ri1');

      expect(result).toBe(review);
      expect(prisma.reviewIntern.findUnique).toHaveBeenCalledWith({
        where: { id: 'ri1' },
        include: defaultInclude,
      });
    });

    it('throws NotFoundException when not found', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates totalScore, level, and details', async () => {
      const { service, prisma } = setup();
      const existing = { id: 'ri1', status: 'DRAFT' };
      const updated = { id: 'ri1', totalScore: 85, level: 'L2', details: [] };
      prisma.reviewIntern.findUnique.mockResolvedValue(existing);
      prisma.reviewIntern.update.mockResolvedValue(updated);

      const result = await service.update('ri1', {
        totalScore: 85,
        level: 'L2',
        details: [{ capabilityId: 'c1', score: 9 }],
      });

      expect(result).toBe(updated);
      expect(prisma.reviewIntern.update).toHaveBeenCalledWith({
        where: { id: 'ri1' },
        data: {
          totalScore: 85,
          level: 'L2',
          details: {
            deleteMany: {},
            create: [{ capabilityId: 'c1', score: 9, comment: null }],
          },
        },
        include: defaultInclude,
      });
    });

    it('trims level and preserves null for empty level', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findUnique.mockResolvedValue({ id: 'ri1' });
      prisma.reviewIntern.update.mockResolvedValue({ id: 'ri1' });

      await service.update('ri1', { level: '  L1  ' });

      const calls = prisma.reviewIntern.update.mock.calls as unknown[][];
      expect((calls[0]?.[0] as { data: { level: string | null } }).data.level).toBe('L1');
    });

    it('throws NotFoundException when review does not exist', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', {})).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('submitReview', () => {
    it('submits a draft review', async () => {
      const { service, prisma } = setup();
      const item = { id: 'ri1', status: 'DRAFT' };
      const updated = { id: 'ri1', status: 'REVIEWED' };
      prisma.reviewIntern.findUnique.mockResolvedValue(item);
      prisma.reviewIntern.update.mockResolvedValue(updated);

      const result = await service.submitReview('ri1');

      expect(result).toBe(updated);
      expect(prisma.reviewIntern.update).toHaveBeenCalledWith({
        where: { id: 'ri1' },
        data: { status: 'REVIEWED' },
        include: defaultInclude,
      });
    });

    it('throws BadRequestException when review is not draft', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findUnique.mockResolvedValue({ id: 'ri1', status: 'REVIEWED' });

      await expect(service.submitReview('ri1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws NotFoundException when review does not exist', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findUnique.mockResolvedValue(null);

      await expect(service.submitReview('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('approve', () => {
    it('approves a reviewed item', async () => {
      const { service, prisma } = setup();
      const item = { id: 'ri1', status: 'REVIEWED' };
      const updated = { id: 'ri1', status: 'APPROVED' };
      prisma.reviewIntern.findUnique.mockResolvedValue(item);
      prisma.reviewIntern.update.mockResolvedValue(updated);

      const result = await service.approve('ri1');

      expect(result).toBe(updated);
      expect(prisma.reviewIntern.update).toHaveBeenCalledWith({
        where: { id: 'ri1' },
        data: { status: 'APPROVED' },
        include: defaultInclude,
      });
    });

    it('throws BadRequestException when review is not reviewed', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findUnique.mockResolvedValue({ id: 'ri1', status: 'DRAFT' });

      await expect(service.approve('ri1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws NotFoundException when review does not exist', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findUnique.mockResolvedValue(null);

      await expect(service.approve('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('reject', () => {
    it('rejects a reviewed item', async () => {
      const { service, prisma } = setup();
      const item = { id: 'ri1', status: 'REVIEWED' };
      const updated = { id: 'ri1', status: 'REJECTED' };
      prisma.reviewIntern.findUnique.mockResolvedValue(item);
      prisma.reviewIntern.update.mockResolvedValue(updated);

      const result = await service.reject('ri1');

      expect(result).toBe(updated);
      expect(prisma.reviewIntern.update).toHaveBeenCalledWith({
        where: { id: 'ri1' },
        data: { status: 'REJECTED' },
        include: defaultInclude,
      });
    });

    it('throws BadRequestException when review is not reviewed', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findUnique.mockResolvedValue({ id: 'ri1', status: 'APPROVED' });

      await expect(service.reject('ri1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws NotFoundException when review does not exist', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findUnique.mockResolvedValue(null);

      await expect(service.reject('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes existing review', async () => {
      const { service, prisma } = setup();
      const existing = { id: 'ri1', status: 'DRAFT' };
      prisma.reviewIntern.findUnique.mockResolvedValue(existing);
      prisma.reviewIntern.delete.mockResolvedValue(existing);

      const result = await service.remove('ri1');

      expect(result).toBe(existing);
      expect(prisma.reviewIntern.delete).toHaveBeenCalledWith({ where: { id: 'ri1' } });
    });

    it('throws NotFoundException when review does not exist', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('sendMail', () => {
    it('sends mail for approved review', async () => {
      const { service, prisma, auditService } = setup();
      const item = { id: 'ri1', status: 'APPROVED', internId: 'i1', reviewerId: 'r1' };
      prisma.reviewIntern.findUnique.mockResolvedValue(item);

      const result = await service.sendMail(user, 'ri1');

      expect(result).toEqual({ sent: true });
      expect(auditService.log).toHaveBeenCalledWith({
        actor: { id: user.id, role: user.role },
        action: 'REVIEW_INTERN_MAIL_SENT',
        entityType: 'REVIEW_INTERN',
        entityId: 'ri1',
        newData: { internId: 'i1', reviewerId: 'r1', status: 'APPROVED' },
      });
    });

    it('throws BadRequestException when review is not approved', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findUnique.mockResolvedValue({ id: 'ri1', status: 'REVIEWED' });

      await expect(service.sendMail(user, 'ri1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws NotFoundException when review does not exist', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findUnique.mockResolvedValue(null);

      await expect(service.sendMail(user, 'missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateToHrm', () => {
    it('syncs approved review to HRM', async () => {
      const { service, prisma, auditService } = setup();
      const item = { id: 'ri1', status: 'APPROVED', internId: 'i1', reviewerId: 'r1' };
      prisma.reviewIntern.findUnique.mockResolvedValue(item);

      const result = await service.updateToHrm(user, 'ri1');

      expect(result).toEqual({ updated: true });
      expect(auditService.log).toHaveBeenCalledWith({
        actor: { id: user.id, role: user.role },
        action: 'REVIEW_INTERN_UPDATED_TO_HRM',
        entityType: 'REVIEW_INTERN',
        entityId: 'ri1',
        newData: { internId: 'i1', reviewerId: 'r1', status: 'APPROVED' },
      });
    });

    it('throws BadRequestException when review is not approved', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findUnique.mockResolvedValue({ id: 'ri1', status: 'REJECTED' });

      await expect(service.updateToHrm(user, 'ri1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws NotFoundException when review does not exist', async () => {
      const { service, prisma } = setup();
      prisma.reviewIntern.findUnique.mockResolvedValue(null);

      await expect(service.updateToHrm(user, 'missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
