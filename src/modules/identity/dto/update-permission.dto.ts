import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsBoolean()
  allowed?: boolean;

  @IsOptional()
  @IsString()
  ownership?: string;
}
