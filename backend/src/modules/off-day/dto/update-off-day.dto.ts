import { IsString, IsOptional, IsISO8601 } from 'class-validator';

export class UpdateOffDayDto {
  @IsOptional()
  @IsISO8601()
  offDate?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
