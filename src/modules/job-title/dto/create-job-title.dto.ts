import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateJobTitleDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsInt()
  @Min(1)
  levelOrder!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
