import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';

@Injectable()
export class SystemSettingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSystemSettingDto) {
    return this.prisma.systemSetting.create({
      data: {
        key: dto.key.trim(),
        value: dto.value.trim(),
        category: dto.category.trim(),
      },
    });
  }

  async findAll(category?: string) {
    return this.prisma.systemSetting.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.systemSetting.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('System setting not found');
    return item;
  }

  async findByKey(key: string) {
    const item = await this.prisma.systemSetting.findUnique({ where: { key } });
    if (!item) throw new NotFoundException('System setting not found');
    return item;
  }

  async update(id: string, dto: UpdateSystemSettingDto) {
    await this.findOne(id);
    return this.prisma.systemSetting.update({
      where: { id },
      data: {
        value: dto.value === undefined ? undefined : dto.value.trim(),
        category: dto.category === undefined ? undefined : dto.category.trim(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.systemSetting.delete({ where: { id } });
  }
}
