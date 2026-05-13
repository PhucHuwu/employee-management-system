import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { UpdateProjectTaskDto } from './dto/update-project-task.dto';

@Injectable()
export class ProjectTaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectTaskDto) {
    return this.prisma.projectTask.create({
      data: {
        name: dto.name.trim(),
        code: dto.code.trim(),
        description: dto.description?.trim() ?? null,
        projectId: dto.projectId,
      },
      include: { project: true },
    });
  }

  async findAll(projectId?: string) {
    return this.prisma.projectTask.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { project: true },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.projectTask.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!task) throw new NotFoundException('Project task not found');
    return task;
  }

  async update(id: string, dto: UpdateProjectTaskDto) {
    await this.findOne(id);
    return this.prisma.projectTask.update({
      where: { id },
      data: {
        name: dto.name === undefined ? undefined : dto.name.trim(),
        code: dto.code === undefined ? undefined : dto.code.trim(),
        description: dto.description === undefined ? undefined : dto.description?.trim() ?? null,
        projectId: dto.projectId,
      },
      include: { project: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.projectTask.delete({ where: { id } });
  }
}
