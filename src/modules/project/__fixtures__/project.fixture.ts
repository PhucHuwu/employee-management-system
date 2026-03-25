import { ProjectStatus, RevenueType, Role } from '@prisma/client';
import { AuthUser } from '@/modules/identity/auth-user.type';

export const projectFixtures = {
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
      projectScopeIds: ['00000000-0000-0000-0000-000000000020'],
      departmentScopeId: '00000000-0000-0000-0000-000000000010',
      scopeEmployeeIds: ['00000000-0000-0000-0000-000000000111'],
    } satisfies AuthUser,
  },
  ids: {
    projectA: '00000000-0000-0000-0000-000000000020',
    projectB: '00000000-0000-0000-0000-000000000021',
    customerA: '00000000-0000-0000-0000-000000000120',
    employeeA: '00000000-0000-0000-0000-000000000111',
    revenueA: '00000000-0000-0000-0000-000000000220',
    documentA: '00000000-0000-0000-0000-000000000320',
    memberA: '00000000-0000-0000-0000-000000000420',
  },
  createProjectInput: {
    code: 'PRJ-CORE',
    name: 'Core HR',
    status: ProjectStatus.RUNNING,
    startDate: '2026-03-01',
    endDate: '2026-12-31',
    description: 'Core implementation project',
  },
  createRevenueInput: {
    periodMonth: 3,
    periodYear: 2026,
    revenueType: RevenueType.FORECAST,
    amount: 12345.67,
    currency: 'usd',
    note: 'Sprint forecast',
  },
  createCustomerInput: {
    companyName: 'Acme Corp',
    taxCode: 'TAX-001',
    contactEmail: 'contact@acme.test',
    cooperationStatus: 'ACTIVE',
  },
  createMemberInput: {
    employeeId: '00000000-0000-0000-0000-000000000111',
    roleInProject: 'Backend',
    joinedAt: '2026-03-10',
  },
  createDocumentInput: {
    fileName: 'architecture.md',
    mimeType: 'text/markdown',
    sizeBytes: 12,
    contentBase64: Buffer.from('hello world!').toString('base64'),
    uploadedBy: '00000000-0000-0000-0000-000000000001',
  },
};
