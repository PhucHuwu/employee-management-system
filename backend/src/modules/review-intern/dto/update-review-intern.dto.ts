import { IsOptional, IsNumber, IsString, IsArray } from 'class-validator';
import { ReviewInternDetailInput } from './create-review-intern.dto';

export class UpdateReviewInternDto {
  @IsOptional()
  @IsNumber()
  totalScore?: number;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsArray()
  details?: ReviewInternDetailInput[];
}
