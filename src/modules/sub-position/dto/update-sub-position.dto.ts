import { IsHexColor, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class UpdateSubPositionDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsUUID()
  positionId?: string;
}
