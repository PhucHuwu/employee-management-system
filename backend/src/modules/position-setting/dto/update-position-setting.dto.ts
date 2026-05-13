import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdatePositionSettingDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  userType?: string;

  @IsOptional()
  @IsString()
  lmsConfig?: string;

  @IsOptional()
  @IsUUID()
  subPositionId?: string;
}
