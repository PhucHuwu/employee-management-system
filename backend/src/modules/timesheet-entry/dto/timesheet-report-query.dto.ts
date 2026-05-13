import { IsOptional, IsUUID, IsISO8601 } from 'class-validator';

export class TimesheetReportQueryDto {
  @IsISO8601()
  startDate!: string;

  @IsISO8601()
  endDate!: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;
}
