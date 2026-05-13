import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateDailyReportDto {
  @IsOptional()
  @IsDateString()
  reportDate?: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  task?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  workContent?: string;
}
