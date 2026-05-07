import { IsHexColor, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCvSourceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  referenceTo?: string;
}
