import { IsInt, IsUUID, IsOptional, IsNumber, IsString } from 'class-validator';

export class ReviewInternDetailInput {
  @IsUUID()
  capabilityId!: string;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateReviewInternDto {
  @IsInt()
  month!: number;

  @IsInt()
  year!: number;

  @IsUUID()
  internId!: string;

  @IsUUID()
  reviewerId!: string;

  @IsOptional()
  details?: ReviewInternDetailInput[];
}
