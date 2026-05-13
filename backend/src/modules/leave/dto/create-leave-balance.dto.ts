import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateLeaveBalanceDto {
  @IsUUID()
  employeeId!: string;

  @IsInt()
  year!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  annualLeave?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sickLeave?: number;
}
