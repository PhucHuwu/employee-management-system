import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { CreateTimesheetEntryDto } from './dto/create-timesheet-entry.dto';
import { UpdateTimesheetEntryDto } from './dto/update-timesheet-entry.dto';
import { ComplainTimesheetEntryDto } from './dto/complain-timesheet-entry.dto';
import { RejectTimesheetEntryDto } from './dto/reject-timesheet-entry.dto';

@Injectable()
export class TimesheetEntryService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateDayConstraints(
    entryDate: Date,
    employeeId: string,
    normalWorkingTime: number,
    overtime: number,
    excludeId?: string,
  ) {
    const startOfDay = new Date(entryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(entryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const offDay = await this.prisma.offDay.findUnique({
      where: { offDate: startOfDay },
    });
    if (offDay) {
      throw new BadRequestException('Cannot log timesheet on an off day');
    }

    const existingEntries = await this.prisma.timesheetEntry.findMany({
      where: {
        employeeId,
        entryDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    const totalNormal = existingEntries.reduce((sum, e) => sum + e.normalWorkingTime, 0) + normalWorkingTime;
    if (totalNormal > 8) {
      throw new BadRequestException('Total normal working time cannot exceed 8 hours per day');
    }

    const totalHours = existingEntries.reduce((sum, e) => sum + e.normalWorkingTime + e.overtime, 0) + normalWorkingTime + overtime;
    if (totalHours > 24) {
      throw new BadRequestException('Total working time cannot exceed 24 hours per day');
    }
  }

  async create(dto: CreateTimesheetEntryDto, employeeId: string) {
    const total = dto.normalWorkingTime + (dto.overtime ?? 0);
    if (total > 24) {
      throw new BadRequestException('Total working time cannot exceed 24 hours per day');
    }

    await this.validateDayConstraints(new Date(dto.entryDate), employeeId, dto.normalWorkingTime, dto.overtime ?? 0);

    return this.prisma.timesheetEntry.create({
      data: {
        entryDate: new Date(dto.entryDate),
        normalWorkingTime: dto.normalWorkingTime,
        overtime: dto.overtime ?? 0,
        note: dto.note?.trim() ?? null,
        projectId: dto.projectId,
        taskId: dto.taskId,
        employeeId,
      },
      include: { employee: true, project: true, task: true },
    });
  }

  async findAll(employeeId?: string, projectId?: string) {
    return this.prisma.timesheetEntry.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(projectId ? { projectId } : {}),
      },
      orderBy: { entryDate: 'desc' },
      include: { employee: true, project: true, task: true },
    });
  }

  async findOne(id: string) {
    const entry = await this.prisma.timesheetEntry.findUnique({
      where: { id },
      include: { employee: true, project: true, task: true },
    });
    if (!entry) throw new NotFoundException('Timesheet entry not found');
    return entry;
  }

  async update(id: string, dto: UpdateTimesheetEntryDto) {
    const existing = await this.findOne(id);
    if (existing.status !== 'DRAFT' && existing.status !== 'PENDING') {
      throw new BadRequestException('Cannot edit approved or rejected timesheet entries');
    }

    const normal = dto.normalWorkingTime ?? existing.normalWorkingTime;
    const overtime = dto.overtime ?? existing.overtime;
    if (normal + overtime > 24) {
      throw new BadRequestException('Total working time cannot exceed 24 hours per day');
    }

    if (dto.entryDate || dto.normalWorkingTime !== undefined || dto.overtime !== undefined) {
      await this.validateDayConstraints(
        dto.entryDate ? new Date(dto.entryDate) : existing.entryDate,
        existing.employeeId,
        normal,
        overtime,
        id,
      );
    }

    return this.prisma.timesheetEntry.update({
      where: { id },
      data: {
        entryDate: dto.entryDate ? new Date(dto.entryDate) : undefined,
        normalWorkingTime: dto.normalWorkingTime,
        overtime: dto.overtime,
        note: dto.note === undefined ? undefined : dto.note?.trim() ?? null,
        projectId: dto.projectId,
        taskId: dto.taskId,
      },
      include: { employee: true, project: true, task: true },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    if (existing.status !== 'DRAFT' && existing.status !== 'PENDING') {
      throw new BadRequestException('Cannot delete approved or rejected timesheet entries');
    }
    return this.prisma.timesheetEntry.delete({ where: { id } });
  }

  async submit(id: string) {
    const existing = await this.findOne(id);
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft entries can be submitted');
    }
    return this.prisma.timesheetEntry.update({
      where: { id },
      data: { status: 'PENDING' },
      include: { employee: true, project: true, task: true },
    });
  }

  async complain(id: string, dto: ComplainTimesheetEntryDto) {
    const existing = await this.findOne(id);
    if (existing.status !== 'PENDING' && existing.status !== 'REJECTED') {
      throw new BadRequestException('Can only complain about pending or rejected entries');
    }
    return this.prisma.timesheetEntry.update({
      where: { id },
      data: {
        complainNote: dto.complainNote.trim(),
        status: 'DRAFT',
      },
      include: { employee: true, project: true, task: true },
    });
  }

  async approve(id: string) {
    const existing = await this.findOne(id);
    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only pending entries can be approved');
    }
    return this.prisma.timesheetEntry.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { employee: true, project: true, task: true },
    });
  }

  async bulkApprove(ids: string[]) {
    const entries = await this.prisma.timesheetEntry.findMany({
      where: { id: { in: ids } },
    });

    if (entries.length !== ids.length) {
      throw new NotFoundException('Some timesheet entries were not found');
    }

    const nonPending = entries.filter((e) => e.status !== 'PENDING');
    if (nonPending.length > 0) {
      throw new BadRequestException('All entries must be in PENDING status to be approved');
    }

    await this.prisma.timesheetEntry.updateMany({
      where: { id: { in: ids } },
      data: { status: 'APPROVED' },
    });

    return this.prisma.timesheetEntry.findMany({
      where: { id: { in: ids } },
      include: { employee: true, project: true, task: true },
    });
  }

  async reject(id: string, dto: RejectTimesheetEntryDto) {
    const existing = await this.findOne(id);
    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only pending entries can be rejected');
    }
    return this.prisma.timesheetEntry.update({
      where: { id },
      data: {
        status: 'REJECTED',
        note: dto.reason.trim(),
      },
      include: { employee: true, project: true, task: true },
    });
  }

  async getMonitoring(
    startDate?: Date,
    endDate?: Date,
    projectId?: string,
    employeeId?: string,
  ) {
    const entries = await this.prisma.timesheetEntry.findMany({
      where: {
        ...(startDate || endDate
          ? {
              entryDate: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
        ...(projectId ? { projectId } : {}),
        ...(employeeId ? { employeeId } : {}),
      },
      include: { employee: true, project: true, task: true },
      orderBy: { entryDate: 'desc' },
    });

    const byProject = new Map<string, { projectId: string; projectName: string; normalHours: number; overtime: number }>();
    const byEmployee = new Map<string, { employeeId: string; employeeName: string; normalHours: number; overtime: number }>();

    for (const entry of entries) {
      const pExisting = byProject.get(entry.projectId);
      if (pExisting) {
        pExisting.normalHours += entry.normalWorkingTime;
        pExisting.overtime += entry.overtime;
      } else {
        byProject.set(entry.projectId, {
          projectId: entry.projectId,
          projectName: entry.project.name,
          normalHours: entry.normalWorkingTime,
          overtime: entry.overtime,
        });
      }

      const eExisting = byEmployee.get(entry.employeeId);
      if (eExisting) {
        eExisting.normalHours += entry.normalWorkingTime;
        eExisting.overtime += entry.overtime;
      } else {
        byEmployee.set(entry.employeeId, {
          employeeId: entry.employeeId,
          employeeName: entry.employee.fullName,
          normalHours: entry.normalWorkingTime,
          overtime: entry.overtime,
        });
      }
    }

    return {
      totalEntries: entries.length,
      totalNormalHours: entries.reduce((sum, e) => sum + e.normalWorkingTime, 0),
      totalOvertime: entries.reduce((sum, e) => sum + e.overtime, 0),
      byProject: Array.from(byProject.values()),
      byEmployee: Array.from(byEmployee.values()),
    };
  }
}
