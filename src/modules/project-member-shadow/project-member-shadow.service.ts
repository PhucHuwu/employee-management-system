import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { CreateProjectMemberShadowDto } from './dto/create-project-member-shadow.dto';

@Injectable()
export class ProjectMemberShadowService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectMemberShadowDto) {
    return this.prisma.projectMemberShadow.create({
      data: {
        projectMemberId: dto.projectMemberId,
        targetEmployeeId: dto.targetEmployeeId,
      },
      include: { projectMember: { include: { employee: true, project: true } }, targetEmployee: true },
    });
  }

  async findAll(projectId?: string) {
    return this.prisma.projectMemberShadow.findMany({
      where: projectId
        ? { projectMember: { projectId } }
        : undefined,
      orderBy: { createdAt: 'desc' },
      include: { projectMember: { include: { employee: true, project: true } }, targetEmployee: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.projectMemberShadow.findUnique({
      where: { id },
      include: { projectMember: { include: { employee: true, project: true } }, targetEmployee: true },
    });
    if (!item) throw new NotFoundException('Project member shadow not found');
    return item;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.projectMemberShadow.delete({ where: { id } });
  }
}
