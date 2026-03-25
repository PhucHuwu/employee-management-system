import { RevenueType } from '@prisma/client';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateRevenueDto {
  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth!: number;

  @IsInt()
  @Min(2000)
  @Max(2100)
  periodYear!: number;

  @IsEnum(RevenueType)
  revenueType!: RevenueType;

  @IsNumber({ maxDecimalPlaces: 2 })
  amount!: number;

  @IsString()
  @MaxLength(10)
  currency!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
