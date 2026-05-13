import { IsString } from 'class-validator';

export class CreateSystemSettingDto {
  @IsString()
  key!: string;

  @IsString()
  value!: string;

  @IsString()
  category!: string;
}
