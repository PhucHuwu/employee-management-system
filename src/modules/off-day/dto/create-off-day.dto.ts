import { IsString, IsOptional, IsISO8601 } from 'class-validator';

export class CreateOffDayDto {
  @IsISO8601()
  offDate!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
