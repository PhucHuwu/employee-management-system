import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { InterviewResult } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateInterviewDto {
  @Type(() => Date)
  @IsOptional()
  scheduledAt?: Date;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  round?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  interviewer?: string;

  @IsEnum(InterviewResult)
  @IsOptional()
  result?: InterviewResult;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  score?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
