import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateScoreSettingDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  userType!: string;

  @IsString()
  @MinLength(1)
  positionId!: string;

  @IsNumber()
  scoreFrom!: number;

  @IsNumber()
  scoreTo!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  level!: string;
}
