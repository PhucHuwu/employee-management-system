import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { CreateInterviewScheduleDto } from './dto/create-interview-schedule.dto';
import { UpdateInterviewScheduleDto } from './dto/update-interview-schedule.dto';

@Injectable()
export class InterviewScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInterviewScheduleDto) {
    return this.prisma.interviewSchedule.create({
      data: {
        candidateId: dto.candidateId,
        scheduledAt: new Date(dto.scheduledAt),
        location: dto.location?.trim() ?? null,
        meetingLink: dto.meetingLink?.trim() ?? null,
        interviewers: dto.interviewerIds
          ? { connect: dto.interviewerIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { candidate: true, interviewers: true },
    });
  }

  async findAll() {
    return this.prisma.interviewSchedule.findMany({
      orderBy: { scheduledAt: 'desc' },
      include: { candidate: true, interviewers: true },
    });
  }

  async findOne(id: string) {
    const schedule = await this.prisma.interviewSchedule.findUnique({
      where: { id },
      include: { candidate: true, interviewers: true },
    });
    if (!schedule) throw new NotFoundException('Interview schedule not found');
    return schedule;
  }

  async update(id: string, dto: UpdateInterviewScheduleDto) {
    await this.findOne(id);
    return this.prisma.interviewSchedule.update({
      where: { id },
      data: {
        candidateId: dto.candidateId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        location: dto.location === undefined ? undefined : dto.location?.trim() ?? null,
        meetingLink: dto.meetingLink === undefined ? undefined : dto.meetingLink?.trim() ?? null,
        interviewers: dto.interviewerIds
          ? { set: dto.interviewerIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { candidate: true, interviewers: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.interviewSchedule.delete({ where: { id } });
  }
}
