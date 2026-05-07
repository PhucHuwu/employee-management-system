import { Module } from '@nestjs/common';
import { WorkingTimeRequestController } from './working-time-request.controller';
import { WorkingTimeRequestService } from './working-time-request.service';

@Module({
  controllers: [WorkingTimeRequestController],
  providers: [WorkingTimeRequestService],
})
export class WorkingTimeRequestModule {}
