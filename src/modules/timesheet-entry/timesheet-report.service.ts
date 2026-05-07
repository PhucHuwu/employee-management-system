import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

export interface ReportEntry {
  id: string;
  entryDate: Date;
  normalWorkingTime: number;
  overtime: number;
  projectId: string;
  projectName: string;
  taskId: string;
  taskName: string;
}

export interface NormalWorkingReportItem {
  employeeId: string;
  employeeName: string;
  totalHours: number;
  entries: ReportEntry[];
}

export interface OvertimeReportItem {
  employeeId: string;
  employeeName: string;
  totalOvertime: number;
  entries: ReportEntry[];
}

export interface TardinessReportItem {
  employeeId: string;
  employeeName: string;
  deficientHours: number;
  entries: ReportEntry[];
}

@Injectable()
export class TimesheetReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getNormalWorkingReport(
    startDate: Date,
    endDate: Date,
    employeeId?: string,
    projectId?: string,
  ): Promise<NormalWorkingReportItem[]> {
    const entries = await this.prisma.timesheetEntry.findMany({
      where: {
        entryDate: { gte: startDate, lte: endDate },
        ...(employeeId ? { employeeId } : {}),
        ...(projectId ? { projectId } : {}),
      },
      include: { employee: true, project: true, task: true },
      orderBy: { entryDate: 'desc' },
    });

    const grouped = new Map<string, NormalWorkingReportItem>();

    for (const entry of entries) {
      const key = entry.employeeId;
      const existing = grouped.get(key);

      const reportEntry: ReportEntry = {
        id: entry.id,
        entryDate: entry.entryDate,
        normalWorkingTime: entry.normalWorkingTime,
        overtime: entry.overtime,
        projectId: entry.projectId,
        projectName: entry.project.name,
        taskId: entry.taskId,
        taskName: entry.task.name,
      };

      if (existing) {
        existing.totalHours += entry.normalWorkingTime;
        existing.entries.push(reportEntry);
      } else {
        grouped.set(key, {
          employeeId: entry.employeeId,
          employeeName: entry.employee.fullName,
          totalHours: entry.normalWorkingTime,
          entries: [reportEntry],
        });
      }
    }

    return Array.from(grouped.values());
  }

  async getOvertimeReport(
    startDate: Date,
    endDate: Date,
    employeeId?: string,
    projectId?: string,
  ): Promise<OvertimeReportItem[]> {
    const entries = await this.prisma.timesheetEntry.findMany({
      where: {
        entryDate: { gte: startDate, lte: endDate },
        ...(employeeId ? { employeeId } : {}),
        ...(projectId ? { projectId } : {}),
      },
      include: { employee: true, project: true, task: true },
      orderBy: { entryDate: 'desc' },
    });

    const grouped = new Map<string, OvertimeReportItem>();

    for (const entry of entries) {
      const key = entry.employeeId;
      const existing = grouped.get(key);

      const reportEntry: ReportEntry = {
        id: entry.id,
        entryDate: entry.entryDate,
        normalWorkingTime: entry.normalWorkingTime,
        overtime: entry.overtime,
        projectId: entry.projectId,
        projectName: entry.project.name,
        taskId: entry.taskId,
        taskName: entry.task.name,
      };

      if (existing) {
        existing.totalOvertime += entry.overtime;
        existing.entries.push(reportEntry);
      } else {
        grouped.set(key, {
          employeeId: entry.employeeId,
          employeeName: entry.employee.fullName,
          totalOvertime: entry.overtime,
          entries: [reportEntry],
        });
      }
    }

    return Array.from(grouped.values());
  }

  async getTardinessReport(
    startDate: Date,
    endDate: Date,
    employeeId?: string,
    projectId?: string,
  ): Promise<TardinessReportItem[]> {
    const entries = await this.prisma.timesheetEntry.findMany({
      where: {
        entryDate: { gte: startDate, lte: endDate },
        normalWorkingTime: { lt: 8 },
        ...(employeeId ? { employeeId } : {}),
        ...(projectId ? { projectId } : {}),
      },
      include: { employee: true, project: true, task: true },
      orderBy: { entryDate: 'desc' },
    });

    const grouped = new Map<string, TardinessReportItem>();

    for (const entry of entries) {
      const key = entry.employeeId;
      const existing = grouped.get(key);
      const deficient = 8 - entry.normalWorkingTime;

      const reportEntry: ReportEntry = {
        id: entry.id,
        entryDate: entry.entryDate,
        normalWorkingTime: entry.normalWorkingTime,
        overtime: entry.overtime,
        projectId: entry.projectId,
        projectName: entry.project.name,
        taskId: entry.taskId,
        taskName: entry.task.name,
      };

      if (existing) {
        existing.deficientHours += deficient;
        existing.entries.push(reportEntry);
      } else {
        grouped.set(key, {
          employeeId: entry.employeeId,
          employeeName: entry.employee.fullName,
          deficientHours: deficient,
          entries: [reportEntry],
        });
      }
    }

    return Array.from(grouped.values());
  }
}
