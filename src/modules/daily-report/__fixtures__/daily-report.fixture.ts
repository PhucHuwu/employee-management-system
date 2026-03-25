import { Role } from '@prisma/client';
import { AuthUser } from '@/modules/identity/auth-user.type';

export const dailyReportFixtures = {
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
    employeeA: '00000000-0000-0000-0000-000000000111',
    employeeB: '00000000-0000-0000-0000-000000000112',
    projectA: '00000000-0000-0000-0000-000000000020',
    projectB: '00000000-0000-0000-0000-000000000021',
  },
};
