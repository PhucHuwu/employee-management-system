import { ForbiddenException } from '@nestjs/common';
import { dailyReportFixtures } from './__fixtures__/daily-report.fixture';
import { DailyReportService } from './daily-report.service';

describe('DailyReport Data Isolation E2E', () => {
  function setup() {
    const prisma = {
      dailyReport: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockResolvedValue([1, [{ id: 'ok' }]]);
    prisma.dailyReport.findMany.mockResolvedValue([{ id: 'ok' }]);

    const service = new DailyReportService(prisma as never);
    return { service, prisma };
  }

  it('does not allow manager to read out-of-scope employee data', async () => {
    const { service } = setup();

    await expect(
      service.getDailyReports(dailyReportFixtures.users.managerScoped, {
        employeeId: dailyReportFixtures.ids.employeeB,
        page: 1,
        size: 20,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows manager to read in-scope employee data only', async () => {
    const { service, prisma } = setup();

    const result = await service.getDailyReports(dailyReportFixtures.users.managerScoped, {
      employeeId: dailyReportFixtures.ids.employeeA,
      page: 1,
      size: 20,
    });

    expect(result.data).toHaveLength(1);
    const countCalls = prisma.dailyReport.count.mock.calls as unknown[][];
    const countArg = countCalls[0]?.[0] as {
      where: {
        employeeId: string;
      };
    };

    expect(countArg.where.employeeId).toBe(dailyReportFixtures.ids.employeeA);
  });
});
