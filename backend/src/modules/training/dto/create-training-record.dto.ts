import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateTrainingRecordDto {
  @IsUUID()
  employeeId!: string;

  @IsUUID()
  trainingPlanId!: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completionDate?: Date;

  @IsOptional()
  @IsString()
  certificateUrl?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  certificateExpiry?: Date;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
