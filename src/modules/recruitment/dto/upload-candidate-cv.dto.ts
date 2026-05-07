import { IsNotEmpty, IsString } from 'class-validator';

export class UploadCandidateCvDto {
  @IsString()
  @IsNotEmpty()
  cvUrl!: string;
}
