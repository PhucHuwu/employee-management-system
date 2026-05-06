import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PayrollStatus } from '@prisma/client';
import { PaginationQueryDto } from '@/modules/project/dto/pagination-query.dto';

export class PayrollQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  year?: number;

  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;
}
