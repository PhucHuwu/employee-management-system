import { IsHexColor, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateSubPositionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @IsHexColor()
  color?: string;

  @IsUUID()
  positionId!: string;
}
