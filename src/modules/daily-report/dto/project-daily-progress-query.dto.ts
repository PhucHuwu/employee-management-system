import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class ProjectDailyProgressQueryDto {
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
