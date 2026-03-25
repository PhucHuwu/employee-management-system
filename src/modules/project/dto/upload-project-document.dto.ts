import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class UploadProjectDocumentDto {
  @IsString()
  @MaxLength(255)
  fileName!: string;

  @IsString()
  @MaxLength(100)
  mimeType!: string;

  @IsInt()
  @Min(1)
  sizeBytes!: number;

  @IsString()
  contentBase64!: string;

  @IsOptional()
  @IsUUID()
  uploadedBy?: string;
}
