import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ScheduleRequestStatus, ScheduleRequestType } from '@prisma/client';

export class ScheduleRequestQueryDto {
  @IsOptional()
  @IsEnum(ScheduleRequestStatus)
  status?: ScheduleRequestStatus;

  @IsOptional()
  @IsEnum(ScheduleRequestType)
  type?: ScheduleRequestType;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 1 : Number(value)))
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 20 : Number(value)))
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  size = 20;
}
