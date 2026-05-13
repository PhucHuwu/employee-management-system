import { FixedSchedule } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName!: string;

  @Type(() => Date)
  @IsDate()
  dob!: Date;

  @IsString()
  @MinLength(3)
  address!: string;

  @IsUUID()
  departmentId!: string;

  @IsUUID()
  positionId!: string;

  @IsEnum(FixedSchedule)
  fixedSchedule!: FixedSchedule;

  @IsOptional()
  @IsUUID('4', { each: true })
  projectIds?: string[];
}
