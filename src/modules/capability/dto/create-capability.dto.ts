import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CapabilityType } from '@prisma/client';

export class CreateCapabilityDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  from?: string;

  @IsOptional()
  @IsString()
  guideline?: string;

  @IsEnum(CapabilityType)
  type!: CapabilityType;
}
