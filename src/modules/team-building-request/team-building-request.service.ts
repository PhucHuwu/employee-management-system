import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { CreateTeamBuildingRequestDto } from './dto/create-team-building-request.dto';
import { UpdateTeamBuildingRequestDto } from './dto/update-team-building-request.dto';

@Injectable()
export class TeamBuildingRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeamBuildingRequestDto, pmId: string) {
    return this.prisma.teamBuildingRequest.create({
      data: {
        note: dto.note?.trim() ?? null,
        totalMoney: dto.totalMoney ?? null,
        attachmentUrl: dto.attachmentUrl?.trim() ?? null,
        projectId: dto.projectId,
        pmId,
        participants: dto.participantIds
          ? { create: dto.participantIds.map((employeeId) => ({ employeeId })) }
          : undefined,
      },
      include: { project: true, pm: true, participants: { include: { employee: true } } },
    });
  }

  async findAll(projectId?: string) {
    return this.prisma.teamBuildingRequest.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { project: true, pm: true, participants: { include: { employee: true } } },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.teamBuildingRequest.findUnique({
      where: { id },
      include: { project: true, pm: true, participants: { include: { employee: true } } },
    });
    if (!item) throw new NotFoundException('Team building request not found');
    return item;
  }

  async update(id: string, dto: UpdateTeamBuildingRequestDto) {
    await this.findOne(id);
    return this.prisma.teamBuildingRequest.update({
      where: { id },
      data: {
        note: dto.note === undefined ? undefined : dto.note?.trim() ?? null,
        totalMoney: dto.totalMoney,
        attachmentUrl: dto.attachmentUrl === undefined ? undefined : dto.attachmentUrl?.trim() ?? null,
        participants: dto.participantIds
          ? { deleteMany: {}, create: dto.participantIds.map((employeeId) => ({ employeeId })) }
          : undefined,
      },
      include: { project: true, pm: true, participants: { include: { employee: true } } },
    });
  }

  async approve(id: string) {
    const item = await this.findOne(id);
    if (item.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be approved');
    }
    return this.prisma.teamBuildingRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { project: true, pm: true, participants: { include: { employee: true } } },
    });
  }

  async reject(id: string) {
    const item = await this.findOne(id);
    if (item.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be rejected');
    }
    return this.prisma.teamBuildingRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: { project: true, pm: true, participants: { include: { employee: true } } },
    });
  }

  async cancel(id: string) {
    const item = await this.findOne(id);
    if (item.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be cancelled');
    }
    return this.prisma.teamBuildingRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { project: true, pm: true, participants: { include: { employee: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.teamBuildingRequest.delete({ where: { id } });
  }
}
