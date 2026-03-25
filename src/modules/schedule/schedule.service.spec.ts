import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  ScheduleRequestStatus,
  ScheduleRequestType,
} from '@prisma/client';
import { ScheduleService } from './schedule.service';
import { scheduleFixtures } from './__fixtures__/schedule.fixture';

describe('ScheduleService', () => {
  const userAdmin = scheduleFixtures.users.admin;
  const userManager = scheduleFixtures.users.managerScoped;

  function createService() {
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
        update: jest.fn(),
      },
      $transaction: jest.fn(),
      auditLog: {
        create: jest.fn(),
      },
    };

    const auditService = {
      log: jest.fn(),
    };

    prisma.$transaction.mockImplementation(async (arg: unknown): Promise<unknown> => {
      if (typeof arg === 'function') {
        const callback = arg as (transactionClient: typeof tx) => Promise<unknown>;
        return callback(tx);
      }

      return arg;
    });

    const service = new ScheduleService(prisma as never, auditService as never);
    return { service, prisma, auditService, tx };
  }

  it('rejects processing when request does not exist', async () => {
    const { service, prisma } = createService();
    prisma.scheduleRequest.findUnique.mockResolvedValue(null);

    await expect(
      service.approveRequest(userAdmin, '00000000-0000-0000-0000-000000000010'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects re-approve for non-pending request', async () => {
    const { service, prisma } = createService();

    prisma.scheduleRequest.findUnique.mockResolvedValue(
      scheduleFixtures.baseRequest({ status: ScheduleRequestStatus.APPROVED }),
    );

    await expect(
      service.approveRequest(userAdmin, '00000000-0000-0000-0000-000000000010'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('enforces manager employee scope in reject flow', async () => {
    const { service, prisma } = createService();

    prisma.scheduleRequest.findUnique.mockResolvedValue({
      id: scheduleFixtures.ids.request,
      status: ScheduleRequestStatus.PENDING,
      employeeId: scheduleFixtures.ids.employeeB,
    });

    await expect(
      service.rejectRequest(
        userManager,
        scheduleFixtures.ids.request,
        'Not enough context',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('approves change fixed schedule and updates employee in transaction', async () => {
    const { service, prisma, tx, auditService } = createService();

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

    await service.approveRequest(userManager, scheduleFixtures.ids.request);

    expect(tx.employee.update).toHaveBeenCalledWith({
      where: { id: scheduleFixtures.ids.employeeA },
      data: { fixedSchedule: 'SHIFT_9_6' },
    });
    expect(auditService.log).toHaveBeenCalled();
  });

  it('rejects when conflicting approved AM request exists', async () => {
    const { service, prisma } = createService();

    prisma.scheduleRequest.findUnique.mockResolvedValue(
      scheduleFixtures.baseRequest({ requestType: ScheduleRequestType.OFF_AM }),
    );
    prisma.employee.findFirst.mockResolvedValue({ id: scheduleFixtures.ids.employeeA });
    prisma.scheduleRequest.findMany.mockResolvedValue([
      { requestType: ScheduleRequestType.REMOTE_AM },
    ]);

    await expect(
      service.approveRequest(userManager, scheduleFixtures.ids.request),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns daily drill-down employee list', async () => {
    const { service, prisma } = createService();

    prisma.scheduleRequest.findMany.mockResolvedValue([
      {
        id: 'drill-1',
        requestType: ScheduleRequestType.OFF_PM,
        requestDate: new Date('2026-03-10'),
        employee: {
          id: scheduleFixtures.ids.employeeA,
          fullName: 'Employee A',
          departmentId: '00000000-0000-0000-0000-000000000010',
          fixedSchedule: 'SHIFT_8_5',
        },
      },
    ]);

    const result = await service.getDailyDrilldown(userManager, {
      date: '2026-03-10',
      type: ScheduleRequestType.OFF_PM,
    });

    expect(result).toHaveLength(1);
    const findManyCalls = prisma.scheduleRequest.findMany.mock.calls as unknown[][];
    const findManyCallArg = findManyCalls[0]?.[0] as {
      where: { requestType: ScheduleRequestType };
    };
    expect(findManyCallArg.where.requestType).toBe(ScheduleRequestType.OFF_PM);
  });

  it('reject flow is idempotent for non-pending request', async () => {
    const { service, prisma } = createService();

    prisma.scheduleRequest.findUnique.mockResolvedValue({
      id: scheduleFixtures.ids.request,
      status: ScheduleRequestStatus.APPROVED,
      employeeId: scheduleFixtures.ids.employeeA,
    });

    await expect(
      service.rejectRequest(userAdmin, scheduleFixtures.ids.request, 'duplicate action'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('aggregates daily summary per date and type', async () => {
    const { service, prisma } = createService();

    prisma.scheduleRequest.groupBy.mockResolvedValue([
      {
        requestDate: new Date('2026-03-10'),
        requestType: ScheduleRequestType.OFF_AM,
        _count: { _all: 2 },
      },
      {
        requestDate: new Date('2026-03-10'),
        requestType: ScheduleRequestType.REMOTE_PM,
        _count: { _all: 1 },
      },
    ]);

    const result = await service.getDailySummary(userAdmin, {
      from: '2026-03-01',
      to: '2026-03-31',
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      date: '2026-03-10',
      total: 3,
      counts: {
        OFF_AM: 2,
        REMOTE_PM: 1,
      },
    });
  });
});
