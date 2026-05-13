import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { TimesheetReportService } from './timesheet-report.service';
import { TimesheetReportQueryDto } from './dto/timesheet-report-query.dto';
import type { NormalWorkingReportItem, OvertimeReportItem, TardinessReportItem } from './timesheet-report.service';

@Controller('timesheet-reports')
export class TimesheetReportController {
  constructor(private readonly timesheetReportService: TimesheetReportService) {}

  @Get('normal-working')
  async getNormalWorkingReport(@Query() query: TimesheetReportQueryDto): Promise<NormalWorkingReportItem[]> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (startDate > endDate) {
      throw new BadRequestException('startDate must not be after endDate');
    }

    return this.timesheetReportService.getNormalWorkingReport(
      startDate,
      endDate,
      query.employeeId,
      query.projectId,
    );
  }

  @Get('overtime')
  async getOvertimeReport(@Query() query: TimesheetReportQueryDto): Promise<OvertimeReportItem[]> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (startDate > endDate) {
      throw new BadRequestException('startDate must not be after endDate');
    }

    return this.timesheetReportService.getOvertimeReport(
      startDate,
      endDate,
      query.employeeId,
      query.projectId,
    );
  }

  @Get('tardiness')
  async getTardinessReport(@Query() query: TimesheetReportQueryDto): Promise<TardinessReportItem[]> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (startDate > endDate) {
      throw new BadRequestException('startDate must not be after endDate');
    }

    return this.timesheetReportService.getTardinessReport(
      startDate,
      endDate,
      query.employeeId,
      query.projectId,
    );
  }
}
