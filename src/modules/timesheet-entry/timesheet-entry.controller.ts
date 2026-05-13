import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Put,
  Delete,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { TimesheetEntryService } from './timesheet-entry.service';
import { TimesheetLockService } from './timesheet-lock.service';
import { CreateTimesheetEntryDto } from './dto/create-timesheet-entry.dto';
import { UpdateTimesheetEntryDto } from './dto/update-timesheet-entry.dto';
import { ComplainTimesheetEntryDto } from './dto/complain-timesheet-entry.dto';
import { RejectTimesheetEntryDto } from './dto/reject-timesheet-entry.dto';
import { BulkApproveTimesheetEntryDto } from './dto/bulk-approve-timesheet-entry.dto';
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { Permissions } from '@/modules/identity/decorators/permissions.decorator';

@Controller('timesheet-entries')
export class TimesheetEntryController {
  constructor(
    private readonly timesheetEntryService: TimesheetEntryService,
    private readonly timesheetLockService: TimesheetLockService,
  ) {}

  @Post()
  @Permissions({ resource: 'timesheet-entry', action: 'create' })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTimesheetEntryDto,
  ) {
    if (!user.employeeId) {
      throw new ForbiddenException('Employee profile not linked');
    }
    return this.timesheetEntryService.create(dto, user.employeeId);
  }

  @Get()
  @Permissions({ resource: 'timesheet-entry', action: 'read' })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('employeeId') employeeId?: string,
    @Query('projectId') projectId?: string,
  ) {
    const effectiveEmployeeId =
      user.role === Role.EMPLOYEE && user.employeeId
        ? user.employeeId
        : employeeId;
    return this.timesheetEntryService.findAll(effectiveEmployeeId, projectId);
  }

  @Get(':id')
  @Permissions({ resource: 'timesheet-entry', action: 'read' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.timesheetEntryService.findOne(id);
  }

  @Put(':id')
  @Permissions({ resource: 'timesheet-entry', action: 'update' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTimesheetEntryDto,
  ) {
    return this.timesheetEntryService.update(id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'timesheet-entry', action: 'delete' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.timesheetEntryService.remove(id);
  }

  @Post(':id/submit')
  @Permissions({ resource: 'timesheet-entry', action: 'submit' })
  submit(@Param('id', ParseUUIDPipe) id: string) {
    return this.timesheetEntryService.submit(id);
  }

  @Post(':id/complain')
  @Permissions({ resource: 'timesheet-entry', action: 'update' })
  complain(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ComplainTimesheetEntryDto,
  ) {
    return this.timesheetEntryService.complain(id, dto);
  }

  @Post(':id/approve')
  @Permissions({ resource: 'timesheet-entry', action: 'approve' })
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.timesheetEntryService.approve(id);
  }

  @Post('bulk-approve')
  @Permissions({ resource: 'timesheet-entry', action: 'approve' })
  bulkApprove(@Body() dto: BulkApproveTimesheetEntryDto) {
    return this.timesheetEntryService.bulkApprove(dto.ids);
  }

  @Post(':id/reject')
  @Permissions({ resource: 'timesheet-entry', action: 'reject' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectTimesheetEntryDto,
  ) {
    return this.timesheetEntryService.reject(id, dto);
  }

  @Post('auto-lock')
  autoLock() {
    return this.timesheetLockService.autoLock();
  }

  @Get('monitoring')
  @Permissions({ resource: 'timesheet-entry', action: 'read' })
  getMonitoring(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('projectId') projectId?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.timesheetEntryService.getMonitoring(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      projectId,
      employeeId,
    );
  }
}
