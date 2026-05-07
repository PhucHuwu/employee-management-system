import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateCapabilitySettingItemDto {
  @IsString()
  @MinLength(1)
  capabilityId!: string;

  @IsNumber()
  coefficient!: number;

  @IsOptional()
  @IsString()
  guideline?: string;
}

export class CreateCapabilitySettingDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  userType!: string;

  @IsString()
  @MinLength(1)
  positionId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCapabilitySettingItemDto)
  items!: CreateCapabilitySettingItemDto[];
}
