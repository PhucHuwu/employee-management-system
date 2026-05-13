import { IsString, IsOptional, IsUUID, IsISO8601, IsNumber, Min, Max } from 'class-validator';

export class UpdateTimesheetEntryDto {
  @IsOptional()
  @IsISO8601()
  entryDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  normalWorkingTime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  overtime?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  taskId?: string;
}
