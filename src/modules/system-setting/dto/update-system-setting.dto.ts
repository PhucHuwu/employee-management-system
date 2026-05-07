import { IsString, IsOptional } from 'class-validator';

export class UpdateSystemSettingDto {
  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
