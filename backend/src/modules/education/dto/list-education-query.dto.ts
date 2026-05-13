import { IsOptional, IsUUID } from 'class-validator';

export class ListEducationQueryDto {
  @IsOptional()
  @IsUUID()
  educationTypeId?: string;
}
