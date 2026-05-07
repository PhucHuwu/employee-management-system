import { Module } from '@nestjs/common';
import { InterviewScheduleController } from './interview-schedule.controller';
import { InterviewScheduleService } from './interview-schedule.service';

@Module({
  controllers: [InterviewScheduleController],
  providers: [InterviewScheduleService],
})
export class InterviewScheduleModule {}
