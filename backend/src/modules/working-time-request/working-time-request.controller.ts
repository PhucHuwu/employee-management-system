import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Delete,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { WorkingTimeRequestService } from './working-time-request.service';
import { CreateWorkingTimeRequestDto } from './dto/create-working-time-request.dto';
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { Permissions } from '@/modules/identity/decorators/permissions.decorator';

@Controller('working-time-requests')
export class WorkingTimeRequestController {
  constructor(private readonly workingTimeRequestService: WorkingTimeRequestService) {}

  @Post()
  @Permissions({ resource: 'working-time-request', action: 'create' })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateWorkingTimeRequestDto,
  ) {
    if (!user.employeeId) {
      throw new ForbiddenException('Employee profile not linked');
    }
    return this.workingTimeRequestService.create(dto, user.employeeId);
  }

  @Get()
  @Permissions({ resource: 'working-time-request', action: 'read' })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('employeeId') employeeId?: string,
  ) {
    const effectiveEmployeeId =
      user.role === Role.EMPLOYEE && user.employeeId
        ? user.employeeId
        : employeeId;
    return this.workingTimeRequestService.findAll(effectiveEmployeeId);
  }

  @Get(':id')
  @Permissions({ resource: 'working-time-request', action: 'read' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workingTimeRequestService.findOne(id);
  }

  @Post(':id/approve')
  @Permissions({ resource: 'working-time-request', action: 'approve' })
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.workingTimeRequestService.approve(id);
  }

  @Post(':id/reject')
  @Permissions({ resource: 'working-time-request', action: 'reject' })
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.workingTimeRequestService.reject(id);
  }

  @Delete(':id')
  @Permissions({ resource: 'working-time-request', action: 'delete' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workingTimeRequestService.remove(id);
  }
}
