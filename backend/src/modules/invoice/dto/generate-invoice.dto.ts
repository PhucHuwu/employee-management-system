import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class GenerateInvoiceDto {
  @IsUUID()
  projectId!: string;

  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @IsOptional()
  @IsUUID()
  customerId?: string;
}
