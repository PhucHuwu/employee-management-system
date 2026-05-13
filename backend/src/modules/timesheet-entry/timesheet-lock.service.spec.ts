import { TimesheetLockService } from './timesheet-lock.service';

describe('TimesheetLockService', () => {
  function setup() {
    const prisma = {
      timesheetEntry: {
        updateMany: jest.fn(),
      },
    };

    const systemSettingService = {
      findByKey: jest.fn(),
    };

    const service = new TimesheetLockService(prisma as never, systemSettingService as never);
    return { service, prisma, systemSettingService };
  }

  describe('getLockDayOfMonth', () => {
    it('returns parsed int from setting', async () => {
      const { service, systemSettingService } = setup();
      systemSettingService.findByKey.mockResolvedValue({ key: 'lockDayOfMonth', value: '10' });
      const result = await (service as any).getLockDayOfMonth();
      expect(result).toBe(10);
    });

    it('returns default 5 when setting is missing', async () => {
      const { service, systemSettingService } = setup();
      systemSettingService.findByKey.mockRejectedValue(new Error('not found'));
      const result = await (service as any).getLockDayOfMonth();
      expect(result).toBe(5);
    });

    it('returns default 5 when value is NaN', async () => {
      const { service, systemSettingService } = setup();
      systemSettingService.findByKey.mockResolvedValue({ key: 'lockDayOfMonth', value: 'abc' });
      const result = await (service as any).getLockDayOfMonth();
      expect(result).toBe(5);
    });
  });

  describe('getUnlockWeeks', () => {
    it('returns parsed int from setting', async () => {
      const { service, systemSettingService } = setup();
      systemSettingService.findByKey.mockResolvedValue({ key: 'unlockWeeks', value: '3' });
      const result = await (service as any).getUnlockWeeks();
      expect(result).toBe(3);
    });

    it('returns default 2 when setting is missing', async () => {
      const { service, systemSettingService } = setup();
      systemSettingService.findByKey.mockRejectedValue(new Error('not found'));
      const result = await (service as any).getUnlockWeeks();
      expect(result).toBe(2);
    });

    it('returns default 2 when value is NaN', async () => {
      const { service, systemSettingService } = setup();
      systemSettingService.findByKey.mockResolvedValue({ key: 'unlockWeeks', value: 'xyz' });
      const result = await (service as any).getUnlockWeeks();
      expect(result).toBe(2);
    });
  });

  describe('getCutoffDate', () => {
    it('returns previous month when current day >= lock day', () => {
      const { service } = setup();
      jest.useFakeTimers().setSystemTime(new Date('2026-05-10'));
      const result = (service as any).getCutoffDate(5);
      expect(result).toEqual(new Date(2026, 4, 1));
      jest.useRealTimers();
    });

    it('returns two months prior when current day < lock day', () => {
      const { service } = setup();
      jest.useFakeTimers().setSystemTime(new Date('2026-05-03'));
      const result = (service as any).getCutoffDate(5);
      expect(result).toEqual(new Date(2026, 3, 1));
      jest.useRealTimers();
    });

    it('handles year rollover correctly', () => {
      const { service } = setup();
      jest.useFakeTimers().setSystemTime(new Date('2026-01-03'));
      const result = (service as any).getCutoffDate(5);
      expect(result).toEqual(new Date(2025, 11, 1));
      jest.useRealTimers();
    });
  });

  describe('autoLock', () => {
    it('updates DRAFT entries before cutoff to REJECTED', async () => {
      const { service, prisma, systemSettingService } = setup();
      systemSettingService.findByKey.mockResolvedValue({ key: 'lockDayOfMonth', value: '5' });
      jest.useFakeTimers().setSystemTime(new Date('2026-05-10'));
      prisma.timesheetEntry.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.autoLock();

      expect(prisma.timesheetEntry.updateMany).toHaveBeenCalledWith({
        where: {
          status: 'DRAFT',
          entryDate: { lt: new Date(2026, 4, 1) },
        },
        data: {
          status: 'REJECTED',
          note: 'Auto-locked: timesheet entry was not submitted before the lock date',
        },
      });
      expect(result.lockedCount).toBe(3);
      expect(result.cutoffDate).toBe('2026-04-30');
      jest.useRealTimers();
    });
  });

  describe('getLockStatus', () => {
    it('returns lock configuration and cutoff date', async () => {
      const { service, systemSettingService } = setup();
      systemSettingService.findByKey
        .mockResolvedValueOnce({ key: 'lockDayOfMonth', value: '10' })
        .mockResolvedValueOnce({ key: 'unlockWeeks', value: '3' });
      jest.useFakeTimers().setSystemTime(new Date('2026-05-15'));

      const result = await service.getLockStatus();

      expect(result.lockDayOfMonth).toBe(10);
      expect(result.unlockWeeks).toBe(3);
      expect(result.cutoffDate).toBe('2026-04-30');
      jest.useRealTimers();
    });
  });
});
