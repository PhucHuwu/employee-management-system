import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OnsiteRequestStatus } from '@prisma/client';
import { OnsiteRequestService } from './onsite-request.service';

describe('OnsiteRequestService', () => {
  const user = {
    id: '00000000-0000-0000-0000-000000000900',
    role: 'ADMIN' as const,
  };

  function setup() {
    const prisma = {
      onsiteRequest: {
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

    const service = new OnsiteRequestService(prisma as never, auditService as never);
    return { service, prisma, auditService };
  }

  describe('create', () => {
    it('creates request with correct data', async () => {
      const { service, prisma, auditService } = setup();
      const created = {
        id: 'r1',
        employeeId: 'e1',
        requestDate: new Date('2026-05-01'),
        period: 'FULL_DAY',
        hours: null,
        reason: null,
        employee: { id: 'e1' },
      };
      prisma.onsiteRequest.create.mockResolvedValue(created);

      const result = await service.create(user, {
        employeeId: 'e1',
        requestDate: '2026-05-01',
        period: 'FULL_DAY' as never,
      });

      expect(result).toBe(created);
      expect(prisma.onsiteRequest.create).toHaveBeenCalledWith({
        data: {
          employeeId: 'e1',
          requestDate: new Date('2026-05-01'),
          period: 'FULL_DAY',
          hours: null,
          reason: null,
        },
        include: { employee: true },
      });
      expect(auditService.log).toHaveBeenCalledWith({
        actor: { id: user.id, role: user.role },
        action: 'ONSITE_REQUEST_CREATED',
        entityType: 'ONSITE_REQUEST',
        entityId: 'r1',
        newData: created,
      });
    });

    it('trims reason when provided', async () => {
      const { service, prisma } = setup();
      const created = {
        id: 'r1',
        employeeId: 'e1',
        requestDate: new Date('2026-05-01'),
        period: 'FULL_DAY',
        hours: 4,
        reason: 'reason',
        employee: { id: 'e1' },
      };
      prisma.onsiteRequest.create.mockResolvedValue(created);

      await service.create(user, {
        employeeId: 'e1',
        requestDate: '2026-05-01',
        period: 'FULL_DAY' as never,
        hours: 4,
        reason: '  reason  ',
      });

      const calls = prisma.onsiteRequest.create.mock.calls as unknown[][];
      expect((calls[0]?.[0] as { data: { reason: string } }).data.reason).toBe('reason');
    });
  });

  describe('findAll', () => {
    it('returns all requests ordered by createdAt desc', async () => {
      const { service, prisma } = setup();
      const requests = [{ id: 'r1' }, { id: 'r2' }];
      prisma.onsiteRequest.findMany.mockResolvedValue(requests);

      const result = await service.findAll();

      expect(result).toBe(requests);
      expect(prisma.onsiteRequest.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: { employee: true },
      });
    });
  });

  describe('findOne', () => {
    it('returns request when found', async () => {
      const { service, prisma } = setup();
      const request = { id: 'r1', status: OnsiteRequestStatus.PENDING };
      prisma.onsiteRequest.findUnique.mockResolvedValue(request);

      const result = await service.findOne('r1');

      expect(result).toBe(request);
      expect(prisma.onsiteRequest.findUnique).toHaveBeenCalledWith({
        where: { id: 'r1' },
        include: { employee: true },
      });
    });

    it('throws NotFoundException when not found', async () => {
      const { service, prisma } = setup();
      prisma.onsiteRequest.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates existing request', async () => {
      const { service, prisma, auditService } = setup();
      const existing = { id: 'r1', status: OnsiteRequestStatus.PENDING };
      const updated = { id: 'r1', status: OnsiteRequestStatus.PENDING, employee: { id: 'e1' } };
      prisma.onsiteRequest.findUnique.mockResolvedValue(existing);
      prisma.onsiteRequest.update.mockResolvedValue(updated);

      const result = await service.update(user, 'r1', {
        requestDate: '2026-05-02',
        period: 'AM' as never,
        hours: 3,
        reason: 'updated reason',
      });

      expect(result).toBe(updated);
      expect(prisma.onsiteRequest.update).toHaveBeenCalledWith({
        where: { id: 'r1' },
        data: {
          requestDate: new Date('2026-05-02'),
          period: 'AM',
          hours: 3,
          reason: 'updated reason',
        },
        include: { employee: true },
      });
      expect(auditService.log).toHaveBeenCalledWith({
        actor: { id: user.id, role: user.role },
        action: 'ONSITE_REQUEST_UPDATED',
        entityType: 'ONSITE_REQUEST',
        entityId: 'r1',
        oldData: existing,
        newData: updated,
      });
    });

    it('throws NotFoundException when request does not exist', async () => {
      const { service, prisma } = setup();
      prisma.onsiteRequest.findUnique.mockResolvedValue(null);

      await expect(service.update(user, 'missing', {})).rejects.toBeInstanceOf(NotFoundException);
    });

    it('preserves undefined fields', async () => {
      const { service, prisma } = setup();
      prisma.onsiteRequest.findUnique.mockResolvedValue({ id: 'r1' });
      prisma.onsiteRequest.update.mockResolvedValue({ id: 'r1' });

      await service.update(user, 'r1', {});

      const calls = prisma.onsiteRequest.update.mock.calls as unknown[][];
      expect((calls[0]?.[0] as { data: Record<string, unknown> }).data).toEqual({
        requestDate: undefined,
        period: undefined,
        hours: undefined,
        reason: undefined,
      });
    });
  });

  describe('remove', () => {
    it('deletes existing request', async () => {
      const { service, prisma, auditService } = setup();
      const existing = { id: 'r1', status: OnsiteRequestStatus.PENDING };
      prisma.onsiteRequest.findUnique.mockResolvedValue(existing);
      prisma.onsiteRequest.delete.mockResolvedValue(existing);

      await service.remove(user, 'r1');

      expect(prisma.onsiteRequest.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
      expect(auditService.log).toHaveBeenCalledWith({
        actor: { id: user.id, role: user.role },
        action: 'ONSITE_REQUEST_DELETED',
        entityType: 'ONSITE_REQUEST',
        entityId: 'r1',
        oldData: existing,
      });
    });

    it('throws NotFoundException when request does not exist', async () => {
      const { service, prisma } = setup();
      prisma.onsiteRequest.findUnique.mockResolvedValue(null);

      await expect(service.remove(user, 'missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('approve', () => {
    it('approves a pending request', async () => {
      const { service, prisma, auditService } = setup();
      const item = { id: 'r1', status: OnsiteRequestStatus.PENDING };
      const updated = { id: 'r1', status: OnsiteRequestStatus.APPROVED, approvedAt: new Date(), employee: { id: 'e1' } };
      prisma.onsiteRequest.findUnique.mockResolvedValue(item);
      prisma.onsiteRequest.update.mockResolvedValue(updated);

      const result = await service.approve(user, 'r1');

      expect(result).toBe(updated);
      expect(prisma.onsiteRequest.update).toHaveBeenCalledWith({
        where: { id: 'r1' },
        data: {
          status: OnsiteRequestStatus.APPROVED,
          approvedBy: user.id,
          approvedAt: expect.any(Date),
        },
        include: { employee: true },
      });
      expect(auditService.log).toHaveBeenCalledWith({
        actor: { id: user.id, role: user.role },
        action: 'ONSITE_REQUEST_APPROVED',
        entityType: 'ONSITE_REQUEST',
        entityId: 'r1',
        oldData: { status: OnsiteRequestStatus.PENDING },
        newData: { status: OnsiteRequestStatus.APPROVED, approvedAt: updated.approvedAt },
      });
    });

    it('throws BadRequestException when request is not pending', async () => {
      const { service, prisma } = setup();
      prisma.onsiteRequest.findUnique.mockResolvedValue({ id: 'r1', status: OnsiteRequestStatus.APPROVED });

      await expect(service.approve(user, 'r1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws NotFoundException when request does not exist', async () => {
      const { service, prisma } = setup();
      prisma.onsiteRequest.findUnique.mockResolvedValue(null);

      await expect(service.approve(user, 'missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('reject', () => {
    it('rejects a pending request', async () => {
      const { service, prisma, auditService } = setup();
      const item = { id: 'r1', status: OnsiteRequestStatus.PENDING };
      const updated = { id: 'r1', status: OnsiteRequestStatus.REJECTED, approvedAt: new Date(), employee: { id: 'e1' } };
      prisma.onsiteRequest.findUnique.mockResolvedValue(item);
      prisma.onsiteRequest.update.mockResolvedValue(updated);

      const result = await service.reject(user, 'r1');

      expect(result).toBe(updated);
      expect(prisma.onsiteRequest.update).toHaveBeenCalledWith({
        where: { id: 'r1' },
        data: {
          status: OnsiteRequestStatus.REJECTED,
          approvedBy: user.id,
          approvedAt: expect.any(Date),
        },
        include: { employee: true },
      });
      expect(auditService.log).toHaveBeenCalledWith({
        actor: { id: user.id, role: user.role },
        action: 'ONSITE_REQUEST_REJECTED',
        entityType: 'ONSITE_REQUEST',
        entityId: 'r1',
        oldData: { status: OnsiteRequestStatus.PENDING },
        newData: { status: OnsiteRequestStatus.REJECTED, approvedAt: updated.approvedAt },
      });
    });

    it('throws BadRequestException when request is not pending', async () => {
      const { service, prisma } = setup();
      prisma.onsiteRequest.findUnique.mockResolvedValue({ id: 'r1', status: OnsiteRequestStatus.REJECTED });

      await expect(service.reject(user, 'r1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws NotFoundException when request does not exist', async () => {
      const { service, prisma } = setup();
      prisma.onsiteRequest.findUnique.mockResolvedValue(null);

      await expect(service.reject(user, 'missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('cancels a pending request', async () => {
      const { service, prisma, auditService } = setup();
      const item = { id: 'r1', status: OnsiteRequestStatus.PENDING };
      const updated = { id: 'r1', status: OnsiteRequestStatus.CANCELLED, employee: { id: 'e1' } };
      prisma.onsiteRequest.findUnique.mockResolvedValue(item);
      prisma.onsiteRequest.update.mockResolvedValue(updated);

      const result = await service.cancel(user, 'r1');

      expect(result).toBe(updated);
      expect(prisma.onsiteRequest.update).toHaveBeenCalledWith({
        where: { id: 'r1' },
        data: { status: OnsiteRequestStatus.CANCELLED },
        include: { employee: true },
      });
      expect(auditService.log).toHaveBeenCalledWith({
        actor: { id: user.id, role: user.role },
        action: 'ONSITE_REQUEST_CANCELLED',
        entityType: 'ONSITE_REQUEST',
        entityId: 'r1',
        oldData: { status: OnsiteRequestStatus.PENDING },
        newData: { status: OnsiteRequestStatus.CANCELLED },
      });
    });

    it('throws BadRequestException when request is not pending', async () => {
      const { service, prisma } = setup();
      prisma.onsiteRequest.findUnique.mockResolvedValue({ id: 'r1', status: OnsiteRequestStatus.APPROVED });

      await expect(service.cancel(user, 'r1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws NotFoundException when request does not exist', async () => {
      const { service, prisma } = setup();
      prisma.onsiteRequest.findUnique.mockResolvedValue(null);

      await expect(service.cancel(user, 'missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
