import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { CreateOffDayDto } from './dto/create-off-day.dto';
import { UpdateOffDayDto } from './dto/update-off-day.dto';

@Injectable()
export class OffDayService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOffDayDto) {
    return this.prisma.offDay.create({
      data: {
        offDate: new Date(dto.offDate),
        name: dto.name.trim(),
        note: dto.note?.trim() ?? null,
      },
    });
  }

  async findAll() {
    return this.prisma.offDay.findMany({ orderBy: { offDate: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.offDay.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Off day not found');
    return item;
  }

  async update(id: string, dto: UpdateOffDayDto) {
    await this.findOne(id);
    return this.prisma.offDay.update({
      where: { id },
      data: {
        offDate: dto.offDate ? new Date(dto.offDate) : undefined,
        name: dto.name === undefined ? undefined : dto.name.trim(),
        note: dto.note === undefined ? undefined : dto.note?.trim() ?? null,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.offDay.delete({ where: { id } });
  }
}
