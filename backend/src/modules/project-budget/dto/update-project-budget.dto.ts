import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { BudgetCategory } from '@prisma/client';

export class UpdateProjectBudgetDto {
  @IsOptional()
  @IsEnum(BudgetCategory)
  category?: BudgetCategory;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetedAmount?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
