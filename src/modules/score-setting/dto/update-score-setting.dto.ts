import { IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateScoreSettingDto {
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
  @IsNumber()
  scoreFrom?: number;

  @IsOptional()
  @IsNumber()
  scoreTo?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  level?: string;
}
