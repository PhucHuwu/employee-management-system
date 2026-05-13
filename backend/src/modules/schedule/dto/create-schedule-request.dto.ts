import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { FixedSchedule, ScheduleRequestType } from '@prisma/client';

export class CreateScheduleRequestDto {
  @IsEnum(ScheduleRequestType)
  requestType!: ScheduleRequestType;

  @IsDateString()
  requestDate!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;

  @ValidateIf((o) => o.requestType === ScheduleRequestType.CHANGE_FIXED_SCHEDULE)
  @IsEnum(FixedSchedule)
  requestedSchedule?: FixedSchedule;
}
