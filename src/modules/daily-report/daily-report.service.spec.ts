import { ForbiddenException } from '@nestjs/common';
import { DailyReportService } from './daily-report.service';
import { dailyReportFixtures } from './__fixtures__/daily-report.fixture';

describe('DailyReportService', () => {
  const manager = dailyReportFixtures.users.managerScoped;
  const admin = dailyReportFixtures.users.admin;

  function createService() {
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

  it('blocks manager from querying employee out of scope', async () => {
    const { service } = createService();

    await expect(
      service.getDailyReports(manager, {
        employeeId: dailyReportFixtures.ids.employeeB,
        page: 1,
        size: 20,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns paged response for in-scope query', async () => {
    const { service, prisma } = createService();

    prisma.$transaction.mockResolvedValue([1, [{ id: 'r1', task: 'Task' }]]);

    const result = await service.getDailyReports(manager, {
      employeeId: dailyReportFixtures.ids.employeeA,
      page: 1,
      size: 20,
    });

    expect(result).toMatchObject({
      total: 1,
      page: 1,
      size: 20,
      totalPages: 1,
    });
    expect(result.data).toHaveLength(1);
  });

  it('applies filters for employee/project/date in getDailyReports', async () => {
    const { service, prisma } = createService();
    prisma.$transaction.mockResolvedValue([0, []]);

    await service.getDailyReports(admin, {
      employeeId: dailyReportFixtures.ids.employeeA,
      projectId: dailyReportFixtures.ids.projectA,
      from: '2026-03-01',
      to: '2026-03-31',
      page: 1,
      size: 20,
    });

    const countCalls = prisma.dailyReport.count.mock.calls as unknown[][];
    const countFirstArg = countCalls[0]?.[0] as {
      where: {
        employeeId: string;
        projectId: string;
        reportDate: {
          gte: Date;
          lte: Date;
        };
      };
    };

    expect(countFirstArg.where.employeeId).toBe(dailyReportFixtures.ids.employeeA);
    expect(countFirstArg.where.projectId).toBe(dailyReportFixtures.ids.projectA);
    expect(countFirstArg.where.reportDate.gte).toEqual(new Date('2026-03-01'));
    expect(countFirstArg.where.reportDate.lte).toEqual(new Date('2026-03-31'));
  });

  it('blocks manager when project progress employee is out of scope', async () => {
    const { service } = createService();

    await expect(
      service.getProjectDailyProgress(manager, dailyReportFixtures.ids.projectA, {
        memberId: dailyReportFixtures.ids.employeeB,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns project progress for in-scope member', async () => {
    const { service, prisma } = createService();
    prisma.dailyReport.findMany.mockResolvedValue([{ id: 'p1' }]);

    const result = await service.getProjectDailyProgress(
      manager,
      dailyReportFixtures.ids.projectA,
      {
        memberId: dailyReportFixtures.ids.employeeA,
        from: '2026-03-01',
        to: '2026-03-15',
      },
    );

    expect(result).toHaveLength(1);
    const findManyCalls = prisma.dailyReport.findMany.mock.calls as unknown[][];
    const findManyFirstArg = findManyCalls[0]?.[0] as {
      where: {
        projectId: string;
        employeeId: string;
      };
    };

    expect(findManyFirstArg.where.projectId).toBe(dailyReportFixtures.ids.projectA);
    expect(findManyFirstArg.where.employeeId).toBe(dailyReportFixtures.ids.employeeA);
  });
});
