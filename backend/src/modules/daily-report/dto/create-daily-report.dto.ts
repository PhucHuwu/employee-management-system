import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDailyReportDto {
  @IsDateString()
  reportDate!: string;

  @IsUUID()
  employeeId!: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsNotEmpty()
  @IsString()
  task!: string;

  @IsNotEmpty()
  @IsString()
  workContent!: string;
}
