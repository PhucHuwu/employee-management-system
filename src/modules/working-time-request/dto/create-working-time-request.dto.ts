import { IsEnum } from 'class-validator';
import { WorkingTimeTemplate } from '@prisma/client';

export class CreateWorkingTimeRequestDto {
  @IsEnum(WorkingTimeTemplate)
  template!: WorkingTimeTemplate;
}
