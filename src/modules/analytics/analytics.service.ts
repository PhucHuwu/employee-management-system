import { Injectable } from '@nestjs/common';
import {
  Prisma,
  RevenueType,
  ScheduleRequestStatus,
  ScheduleRequestType,
} from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { RevenueQueryDto } from './dto/analytics-query.dto';

export interface DashboardSummary {
  employeeCount: { active: number; inactive: number; total: number };
  projectCount: { running: number; paused: number; ended: number; total: number };
  pendingRequests: number;
  todayOff: number;
  todayRemote: number;
  totalRevenueActual: number;
  totalRevenueForecast: number;
  overdueProjects: number;
  missingDailyReports: number;
}

export interface ExceptionReports {
  overdueProjects: Array<{
    id: string;
    code: string;
    name: string;
    endDate: Date | null;
  }>;
  missingDailyReports: Array<{
    employeeId: string;
    fullName: string;
    missingDays: number;
  }>;
  budgetOverruns: never[];
}

export interface MonthlyRevenue {
  months: Array<{ month: number; forecast: number; actual: number }>;
  totalForecast: number;
  totalActual: number;
}

export interface ResourceUtilization {
  employees: Array<{
    employeeId: string;
    fullName: string;
    projectCount: number;
    allocationScore: number;
  }>;
  avgProjectsPerEmployee: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary(): Promise<DashboardSummary> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [
      employeeCounts,
      projectCounts,
      pendingRequests,
      todayOff,
      todayRemote,
      revenueSums,
      overdueProjects,
      activeEmployees,
      dailyReportCounts,
    ] = await this.prisma.$transaction([
      this.prisma.employee.groupBy({
        by: ['employmentStatus'],
        where: { deletedAt: null },
        _count: { id: true },
        orderBy: { employmentStatus: 'asc' },
      }),
      this.prisma.project.groupBy({
        by: ['status'],
        _count: { id: true },
        orderBy: { status: 'asc' },
      }),
      this.prisma.scheduleRequest.count({
        where: { status: ScheduleRequestStatus.PENDING },
      }),
      this.prisma.scheduleRequest.count({
        where: {
          status: ScheduleRequestStatus.APPROVED,
          requestDate: today,
          requestType: {
            in: [
              ScheduleRequestType.OFF_FULL_DAY,
              ScheduleRequestType.OFF_AM,
              ScheduleRequestType.OFF_PM,
            ],
          },
        },
      }),
      this.prisma.scheduleRequest.count({
        where: {
          status: ScheduleRequestStatus.APPROVED,
          requestDate: today,
          requestType: {
            in: [
              ScheduleRequestType.REMOTE_FULL_DAY,
              ScheduleRequestType.REMOTE_AM,
              ScheduleRequestType.REMOTE_PM,
            ],
          },
        },
      }),
      this.prisma.projectRevenue.groupBy({
        by: ['revenueType'],
        _sum: { amount: true },
        orderBy: { revenueType: 'asc' },
      }),
      this.prisma.project.count({
        where: {
          status: 'RUNNING',
          endDate: { lt: today },
        },
      }),
      this.prisma.employee.findMany({
        where: { deletedAt: null, employmentStatus: 'ACTIVE' },
        select: { id: true },
      }),
      this.prisma.dailyReport.groupBy({
        by: ['employeeId'],
        where: {
          reportDate: { in: [today, yesterday] },
        },
        _count: { id: true },
        orderBy: { employeeId: 'asc' },
      }),
    ]);

    const activeCount =
      (employeeCounts.find((c) => c.employmentStatus === 'ACTIVE')?._count as { id?: number } | undefined)?.id ?? 0;
    const inactiveCount =
      (employeeCounts.find((c) => c.employmentStatus === 'INACTIVE')?._count as { id?: number } | undefined)?.id ?? 0;

    const runningCount =
      (projectCounts.find((c) => c.status === 'RUNNING')?._count as { id?: number } | undefined)?.id ?? 0;
    const pausedCount =
      (projectCounts.find((c) => c.status === 'PAUSED')?._count as { id?: number } | undefined)?.id ?? 0;
    const endedCount =
      (projectCounts.find((c) => c.status === 'ENDED')?._count as { id?: number } | undefined)?.id ?? 0;

