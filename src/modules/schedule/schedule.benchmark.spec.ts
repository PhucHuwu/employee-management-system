import { ScheduleRequestType } from '@prisma/client';
import { scheduleFixtures } from './__fixtures__/schedule.fixture';
import { ScheduleService } from './schedule.service';

describe('Schedule Summary Benchmark', () => {
  function setup() {
    const prisma = {
      scheduleRequest: {
        groupBy: jest.fn(),
      },
    };
    const auditService = { log: jest.fn() };
    const service = new ScheduleService(prisma as never, auditService as never);
    return { service, prisma };
  }

  function mockRows(days: number) {
    return Array.from({ length: days }).map((_, index) => ({
      requestDate: new Date(`2026-03-${String((index % 28) + 1).padStart(2, '0')}`),
      requestType: ScheduleRequestType.OFF_FULL_DAY,
      _count: { _all: 3 },
    }));
  }

  it('handles 30-day summary query quickly with mocked dataset', async () => {
    const { service, prisma } = setup();
    prisma.scheduleRequest.groupBy.mockResolvedValue(mockRows(30));

    const start = Date.now();
    const result = await service.getDailySummary(scheduleFixtures.users.admin, {
      from: '2026-03-01',
      to: '2026-03-30',
    });
    const elapsedMs = Date.now() - start;

    expect(result.length).toBeGreaterThan(0);
    expect(elapsedMs).toBeLessThan(200);
  });

  it('handles 90-day summary query quickly with mocked dataset', async () => {
    const { service, prisma } = setup();
    prisma.scheduleRequest.groupBy.mockResolvedValue(mockRows(90));

    const start = Date.now();
    const result = await service.getDailySummary(scheduleFixtures.users.admin, {
      from: '2026-01-01',
      to: '2026-03-31',
    });
    const elapsedMs = Date.now() - start;

    expect(result.length).toBeGreaterThan(0);
    expect(elapsedMs).toBeLessThan(250);
  });
});
