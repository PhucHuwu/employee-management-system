import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateLeaveBalanceDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  annualLeave?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sickLeave?: number;
}
