import { IsString, IsOptional, IsUUID, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { OnsiteRequestPeriod } from '@prisma/client';

export class CreateOnsiteRequestDto {
  @IsUUID()
  employeeId!: string;

  @IsDateString()
  requestDate!: string;

  @IsEnum(OnsiteRequestPeriod)
  period!: OnsiteRequestPeriod;

  @IsOptional()
  @IsNumber()
  hours?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
