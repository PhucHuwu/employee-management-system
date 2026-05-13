import { Module } from '@nestjs/common';
import { TimesheetEntryController } from './timesheet-entry.controller';
import { TimesheetEntryService } from './timesheet-entry.service';
import { TimesheetLockService } from './timesheet-lock.service';
import { TimesheetReportController } from './timesheet-report.controller';
import { TimesheetReportService } from './timesheet-report.service';
import { SystemSettingModule } from '@/modules/system-setting/system-setting.module';

@Module({
  imports: [SystemSettingModule],
  controllers: [TimesheetEntryController, TimesheetReportController],
  providers: [TimesheetEntryService, TimesheetLockService, TimesheetReportService],
})
export class TimesheetEntryModule {}
