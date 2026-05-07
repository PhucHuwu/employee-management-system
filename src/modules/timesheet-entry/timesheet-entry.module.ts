import { Module } from '@nestjs/common';
import { TimesheetEntryController } from './timesheet-entry.controller';
import { TimesheetEntryService } from './timesheet-entry.service';

@Module({
  controllers: [TimesheetEntryController],
  providers: [TimesheetEntryService],
})
export class TimesheetEntryModule {}
