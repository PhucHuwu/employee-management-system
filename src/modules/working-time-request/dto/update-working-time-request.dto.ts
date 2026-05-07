import { IsEnum, IsOptional } from 'class-validator';
import { WorkingTimeTemplate } from '@prisma/client';

export class UpdateWorkingTimeRequestDto {
  @IsOptional()
  @IsEnum(WorkingTimeTemplate)
  template?: WorkingTimeTemplate;
}
