import { BadRequestException } from '@nestjs/common';
import { PositionService } from './position.service';

describe('PositionService', () => {
  const user = {
    id: '00000000-0000-0000-0000-000000000900',
    role: 'ADMIN' as const,
  };

  function setup() {
    const prisma = {
      position: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      employee: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const auditService = { log: jest.fn() };
    const service = new PositionService(prisma as never, auditService as never);
    return { service, prisma };
  }

  it('blocks deleting in-use position', async () => {
    const { service, prisma } = setup();
    prisma.position.findUnique.mockResolvedValue({ id: 'p1' });
    prisma.employee.count.mockResolvedValue(1);

    await expect(service.deletePosition(user, 'p1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates employee position in bulk', async () => {
    const { service, prisma } = setup();
    prisma.position.findUnique.mockResolvedValue({ id: 'p2' });
    prisma.employee.findMany.mockResolvedValue([
      { id: 'e1', positionId: 'p1' },
      { id: 'e2', positionId: 'p1' },
    ]);
    prisma.employee.updateMany.mockResolvedValue({ count: 2 });

    const result = await service.bulkUpdateEmployeePosition(user, {
      positionId: 'p2',
      employeeIds: ['e1', 'e2'],
    });

    expect(result).toMatchObject({ updatedCount: 2 });
  });
});
