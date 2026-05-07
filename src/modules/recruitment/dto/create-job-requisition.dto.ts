import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { JobRequisitionStatus, RequisitionType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateJobRequisitionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  department!: string;

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

  @IsEnum(RequisitionType)
  @IsOptional()
  type?: RequisitionType;

  @IsUUID()
  @IsOptional()
  positionId?: string;

  @IsUUID()
  @IsOptional()
  subPositionId?: string;

  @IsUUID()
  requestedBy!: string;
}
