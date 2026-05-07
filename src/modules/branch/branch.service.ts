import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AuditService } from '@/modules/audit/audit.service';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createBranch(dto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: {
        name: dto.name.trim(),
        displayName: dto.displayName.trim(),
        color: dto.color?.trim(),
        address: dto.address?.trim(),
      },
    });
  }

  async listBranches() {
    return this.prisma.branch.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async updateBranch(user: AuthUser, id: string, dto: UpdateBranchDto) {
    const existing = await this.prisma.branch.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Branch not found');
    }

    const updated = await this.prisma.branch.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        displayName: dto.displayName?.trim(),
        color: dto.color?.trim(),
        address: dto.address?.trim(),
      },
    });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'BRANCH_UPDATED',
      entityType: 'BRANCH',
      entityId: id,
      oldData: existing,
      newData: updated,
    });

    return updated;
  }

  async deleteBranch(user: AuthUser, id: string) {
    const existing = await this.prisma.branch.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Branch not found');
    }

    const inUseCount = await this.prisma.employee.count({
      where: {
        branchId: id,
        deletedAt: null,
      },
    });

    if (inUseCount > 0) {
      throw new BadRequestException('Cannot delete branch that has employees');
    }

    const deleted = await this.prisma.branch.delete({ where: { id } });

    await this.auditService.log({
      actor: this.toAuditActor(user),
      action: 'BRANCH_DELETED',
      entityType: 'BRANCH',
      entityId: id,
      oldData: deleted,
    });

    return { deleted: true };
  }

  private toAuditActor(user: AuthUser): { id: string; role: Role } {
    return {
      id: user.id,
      role: user.role,
    };
  }
}