    const totalActual =
      revenueSums.find((r) => r.revenueType === RevenueType.ACTUAL)?._sum
        ?.amount ?? 0;
    const totalForecast =
      revenueSums.find((r) => r.revenueType === RevenueType.FORECAST)?._sum
        ?.amount ?? 0;

    const employeesWithReports = new Set(
      dailyReportCounts.map((d) => d.employeeId),
    );
    const missingDailyReports = activeEmployees.filter(
      (e) => !employeesWithReports.has(e.id),
    ).length;

    return {
      employeeCount: {
        active: activeCount,
        inactive: inactiveCount,
        total: activeCount + inactiveCount,
      },
      projectCount: {
        running: runningCount,
        paused: pausedCount,
        ended: endedCount,
        total: runningCount + pausedCount + endedCount,
      },
      pendingRequests,
      todayOff,
      todayRemote,
      totalRevenueActual: Number(totalActual),
      totalRevenueForecast: Number(totalForecast),
      overdueProjects,
      missingDailyReports,
    };
  }

  async getExceptionReports(): Promise<ExceptionReports> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const overdueProjects = await this.prisma.project.findMany({
      where: {
        status: 'RUNNING',
        endDate: { lt: today },
      },
      select: {
        id: true,
        code: true,
        name: true,
        endDate: true,
      },
    });

    const activeEmployees = await this.prisma.employee.findMany({
      where: { deletedAt: null, employmentStatus: 'ACTIVE' },
      select: { id: true, fullName: true },
    });

    const dailyReportCounts = await this.prisma.dailyReport.groupBy({
      by: ['employeeId'],
      where: {
        reportDate: { in: [today, yesterday] },
      },
      _count: { id: true },
      orderBy: { employeeId: 'asc' },
    });

    const employeesWithReports = new Set(
      dailyReportCounts.map((d) => d.employeeId),
    );
    const missingDailyReports = activeEmployees
      .filter((e) => !employeesWithReports.has(e.id))
      .map((e) => ({
        employeeId: e.id,
        fullName: e.fullName,
        missingDays: 2,
      }));

    return {
      overdueProjects,
      missingDailyReports,
      budgetOverruns: [],
    };
  }

  async getRevenue(query: RevenueQueryDto): Promise<MonthlyRevenue> {
    const year = query.year ?? new Date().getFullYear();

    const where: Prisma.ProjectRevenueWhereInput = {
      periodYear: year,
      ...(query.projectId ? { projectId: query.projectId } : {}),
    };

    const rows = await this.prisma.projectRevenue.groupBy({
      by: ['periodMonth', 'revenueType'],
      where,
      _sum: { amount: true },
      orderBy: [{ periodMonth: 'asc' }, { revenueType: 'asc' }],
    });

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      forecast: 0,
      actual: 0,
    }));

    let totalForecast = 0;
    let totalActual = 0;

    for (const row of rows) {
      const monthIndex = row.periodMonth - 1;
      if (monthIndex < 0 || monthIndex > 11) continue;

      const amount = Number(row._sum.amount ?? 0);
      if (row.revenueType === RevenueType.FORECAST) {
        months[monthIndex].forecast += amount;
        totalForecast += amount;
      } else {
        months[monthIndex].actual += amount;
        totalActual += amount;
      }
    }

    return {
      months,
      totalForecast,
      totalActual,
    };
  }

  async getResourceUtilization(): Promise<ResourceUtilization> {
    const memberships = await this.prisma.projectMember.findMany({
      where: {
        joinedAt: { not: null },
        leftAt: null,
      },
      select: {
        employeeId: true,
        employee: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    const map = new Map<
      string,
      { employeeId: string; fullName: string; projectCount: number }
    >();

    for (const m of memberships) {
      const key = m.employeeId;
      const existing = map.get(key);
      if (existing) {
        existing.projectCount += 1;
      } else {
        map.set(key, {
          employeeId: m.employee.id,
          fullName: m.employee.fullName,
          projectCount: 1,
        });
      }
    }

    const employees = Array.from(map.values()).map((e) => ({
      ...e,
      allocationScore: e.projectCount,
    }));

    const avgProjectsPerEmployee =
      employees.length > 0
        ? employees.reduce((sum, e) => sum + e.projectCount, 0) /
          employees.length
        : 0;

    return {
      employees,
      avgProjectsPerEmployee: Math.round(avgProjectsPerEmployee * 100) / 100,
    };
  }
}
