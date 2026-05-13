import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { InterviewResult } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateInterviewDto {
  @Type(() => Date)
  scheduledAt!: Date;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  round?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  interviewer!: string;

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

  @IsUUID()
  candidateId!: string;
}
