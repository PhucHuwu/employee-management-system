import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';

@Injectable()
export class LeaveTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeaveTypeDto) {
    return this.prisma.leaveType.create({
      data: {
        name: dto.name.trim(),
        color: dto.color?.trim() ?? null,
        isPaid: dto.isPaid ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.leaveType.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.leaveType.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Leave type not found');
    return item;
  }

  async update(id: string, dto: UpdateLeaveTypeDto) {
    await this.findOne(id);
    return this.prisma.leaveType.update({
      where: { id },
      data: {
        name: dto.name === undefined ? undefined : dto.name.trim(),
        color: dto.color === undefined ? undefined : dto.color?.trim() ?? null,
        isPaid: dto.isPaid,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.leaveType.delete({ where: { id } });
  }
}
