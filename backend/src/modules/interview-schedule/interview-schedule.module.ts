import { Module } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { InterviewScheduleController } from './interview-schedule.controller';
import { InterviewScheduleService } from './interview-schedule.service';

@Module({
  imports: [AuditModule],
  controllers: [InterviewScheduleController],
  providers: [InterviewScheduleService],
})
export class InterviewScheduleModule {}
