import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { OnsiteRequestPeriod } from '@prisma/client';

export class UpdateOnsiteRequestDto {
  @IsOptional()
  @IsDateString()
  requestDate?: string;

  @IsOptional()
  @IsEnum(OnsiteRequestPeriod)
  period?: OnsiteRequestPeriod;

  @IsOptional()
  @IsNumber()
  hours?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
