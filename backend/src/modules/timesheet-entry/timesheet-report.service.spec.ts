import { TimesheetReportService } from './timesheet-report.service';

describe('TimesheetReportService', () => {
  function setup() {
    const prisma = {
      timesheetEntry: {
        findMany: jest.fn(),
      },
    };

    const service = new TimesheetReportService(prisma as never);
    return { service, prisma };
  }

  const startDate = new Date('2026-05-01');
  const endDate = new Date('2026-05-31');

  function makeEntry(overrides: {
    id?: string;
    employeeId?: string;
    employeeName?: string;
    normalWorkingTime?: number;
    overtime?: number;
    projectName?: string;
    taskName?: string;
  } = {}) {
    return {
      id: overrides.id ?? 'e1',
      entryDate: new Date('2026-05-10'),
      normalWorkingTime: overrides.normalWorkingTime ?? 8,
      overtime: overrides.overtime ?? 0,
      projectId: 'p1',
      project: { name: overrides.projectName ?? 'Project A' },
      taskId: 't1',
      task: { name: overrides.taskName ?? 'Task A' },
      employeeId: overrides.employeeId ?? 'emp1',
      employee: { fullName: overrides.employeeName ?? 'Alice' },
    };
  }

  describe('getNormalWorkingReport', () => {
    it('groups by employee and sums totalHours', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findMany.mockResolvedValue([
        makeEntry({ id: 'e1', employeeId: 'emp1', employeeName: 'Alice', normalWorkingTime: 8 }),
        makeEntry({ id: 'e2', employeeId: 'emp1', employeeName: 'Alice', normalWorkingTime: 6 }),
        makeEntry({ id: 'e3', employeeId: 'emp2', employeeName: 'Bob', normalWorkingTime: 7 }),
      ]);

      const result = await service.getNormalWorkingReport(startDate, endDate);

      expect(result).toHaveLength(2);
      const alice = result.find((r) => r.employeeId === 'emp1');
      const bob = result.find((r) => r.employeeId === 'emp2');
      expect(alice?.totalHours).toBe(14);
      expect(alice?.entries).toHaveLength(2);
      expect(bob?.totalHours).toBe(7);
      expect(bob?.entries).toHaveLength(1);
    });

    it('applies employeeId and projectId filters', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findMany.mockResolvedValue([]);
      await service.getNormalWorkingReport(startDate, endDate, 'emp1', 'p1');
      const findManyCalls = prisma.timesheetEntry.findMany.mock.calls as unknown[][];
      const findManyArg = findManyCalls[0]?.[0] as { where: { employeeId: string; projectId: string } };
      expect(findManyArg.where.employeeId).toBe('emp1');
      expect(findManyArg.where.projectId).toBe('p1');
    });
  });

  describe('getOvertimeReport', () => {
    it('groups by employee and sums totalOvertime', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findMany.mockResolvedValue([
        makeEntry({ id: 'e1', employeeId: 'emp1', employeeName: 'Alice', overtime: 2 }),
        makeEntry({ id: 'e2', employeeId: 'emp1', employeeName: 'Alice', overtime: 3 }),
        makeEntry({ id: 'e3', employeeId: 'emp2', employeeName: 'Bob', overtime: 1 }),
      ]);

      const result = await service.getOvertimeReport(startDate, endDate);

      expect(result).toHaveLength(2);
      const alice = result.find((r) => r.employeeId === 'emp1');
      const bob = result.find((r) => r.employeeId === 'emp2');
      expect(alice?.totalOvertime).toBe(5);
      expect(alice?.entries).toHaveLength(2);
      expect(bob?.totalOvertime).toBe(1);
      expect(bob?.entries).toHaveLength(1);
    });
  });

  describe('getTardinessReport', () => {
    it('filters entries with normalWorkingTime < 8 and sums deficientHours', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findMany.mockResolvedValue([
        makeEntry({ id: 'e1', employeeId: 'emp1', employeeName: 'Alice', normalWorkingTime: 6 }),
        makeEntry({ id: 'e2', employeeId: 'emp1', employeeName: 'Alice', normalWorkingTime: 7 }),
        makeEntry({ id: 'e3', employeeId: 'emp2', employeeName: 'Bob', normalWorkingTime: 5 }),
      ]);

      const result = await service.getTardinessReport(startDate, endDate);

      expect(result).toHaveLength(2);
      const alice = result.find((r) => r.employeeId === 'emp1');
      const bob = result.find((r) => r.employeeId === 'emp2');
      expect(alice?.deficientHours).toBe(3);
      expect(alice?.entries).toHaveLength(2);
      expect(bob?.deficientHours).toBe(3);
      expect(bob?.entries).toHaveLength(1);
    });

    it('returns empty array when no tardiness entries', async () => {
      const { service, prisma } = setup();
      prisma.timesheetEntry.findMany.mockResolvedValue([]);

      const result = await service.getTardinessReport(startDate, endDate);
      expect(result).toHaveLength(0);
    });
  });
});
