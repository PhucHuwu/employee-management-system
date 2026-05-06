import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { LeaveModule } from '@/modules/leave/leave.module';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [AuditModule, LeaveModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
