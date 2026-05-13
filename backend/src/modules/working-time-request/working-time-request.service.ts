import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { CreateWorkingTimeRequestDto } from './dto/create-working-time-request.dto';

@Injectable()
export class WorkingTimeRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkingTimeRequestDto, employeeId: string) {
    return this.prisma.workingTimeRequest.create({
      data: {
        template: dto.template,
        employeeId,
      },
      include: { employee: true },
    });
  }

  async findAll(employeeId?: string) {
    return this.prisma.workingTimeRequest.findMany({
      where: employeeId ? { employeeId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { employee: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.workingTimeRequest.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!item) throw new NotFoundException('Working time request not found');
    return item;
  }

  async approve(id: string) {
    const item = await this.findOne(id);
    if (item.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be approved');
    }
    return this.prisma.workingTimeRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { employee: true },
    });
  }

  async reject(id: string) {
    const item = await this.findOne(id);
    if (item.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be rejected');
    }
    return this.prisma.workingTimeRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: { employee: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.workingTimeRequest.delete({ where: { id } });
  }
}
