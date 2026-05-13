import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class RevenueQueryDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : new Date().getFullYear()))
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}

export class ResourceUtilizationQueryDto {
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  from?: Date;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  to?: Date;
}
