import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateCapabilitySettingItemDto {
  @IsString()
  @MinLength(1)
  capabilityId!: string;

  @IsNumber()
  coefficient!: number;

  @IsOptional()
  @IsString()
  guideline?: string;
}

export class UpdateCapabilitySettingDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  userType?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  positionId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateCapabilitySettingItemDto)
  items?: UpdateCapabilitySettingItemDto[];
}
