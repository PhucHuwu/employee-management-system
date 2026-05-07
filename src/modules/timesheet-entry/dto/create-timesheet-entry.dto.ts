import { IsString, IsOptional, IsUUID, IsISO8601, IsNumber, Min, Max } from 'class-validator';

export class CreateTimesheetEntryDto {
  @IsISO8601()
  entryDate!: string;

  @IsNumber()
  @Min(0)
  @Max(24)
  normalWorkingTime!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  overtime?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsUUID()
  projectId!: string;

  @IsUUID()
  taskId!: string;
}
