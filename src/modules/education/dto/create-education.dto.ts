import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateEducationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;

  @IsUUID()
  educationTypeId!: string;
}
