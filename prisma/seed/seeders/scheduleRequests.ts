import { FixedSchedule, ScheduleRequestStatus, ScheduleRequestType } from '@prisma/client';

import type { SeedContext } from '../context';

export const seedScheduleRequests = async (ctx: SeedContext): Promise<void> => {
  const { prisma, ids, makeId, state } = ctx;

  const baseItems = [
    {
      id: '90000000-0000-0000-0000-000000000001',
      employeeId: ids.employees.nguyenAn,
      requestType: ScheduleRequestType.OFF_FULL_DAY,
      requestDate: new Date('2026-04-05'),
      requestedSchedule: null,
      status: ScheduleRequestStatus.PENDING,
      reason: 'Family event',
      rejectionReason: null,
      approvedBy: null,
      approvedAt: null,
    },
    {
      id: '90000000-0000-0000-0000-000000000002',
      employeeId: ids.employees.tranBinh,
      requestType: ScheduleRequestType.REMOTE_FULL_DAY,
      requestDate: new Date('2026-04-06'),
      requestedSchedule: null,
      status: ScheduleRequestStatus.APPROVED,
      reason: 'Focus coding day',
      rejectionReason: null,
      approvedBy: ids.users.managerEngineering,
      approvedAt: new Date('2026-04-04T09:00:00Z'),
    },
    {
      id: '90000000-0000-0000-0000-000000000003',
      employeeId: ids.employees.hoangEm,
      requestType: ScheduleRequestType.OFF_AM,
      requestDate: new Date('2026-04-07'),
      requestedSchedule: null,
      status: ScheduleRequestStatus.REJECTED,
      reason: 'Medical checkup',
      rejectionReason: 'Release day, please reschedule',
      approvedBy: ids.users.managerEngineering,
      approvedAt: new Date('2026-04-05T10:00:00Z'),
    },
    {
      id: '90000000-0000-0000-0000-000000000004',
      employeeId: ids.employees.leCuong,
      requestType: ScheduleRequestType.CHANGE_FIXED_SCHEDULE,
      requestDate: new Date('2026-04-08'),
      requestedSchedule: FixedSchedule.SHIFT_9_6,
      status: ScheduleRequestStatus.APPROVED,
      reason: 'Align with customer timezone',
      rejectionReason: null,
      approvedBy: ids.users.managerBusiness,
      approvedAt: new Date('2026-04-06T08:30:00Z'),
    },
  ];

  for (const item of baseItems) {
    await prisma.scheduleRequest.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }

  const requestTypes = [
    ScheduleRequestType.OFF_FULL_DAY,
    ScheduleRequestType.OFF_AM,
    ScheduleRequestType.OFF_PM,
    ScheduleRequestType.REMOTE_FULL_DAY,
    ScheduleRequestType.REMOTE_AM,
    ScheduleRequestType.REMOTE_PM,
    ScheduleRequestType.CHANGE_FIXED_SCHEDULE,
  ] as const;

  const pickStatus = (requestType: ScheduleRequestType, i: number): ScheduleRequestStatus => {
    const r = i % 100;

    if (requestType === ScheduleRequestType.CHANGE_FIXED_SCHEDULE) {
      if (r < 60) return ScheduleRequestStatus.APPROVED;
      if (r < 75) return ScheduleRequestStatus.PENDING;
      if (r < 92) return ScheduleRequestStatus.REJECTED;
      return ScheduleRequestStatus.CANCELLED;
    }

    if (r < 70) return ScheduleRequestStatus.APPROVED;
    if (r < 85) return ScheduleRequestStatus.PENDING;
    if (r < 95) return ScheduleRequestStatus.REJECTED;
    return ScheduleRequestStatus.CANCELLED;
  };

  const bulkCount = 240;

  for (let i = 0; i < bulkCount; i += 1) {
    const employeeId = state.employeeIds[i % Math.min(state.employeeIds.length, 20)];
    const requestType = requestTypes[(i * 7 + 3) % requestTypes.length];
    const status = pickStatus(requestType, i);
    const requestDate = new Date(2026, i % 6, (i % 28) + 1);

    const approvedBy =
      status === ScheduleRequestStatus.APPROVED || status === ScheduleRequestStatus.REJECTED
        ? i % 2 === 0
          ? ids.users.managerEngineering
          : ids.users.managerBusiness
        : null;

    const approvedAt = approvedBy ? new Date(2026, i % 6, (i % 28) + 1, 9, (i % 4) * 15) : null;

    const requestedSchedule =
      requestType === ScheduleRequestType.CHANGE_FIXED_SCHEDULE
        ? i % 2 === 0
          ? FixedSchedule.SHIFT_8_5
          : FixedSchedule.SHIFT_9_6
        : null;

    const rejectionReason =
      status === ScheduleRequestStatus.REJECTED
        ? requestType === ScheduleRequestType.REMOTE_FULL_DAY ||
          requestType === ScheduleRequestType.REMOTE_AM ||
          requestType === ScheduleRequestType.REMOTE_PM
          ? 'Onsite required for meeting'
          : 'Team capacity constraint'
        : null;

    const reason =
      requestType === ScheduleRequestType.CHANGE_FIXED_SCHEDULE
        ? 'Adjust working hours'
        : requestType === ScheduleRequestType.OFF_FULL_DAY ||
            requestType === ScheduleRequestType.OFF_AM ||
            requestType === ScheduleRequestType.OFF_PM
          ? 'Personal leave'
          : 'Remote work';

    await prisma.scheduleRequest.upsert({
      where: { id: makeId('95000000', i + 1) },
      update: {
        employeeId,
        requestType,
        requestDate,
        requestedSchedule,
        status,
        reason: `${reason} #${i + 1}`,
        rejectionReason,
        approvedBy,
        approvedAt,
      },
      create: {
        id: makeId('95000000', i + 1),
        employeeId,
        requestType,
        requestDate,
        requestedSchedule,
        status,
        reason: `${reason} #${i + 1}`,
        rejectionReason,
        approvedBy,
        approvedAt,
      },
    });
  }

  const offRemoteTypes = [
    ScheduleRequestType.OFF_FULL_DAY,
    ScheduleRequestType.OFF_AM,
    ScheduleRequestType.OFF_PM,
    ScheduleRequestType.REMOTE_FULL_DAY,
    ScheduleRequestType.REMOTE_AM,
    ScheduleRequestType.REMOTE_PM,
  ] as const;

  const pickOffRemoteStatus = (i: number): ScheduleRequestStatus => {
    const r = i % 100;
    if (r < 72) return ScheduleRequestStatus.APPROVED;
    if (r < 90) return ScheduleRequestStatus.PENDING;
    return ScheduleRequestStatus.REJECTED;
  };

  const marchOffRemoteCount = 200;

  for (let i = 0; i < marchOffRemoteCount; i += 1) {
    const employeeId = state.employeeIds[i % Math.min(state.employeeIds.length, 22)];
    const requestType = offRemoteTypes[(i * 5 + 1) % offRemoteTypes.length];
    const status = pickOffRemoteStatus(i);

    const day = (i % 28) + 1;
    const requestDate = new Date(2026, 2, day);

    const approvedBy =
      status === ScheduleRequestStatus.APPROVED || status === ScheduleRequestStatus.REJECTED
        ? i % 2 === 0
          ? ids.users.managerEngineering
          : ids.users.managerBusiness
        : null;

    const approvedAt =
      approvedBy !== null ? new Date(2026, 2, Math.max(1, day - 1), 9, (i % 4) * 15) : null;

    const rejectionReason =
      status === ScheduleRequestStatus.REJECTED
        ? requestType === ScheduleRequestType.OFF_FULL_DAY ||
          requestType === ScheduleRequestType.OFF_AM ||
          requestType === ScheduleRequestType.OFF_PM
          ? 'Không đáp ứng lịch bàn giao'
          : 'Cần onsite cho các buổi họp'
        : null;

    const reason =
      requestType === ScheduleRequestType.OFF_FULL_DAY ||
      requestType === ScheduleRequestType.OFF_AM ||
      requestType === ScheduleRequestType.OFF_PM
        ? 'Off request'
        : 'Remote request';

    await prisma.scheduleRequest.upsert({
      where: { id: makeId('95300000', i + 1) },
      update: {
        employeeId,
        requestType,
        requestDate,
        requestedSchedule: null,
        status,
        reason: `${reason} #${i + 1}`,
        rejectionReason,
        approvedBy,
        approvedAt,
      },
      create: {
        id: makeId('95300000', i + 1),
        employeeId,
        requestType,
        requestDate,
        requestedSchedule: null,
        status,
        reason: `${reason} #${i + 1}`,
        rejectionReason,
        approvedBy,
        approvedAt,
      },
    });
  }
};
