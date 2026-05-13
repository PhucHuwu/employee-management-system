import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}
