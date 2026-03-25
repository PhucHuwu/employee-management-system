import { IsDateString, IsEnum } from 'class-validator';
import { ScheduleRequestType } from '@prisma/client';

export class DailyDrilldownQueryDto {
  @IsDateString()
  date!: string;

  @IsEnum(ScheduleRequestType)
  type!: ScheduleRequestType;
}
