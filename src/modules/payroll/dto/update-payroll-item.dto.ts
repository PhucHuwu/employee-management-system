import { IsDecimal, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePayrollItemDto {
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  bonus?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  deductions?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
