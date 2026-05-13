import {
  Role,
  ScheduleRequestStatus,
  ScheduleRequestType,
  type FixedSchedule,
} from '@prisma/client';
import { AuthUser } from '@/modules/identity/auth-user.type';

export const scheduleFixtures = {
  users: {
    admin: {
      id: '00000000-0000-0000-0000-000000000001',
      role: Role.ADMIN,
      email: 'admin@local.dev',
    } satisfies AuthUser,
    managerScoped: {
      id: '00000000-0000-0000-0000-000000000002',
      role: Role.MANAGER,
      email: 'manager@local.dev',
      scopeEmployeeIds: ['00000000-0000-0000-0000-000000000111'],
      departmentScopeId: '00000000-0000-0000-0000-000000000010',
      projectScopeIds: ['00000000-0000-0000-0000-000000000020'],
    } satisfies AuthUser,
  },
  ids: {
    request: '00000000-0000-0000-0000-000000000301',
    employeeA: '00000000-0000-0000-0000-000000000111',
    employeeB: '00000000-0000-0000-0000-000000000112',
    projectA: '00000000-0000-0000-0000-000000000020',
  },
  baseRequest(params?: {
    requestType?: ScheduleRequestType;
    status?: ScheduleRequestStatus;
    requestedSchedule?: FixedSchedule | null;
    employeeId?: string;
  }) {
    return {
      id: scheduleFixtures.ids.request,
      employeeId: params?.employeeId ?? scheduleFixtures.ids.employeeA,
      requestType: params?.requestType ?? ScheduleRequestType.OFF_FULL_DAY,
      requestDate: new Date('2026-03-10'),
      requestedSchedule: params?.requestedSchedule ?? null,
      status: params?.status ?? ScheduleRequestStatus.PENDING,
      employee: {
        id: scheduleFixtures.ids.employeeA,
        fixedSchedule: 'SHIFT_8_5' as FixedSchedule,
      },
    };
  },
};
