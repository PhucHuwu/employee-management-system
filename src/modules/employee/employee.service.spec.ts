import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EmployeeService } from './employee.service';

describe('EmployeeService', () => {
  const user = {
    id: '00000000-0000-0000-0000-000000000900',
    role: 'ADMIN' as const,
  };

  function setup() {
    const prisma = {
      employee: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      department: {
        findUnique: jest.fn(),
      },
      position: {
        findUnique: jest.fn(),
      },
      project: {
        count: jest.fn(),
      },
      projectMember: {
        count: jest.fn(),
      },
      scheduleRequest: {
        count: jest.fn(),
      },
      dailyReport: {
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation(async (arg: unknown): Promise<unknown> => {
      if (Array.isArray(arg)) {
        return Promise.all(arg as Promise<unknown>[]);
      }

      if (typeof arg === 'function') {
        const callback = arg as (tx: typeof prisma) => Promise<unknown>;
        return callback(prisma);
      }

      return arg;
    });

    const auditService = { log: jest.fn() };
    const service = new EmployeeService(prisma as never, auditService as never);
    return { service, prisma, auditService };
  }

  it('normalizes fullName and creates employee', async () => {
    const { service, prisma } = setup();

    prisma.department.findUnique.mockResolvedValue({ id: 'd1' });
    prisma.position.findUnique.mockResolvedValue({ id: 'p1' });
    prisma.project.count.mockResolvedValue(1);
    prisma.employee.create.mockResolvedValue({ id: 'e1' });

    await service.createEmployee(user, {
      fullName: '  Nguyen   Van    A  ',
      dob: new Date('2000-01-01'),
      address: 'Hanoi',
      departmentId: '00000000-0000-0000-0000-000000000001',
      positionId: '00000000-0000-0000-0000-000000000011',
      fixedSchedule: 'SHIFT_8_5',
      projectIds: ['00000000-0000-0000-0000-000000000020'],
    });

    const createCalls = prisma.employee.create.mock.calls as unknown[][];
    const createArg = createCalls[0]?.[0] as {
      data: { fullName: string };
    };
    expect(createArg.data.fullName).toBe('Nguyen Van A');
  });

  it('rejects future DOB', async () => {
    const { service } = setup();

    await expect(
      service.createEmployee(user, {
        fullName: 'Test User',
        dob: new Date('2999-01-01'),
        address: 'Hanoi',
        departmentId: '00000000-0000-0000-0000-000000000001',
        positionId: '00000000-0000-0000-0000-000000000011',
        fixedSchedule: 'SHIFT_8_5',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks soft delete when related data exists', async () => {
    const { service, prisma } = setup();

    prisma.employee.findUnique.mockResolvedValue({ id: 'e1', deletedAt: null });
    prisma.scheduleRequest.count.mockResolvedValue(1);
    prisma.dailyReport.count.mockResolvedValue(0);
    prisma.projectMember.count.mockResolvedValue(0);

    await expect(service.softDeleteEmployee(user, 'e1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws when employee detail not found', async () => {
    const { service, prisma } = setup();
    prisma.employee.findUnique.mockResolvedValue(null);

    await expect(service.getEmployeeById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
