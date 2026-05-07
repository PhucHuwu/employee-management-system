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
import { CreateTimesheetEntryDto } from './dto/create-timesheet-entry.dto';
import { UpdateTimesheetEntryDto } from './dto/update-timesheet-entry.dto';

@Controller('timesheet-entries')
export class TimesheetEntryController {
  constructor(private readonly timesheetEntryService: TimesheetEntryService) {}

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

  @Post(':id/approve')
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.timesheetEntryService.approve(id);
  }

  @Post(':id/reject')
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.timesheetEntryService.reject(id);
  }
}
