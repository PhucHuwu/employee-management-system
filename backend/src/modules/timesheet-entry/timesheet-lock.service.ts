import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { SystemSettingService } from '@/modules/system-setting/system-setting.service';

export interface LockResult {
  lockedCount: number;
  cutoffDate: string;
}

@Injectable()
export class TimesheetLockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly systemSettingService: SystemSettingService,
  ) {}

  private async getLockDayOfMonth(): Promise<number> {
    try {
      const setting = await this.systemSettingService.findByKey('lockDayOfMonth');
      const value = parseInt(setting.value, 10);
      return Number.isNaN(value) ? 5 : value;
    } catch {
      return 5;
    }
  }

  private async getUnlockWeeks(): Promise<number> {
    try {
      const setting = await this.systemSettingService.findByKey('unlockWeeks');
      const value = parseInt(setting.value, 10);
      return Number.isNaN(value) ? 2 : value;
    } catch {
      return 2;
    }
  }

  private getCutoffDate(lockDayOfMonth: number): Date {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    let cutoffYear: number;
    let cutoffMonth: number;

    if (currentDay >= lockDayOfMonth) {
      cutoffYear = currentYear;
      cutoffMonth = currentMonth - 1;
    } else {
      cutoffYear = currentYear;
      cutoffMonth = currentMonth - 2;
    }

    if (cutoffMonth < 0) {
      cutoffYear -= 1;
      cutoffMonth += 12;
    }

    return new Date(cutoffYear, cutoffMonth + 1, 1, 0, 0, 0, 0);
  }

  async autoLock(): Promise<LockResult> {
    const lockDayOfMonth = await this.getLockDayOfMonth();
    const cutoffDate = this.getCutoffDate(lockDayOfMonth);

    const result = await this.prisma.timesheetEntry.updateMany({
      where: {
        status: 'DRAFT',
        entryDate: {
          lt: cutoffDate,
        },
      },
      data: {
        status: 'REJECTED',
        note: 'Auto-locked: timesheet entry was not submitted before the lock date',
      },
    });

    return {
      lockedCount: result.count,
      cutoffDate: cutoffDate.toISOString().split('T')[0],
    };
  }

  async getLockStatus(): Promise<{ lockDayOfMonth: number; unlockWeeks: number; cutoffDate: string }> {
    const lockDayOfMonth = await this.getLockDayOfMonth();
    const unlockWeeks = await this.getUnlockWeeks();
    const cutoffDate = this.getCutoffDate(lockDayOfMonth);

    return {
      lockDayOfMonth,
      unlockWeeks,
      cutoffDate: cutoffDate.toISOString().split('T')[0],
    };
  }
}
