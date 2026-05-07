import { IsString, IsOptional, IsUUID, IsNumber, IsArray } from 'class-validator';

export class CreateTeamBuildingRequestDto {
  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  totalMoney?: number;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @IsUUID()
  projectId!: string;

  @IsOptional()
  @IsArray()
  participantIds?: string[];
}
