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
} from '@nestjs/common';
import { TimesheetEntryService } from './timesheet-entry.service';
import { TimesheetLockService } from './timesheet-lock.service';
import { CreateTimesheetEntryDto } from './dto/create-timesheet-entry.dto';
import { UpdateTimesheetEntryDto } from './dto/update-timesheet-entry.dto';
import { ComplainTimesheetEntryDto } from './dto/complain-timesheet-entry.dto';
import { RejectTimesheetEntryDto } from './dto/reject-timesheet-entry.dto';
import { BulkApproveTimesheetEntryDto } from './dto/bulk-approve-timesheet-entry.dto';

@Controller('timesheet-entries')
export class TimesheetEntryController {
  constructor(
    private readonly timesheetEntryService: TimesheetEntryService,
    private readonly timesheetLockService: TimesheetLockService,
  ) {}

  @Post()
  create(@Body() dto: CreateTimesheetEntryDto) {
    // TODO: extract employeeId from auth context
    return this.timesheetEntryService.create(dto, '');
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.timesheetEntryService.findAll(employeeId, projectId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.timesheetEntryService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTimesheetEntryDto,
  ) {
    return this.timesheetEntryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.timesheetEntryService.remove(id);
  }

  @Post(':id/submit')
  submit(@Param('id', ParseUUIDPipe) id: string) {
    return this.timesheetEntryService.submit(id);
  }

  @Post(':id/complain')
  complain(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ComplainTimesheetEntryDto,
  ) {
    return this.timesheetEntryService.complain(id, dto);
  }

  @Post(':id/approve')
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.timesheetEntryService.approve(id);
  }

  @Post('bulk-approve')
  bulkApprove(@Body() dto: BulkApproveTimesheetEntryDto) {
    return this.timesheetEntryService.bulkApprove(dto.ids);
  }

  @Post(':id/reject')
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
