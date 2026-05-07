import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class UpdateTeamBuildingRequestDto {
  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  totalMoney?: number;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @IsOptional()
  @IsArray()
  participantIds?: string[];
}
