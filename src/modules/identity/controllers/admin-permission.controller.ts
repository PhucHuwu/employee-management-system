import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { Permissions } from '../decorators/permissions.decorator';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionService } from '../services/permission.service';

@Controller('admin/permissions')
export class AdminPermissionController {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Permissions({ resource: 'permission', action: 'read' })
  async listPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }, { role: 'asc' }],
    });
  }

  @Put(':id')
  @Permissions({ resource: 'permission', action: 'update' })
  async updatePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    const existing = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Permission not found');
    }

    const updated = await this.prisma.permission.update({
      where: { id },
      data: {
        ...(dto.allowed !== undefined && { allowed: dto.allowed }),
        ...(dto.ownership !== undefined && { ownership: dto.ownership }),
      },
    });

    await this.permissionService.clearCache();

    return updated;
  }
}
