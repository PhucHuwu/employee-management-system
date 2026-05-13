import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CandidateStatus } from '@prisma/client';

export class ChangeCandidateStatusDto {
  @IsEnum(CandidateStatus)
  status!: CandidateStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}
