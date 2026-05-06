import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { Permissions } from '../decorators/permissions.decorator';
import { UpdateManagerScopeDto } from '../dto/update-manager-scope.dto';

@Controller('admin/manager-scopes')
export class AdminManagerScopeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Permissions({ resource: 'manager-scope', action: 'read' })
  async listManagers() {
    return this.prisma.userAccount.findMany({
      where: { role: Role.MANAGER },
      select: {
        id: true,
        email: true,
        role: true,
        departmentScopeId: true,
        projectScopeIds: true,
        scopeEmployeeIds: true,
      },
      orderBy: { email: 'asc' },
    });
  }

  @Put(':userId')
  @Permissions({ resource: 'manager-scope', action: 'update' })
  async updateManagerScope(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateManagerScopeDto,
  ) {
    const existing = await this.prisma.userAccount.findUnique({
      where: { id: userId },
    });

    if (!existing || existing.role !== Role.MANAGER) {
      throw new NotFoundException('Manager not found');
    }

    return this.prisma.userAccount.update({
      where: { id: userId },
      data: {
        departmentScopeId: dto.departmentScopeId ?? null,
        projectScopeIds: dto.projectScopeIds ?? [],
        scopeEmployeeIds: dto.scopeEmployeeIds ?? [],
      },
    });
  }
}
