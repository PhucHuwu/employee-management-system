import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { CreateTimesheetEntryDto } from './dto/create-timesheet-entry.dto';
import { UpdateTimesheetEntryDto } from './dto/update-timesheet-entry.dto';

@Injectable()
export class TimesheetEntryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTimesheetEntryDto, employeeId: string) {
    const total = dto.normalWorkingTime + (dto.overtime ?? 0);
    if (total > 24) {
      throw new BadRequestException('Total working time cannot exceed 24 hours per day');
    }

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

  async reject(id: string) {
    const existing = await this.findOne(id);
    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only pending entries can be rejected');
    }
    return this.prisma.timesheetEntry.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: { employee: true, project: true, task: true },
    });
  }
}
