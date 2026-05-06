import {
  IsDecimal,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { JobRequisitionStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateJobRequisitionDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  department?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  @Type(() => String)
  salaryMin?: string;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  @Type(() => String)
  salaryMax?: string;

  @IsEnum(JobRequisitionStatus)
  @IsOptional()
  status?: JobRequisitionStatus;
}
