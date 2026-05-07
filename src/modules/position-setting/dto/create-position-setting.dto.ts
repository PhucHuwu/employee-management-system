import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePositionSettingDto {
  @IsString()
  @MaxLength(50)
  userType!: string;

  @IsOptional()
  @IsString()
  lmsConfig?: string;

  @IsUUID()
  subPositionId!: string;
}
