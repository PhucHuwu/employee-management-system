import { Module } from '@nestjs/common';
import { OffDayController } from './off-day.controller';
import { OffDayService } from './off-day.service';

@Module({
  controllers: [OffDayController],
  providers: [OffDayService],
})
export class OffDayModule {}
