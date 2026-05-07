import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateProjectTaskDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  projectId!: string;
}
