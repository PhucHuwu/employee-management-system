import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class PromoteEmployeeDto {
  @IsUUID()
  newJobTitleId!: string;

  @Type(() => Date)
  @IsDate()
  effectiveDate!: Date;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  strictPolicy?: boolean;
}
