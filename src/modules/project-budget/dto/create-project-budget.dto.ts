import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { BudgetCategory } from '@prisma/client';

export class CreateProjectBudgetDto {
  @IsUUID()
  projectId!: string;

  @IsEnum(BudgetCategory)
  category!: BudgetCategory;

  @IsNumber()
  @Min(0)
  budgetedAmount!: number;

  @IsOptional()
  @IsString()
  note?: string;
}
