import { dailyReportFixtures } from './__fixtures__/daily-report.fixture';
import { DailyReportService } from './daily-report.service';

describe('DailyReportService Integration', () => {
  function setup() {
    const prisma = {
      dailyReport: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const service = new DailyReportService(prisma as never);
    return { service, prisma };
  }

  it('filters daily reports by employee/project/date range with pagination', async () => {
    const { service, prisma } = setup();

    prisma.$transaction.mockResolvedValue([2, [{ id: 'd1' }, { id: 'd2' }]]);

    const result = await service.getDailyReports(dailyReportFixtures.users.admin, {
      employeeId: dailyReportFixtures.ids.employeeA,
      projectId: dailyReportFixtures.ids.projectA,
      from: '2026-03-01',
      to: '2026-03-31',
      page: 2,
      size: 10,
    });

    expect(result).toMatchObject({
      total: 2,
      page: 2,
      size: 10,
      totalPages: 1,
    });

    const findManyCalls = prisma.dailyReport.findMany.mock.calls as unknown[][];
    const findManyArg = findManyCalls[0]?.[0] as {
      skip: number;
      take: number;
      where: {
        employeeId: string;
        projectId: string;
      };
    };

    expect(findManyArg.skip).toBe(10);
    expect(findManyArg.take).toBe(10);
    expect(findManyArg.where.employeeId).toBe(dailyReportFixtures.ids.employeeA);
    expect(findManyArg.where.projectId).toBe(dailyReportFixtures.ids.projectA);
  });

  it('returns project daily progress by member and date range', async () => {
    const { service, prisma } = setup();
    prisma.dailyReport.findMany.mockResolvedValue([{ id: 'p1' }]);

    const result = await service.getProjectDailyProgress(
      dailyReportFixtures.users.managerScoped,
      dailyReportFixtures.ids.projectA,
      {
        memberId: dailyReportFixtures.ids.employeeA,
        from: '2026-03-01',
        to: '2026-03-10',
      },
    );

    expect(result).toHaveLength(1);
    const progressFindManyCalls = prisma.dailyReport.findMany.mock.calls as unknown[][];
    const progressFindManyArg = progressFindManyCalls[0]?.[0] as {
      where: {
        projectId: string;
        employeeId: string;
      };
    };

    expect(progressFindManyArg.where.projectId).toBe(dailyReportFixtures.ids.projectA);
    expect(progressFindManyArg.where.employeeId).toBe(dailyReportFixtures.ids.employeeA);
  });
});
