import { ScheduleRequestStatus, ScheduleRequestType } from '@prisma/client';
import { scheduleFixtures } from './__fixtures__/schedule.fixture';
import { ScheduleService } from './schedule.service';

describe('ScheduleService Integration', () => {
  function setup() {
    const tx = {
      scheduleRequest: {
        update: jest.fn(),
      },
      employee: {
        update: jest.fn(),
      },
    };

    const prisma = {
      scheduleRequest: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        groupBy: jest.fn(),
        count: jest.fn(),
      },
      employee: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation(async (arg: unknown): Promise<unknown> => {
      if (typeof arg === 'function') {
        const callback = arg as (transactionClient: typeof tx) => Promise<unknown>;
        return callback(tx);
      }
      return arg;
    });

    const auditService = {
      log: jest.fn(),
    };

    const service = new ScheduleService(prisma as never, auditService as never);
    return { service, prisma, tx, auditService };
  }

  it('approve + reject + change fixed schedule flow', async () => {
    const { service, prisma, tx } = setup();

    prisma.scheduleRequest.findUnique.mockResolvedValue(
      scheduleFixtures.baseRequest({
        requestType: ScheduleRequestType.CHANGE_FIXED_SCHEDULE,
        requestedSchedule: 'SHIFT_9_6',
      }),
    );
    prisma.employee.findFirst.mockResolvedValue({ id: scheduleFixtures.ids.employeeA });
    prisma.scheduleRequest.findMany.mockResolvedValue([]);
    tx.scheduleRequest.update.mockResolvedValue({
      id: scheduleFixtures.ids.request,
      status: ScheduleRequestStatus.APPROVED,
      approvedAt: new Date('2026-03-10T08:00:00.000Z'),
    });

    const approveResult = await service.approveRequest(
      scheduleFixtures.users.managerScoped,
      scheduleFixtures.ids.request,
    );

    expect(approveResult).toMatchObject({ status: ScheduleRequestStatus.APPROVED });
    expect(tx.employee.update).toHaveBeenCalledWith({
      where: { id: scheduleFixtures.ids.employeeA },
      data: { fixedSchedule: 'SHIFT_9_6' },
    });

    prisma.scheduleRequest.findUnique.mockResolvedValue({
      id: scheduleFixtures.ids.request,
      status: ScheduleRequestStatus.PENDING,
      employeeId: scheduleFixtures.ids.employeeA,
    });
    prisma.scheduleRequest.update.mockResolvedValue({
      id: scheduleFixtures.ids.request,
      status: ScheduleRequestStatus.REJECTED,
      rejectionReason: 'reject reason',
    });

    const rejectResult = await service.rejectRequest(
      scheduleFixtures.users.managerScoped,
      scheduleFixtures.ids.request,
      'reject reason',
    );

    expect(rejectResult).toMatchObject({ status: ScheduleRequestStatus.REJECTED });
  });

  it('daily summary and drill-down flow', async () => {
    const { service, prisma } = setup();

    prisma.scheduleRequest.groupBy.mockResolvedValue([
      {
        requestDate: new Date('2026-03-10'),
        requestType: ScheduleRequestType.OFF_FULL_DAY,
        _count: { _all: 3 },
      },
      {
        requestDate: new Date('2026-03-10'),
        requestType: ScheduleRequestType.REMOTE_PM,
        _count: { _all: 1 },
      },
    ]);
    prisma.scheduleRequest.findMany.mockResolvedValue([
      {
        id: 'drill-1',
        requestType: ScheduleRequestType.OFF_FULL_DAY,
        requestDate: new Date('2026-03-10'),
        employee: {
          id: scheduleFixtures.ids.employeeA,
          fullName: 'Employee A',
          departmentId: '00000000-0000-0000-0000-000000000010',
          fixedSchedule: 'SHIFT_8_5',
        },
      },
    ]);

    const summary = await service.getDailySummary(scheduleFixtures.users.admin, {
      from: '2026-03-01',
      to: '2026-03-31',
    });
    const drillDown = await service.getDailyDrilldown(scheduleFixtures.users.admin, {
      date: '2026-03-10',
      type: ScheduleRequestType.OFF_FULL_DAY,
    });

    expect(summary[0]).toMatchObject({ date: '2026-03-10', total: 4 });
    expect(drillDown).toHaveLength(1);
  });
});
