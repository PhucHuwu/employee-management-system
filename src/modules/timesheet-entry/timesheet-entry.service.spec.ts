import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TimesheetEntryService } from './timesheet-entry.service';

describe('TimesheetEntryService', () => {
  function setup() {
    const prisma = {
      timesheetEntry: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      offDay: {
        findUnique: jest.fn(),
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

    const service = new TimesheetEntryService(prisma as never);
    return { service, prisma };
  }

  const employeeId = '00000000-0000-0000-0000-000000000001';
  const entryId = '00000000-0000-0000-0000-000000000010';

  function baseEntry(status: string) {
    return {
      id: entryId,
      employeeId,
      entryDate: new Date('2026-05-01'),
      normalWorkingTime: 7,
      overtime: 1,
      status,
      note: null,
      projectId: '00000000-0000-0000-0000-000000000020',
      taskId: '00000000-0000-0000-0000-000000000030',
      employee: { id: employeeId, fullName: 'Alice' },
      project: { id: '00000000-0000-0000-0000-000000000020', name: 'Project A' },
      task: { id: '00000000-0000-0000-0000-000000000030', name: 'Task A' },
    };
  }

  describe('create', () => {
    it('rejects when total hours exceed 24', async () => {
      const { service } = setup();
      await expect(
        service.create(
          {
            entryDate: '2026-05-01',
            normalWorkingTime: 20,
            overtime: 5,
            projectId: '00000000-0000-0000-0000-000000000020',
            taskId: '00000000-0000-0000-0000-000000000030',
          },
          employeeId,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects on off day', async () => {
      const { service, prisma } = setup();
      prisma.offDay.findUnique.mockResolvedValue({ id: 'off-1', offDate: new Date('2026-05-01') });
      await expect(
        service.create(
          {
            entryDate: '2026-05-01',
            normalWorkingTime: 8,
            projectId: '00000000-0000-0000-0000-000000000020',
            taskId: '00000000-0000-0000-0000-000000000030',
          },
          employeeId,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when normal working time exceeds 8 hours', async () => {
      const { service, prisma } = setup();
      prisma.offDay.findUnique.mockResolvedValue(null);
      prisma.timesheetEntry.findMany.mockResolvedValue([]);
      await expect(
        service.create(
          {
            entryDate: '2026-05-01',
            normalWorkingTime: 9,
            projectId: '00000000-0000-0000-0000-000000000020',
            taskId: '00000000-0000-0000-0000-000000000030',
          },
          employeeId,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates entry successfully', async () => {
      const { service, prisma } = setup();
      prisma.offDay.findUnique.mockResolvedValue(null);
      prisma.timesheetEntry.findMany.mockResolvedValue([]);
      prisma.timesheetEntry.create.mockResolvedValue(baseEntry('DRAFT'));

      const result = await service.create(
        {
          entryDate: '2026-05-01',
          normalWorkingTime: 8,
          overtime: 1,
          note: '  test note  ',
          projectId: '00000000-0000-0000-0000-000000000020',
          taskId: '00000000-0000-0000-0000-000000000030',
        },
        employeeId,
      );

      expect(result).toEqual(baseEntry('DRAFT'));
      const createCalls = prisma.timesheetEntry.create.mock.calls as unknown[][];
      const createArg = createCalls[0]?.[0] as { data: { note: string | null } };
      expect(createArg.data.note).toBe('test note');
    });
  });

  describe('findAll', () => {
    it('returns entries with filters', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findMany.mockResolvedValue([baseEntry('DRAFT')]);

      const result = await service.findAll(employeeId, '00000000-0000-0000-0000-000000000020');
      expect(result).toHaveLength(1);
      const findManyCalls = prisma.timesheetEntry.findMany.mock.calls as unknown[][];
      const findManyArg = findManyCalls[0]?.[0] as { where: { employeeId: string; projectId: string } };
      expect(findManyArg.where.employeeId).toBe(employeeId);
      expect(findManyArg.where.projectId).toBe('00000000-0000-0000-0000-000000000020');
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when entry missing', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(null);
      await expect(service.findOne(entryId)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns entry when found', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('DRAFT'));
      const result = await service.findOne(entryId);
      expect(result.id).toBe(entryId);
    });
  });

  describe('update', () => {
    it('rejects editing approved entry', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('APPROVED'));
      await expect(
        service.update(entryId, { normalWorkingTime: 4 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects editing rejected entry', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('REJECTED'));
      await expect(
        service.update(entryId, { normalWorkingTime: 4 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when updated total exceeds 24', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('DRAFT'));
      await expect(
        service.update(entryId, { normalWorkingTime: 20, overtime: 5 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('updates draft entry successfully', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('DRAFT'));
      prisma.offDay.findUnique.mockResolvedValue(null);
      prisma.timesheetEntry.findMany.mockResolvedValue([]);
      prisma.timesheetEntry.update.mockResolvedValue({ ...baseEntry('DRAFT'), normalWorkingTime: 6 });

      const result = await service.update(entryId, { normalWorkingTime: 6 });
      expect(result.normalWorkingTime).toBe(6);
    });
  });

  describe('remove', () => {
    it('rejects deleting approved entry', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('APPROVED'));
      await expect(service.remove(entryId)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects deleting rejected entry', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('REJECTED'));
      await expect(service.remove(entryId)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('deletes draft entry', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('DRAFT'));
      prisma.timesheetEntry.delete.mockResolvedValue(baseEntry('DRAFT'));
      await service.remove(entryId);
      expect(prisma.timesheetEntry.delete).toHaveBeenCalledWith({ where: { id: entryId } });
    });
  });

  describe('submit', () => {
    it('rejects submitting non-draft entry', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('PENDING'));
      await expect(service.submit(entryId)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('submits draft entry', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('DRAFT'));
      prisma.timesheetEntry.update.mockResolvedValue(baseEntry('PENDING'));
      const result = await service.submit(entryId);
      expect(result.status).toBe('PENDING');
    });
  });

  describe('complain', () => {
    it('rejects complaining about draft entry', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('DRAFT'));
      await expect(
        service.complain(entryId, { complainNote: 'Please review' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects complaining about approved entry', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('APPROVED'));
      await expect(
        service.complain(entryId, { complainNote: 'Please review' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('complains about pending entry and resets to draft', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('PENDING'));
      prisma.timesheetEntry.update.mockResolvedValue({ ...baseEntry('DRAFT'), complainNote: 'Please review' });
      const result = await service.complain(entryId, { complainNote: 'Please review' });
      expect(result.status).toBe('DRAFT');
      expect(result.complainNote).toBe('Please review');
    });

    it('complains about rejected entry and resets to draft', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('REJECTED'));
      prisma.timesheetEntry.update.mockResolvedValue({ ...baseEntry('DRAFT'), complainNote: 'Mistake' });
      const result = await service.complain(entryId, { complainNote: 'Mistake' });
      expect(result.status).toBe('DRAFT');
    });
  });

  describe('approve', () => {
    it('rejects approving non-pending entry', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('DRAFT'));
      await expect(service.approve(entryId)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('approves pending entry', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('PENDING'));
      prisma.timesheetEntry.update.mockResolvedValue(baseEntry('APPROVED'));
      const result = await service.approve(entryId);
      expect(result.status).toBe('APPROVED');
    });
  });

  describe('bulkApprove', () => {
    it('rejects when some entries not found', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findMany.mockResolvedValue([baseEntry('PENDING')]);
      await expect(service.bulkApprove([entryId, 'missing-id'])).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects when some entries are not pending', async () => {
      const { service, prisma } = setup();
      const entries = [baseEntry('PENDING'), { ...baseEntry('DRAFT'), id: 'other-id' }];
      prisma.timesheetEntry.findMany.mockResolvedValue(entries);
      await expect(service.bulkApprove([entryId, 'other-id'])).rejects.toBeInstanceOf(BadRequestException);
    });

    it('approves all pending entries', async () => {
      const { service, prisma } = setup();
      const entries = [baseEntry('PENDING'), { ...baseEntry('PENDING'), id: 'other-id' }];
      prisma.timesheetEntry.findMany.mockResolvedValue(entries);
      prisma.timesheetEntry.updateMany.mockResolvedValue({ count: 2 });
      prisma.timesheetEntry.findMany.mockResolvedValueOnce(entries).mockResolvedValueOnce(entries);

      const result = await service.bulkApprove([entryId, 'other-id']);
      expect(prisma.timesheetEntry.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [entryId, 'other-id'] } },
        data: { status: 'APPROVED' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('reject', () => {
    it('rejects rejecting non-pending entry', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('APPROVED'));
      await expect(service.reject(entryId, { reason: 'Invalid' })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects pending entry with reason', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findUnique.mockResolvedValue(baseEntry('PENDING'));
      prisma.timesheetEntry.update.mockResolvedValue({ ...baseEntry('REJECTED'), note: 'Invalid hours' });
      const result = await service.reject(entryId, { reason: 'Invalid hours' });
      expect(result.status).toBe('REJECTED');
      expect(result.note).toBe('Invalid hours');
    });
  });

  describe('getMonitoring', () => {
    it('aggregates by project and employee', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findMany.mockResolvedValue([
        {
          ...baseEntry('APPROVED'),
          normalWorkingTime: 8,
          overtime: 2,
          project: { name: 'Project A' },
          employee: { fullName: 'Alice' },
        },
        {
          ...baseEntry('APPROVED'),
          id: 'e2',
          employeeId: 'emp2',
          normalWorkingTime: 4,
          overtime: 0,
          project: { name: 'Project A' },
          employee: { fullName: 'Bob' },
        },
      ]);

      const result = await service.getMonitoring(new Date('2026-05-01'), new Date('2026-05-31'));
      expect(result.totalEntries).toBe(2);
      expect(result.totalNormalHours).toBe(12);
      expect(result.totalOvertime).toBe(2);
      expect(result.byProject).toHaveLength(1);
      expect(result.byEmployee).toHaveLength(2);
    });
  });
});
