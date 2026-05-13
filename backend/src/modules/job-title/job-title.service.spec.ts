import { BadRequestException, ConflictException } from '@nestjs/common';
import { JobTitleService } from './job-title.service';

describe('JobTitleService', () => {
  const user = {
    id: '00000000-0000-0000-0000-000000000900',
    role: 'ADMIN' as const,
  };

  function setup() {
    const prisma = {
      jobTitle: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      employee: {
        findUnique: jest.fn(),
      },
      employeeTitleHistory: {
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const auditService = { log: jest.fn() };
    const service = new JobTitleService(prisma as never, auditService as never);
    return { service, prisma };
  }

  it('blocks strict promotion when level does not increase', async () => {
    const { service, prisma } = setup();

    prisma.employee.findUnique.mockResolvedValue({
      id: 'e1',
      deletedAt: null,
      titleHistories: [{ newJobTitleId: 'j1', newJobTitle: { levelOrder: 3 } }],
    });
    prisma.jobTitle.findUnique.mockResolvedValue({ id: 'j2', levelOrder: 2 });

    await expect(
      service.promoteEmployee(user, 'e1', {
        newJobTitleId: 'j2',
        effectiveDate: new Date('2026-04-01'),
        strictPolicy: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks duplicate effective date promotion', async () => {
    const { service, prisma } = setup();

    prisma.employee.findUnique.mockResolvedValue({
      id: 'e1',
      deletedAt: null,
      titleHistories: [],
    });
    prisma.jobTitle.findUnique.mockResolvedValue({ id: 'j2', levelOrder: 2 });
    prisma.employeeTitleHistory.findUnique.mockResolvedValue({ id: 'dup' });

    await expect(
      service.promoteEmployee(user, 'e1', {
        newJobTitleId: 'j2',
        effectiveDate: new Date('2026-04-01'),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
