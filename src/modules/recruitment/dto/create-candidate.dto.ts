import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { CandidateStatus } from '@prisma/client';

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @IsString()
  @IsOptional()
  resumeUrl?: string;

  @IsString()
  @IsOptional()
  cvUrl?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  source?: string;

  @IsEnum(CandidateStatus)
  @IsOptional()
  status?: CandidateStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  jobRequisitionId!: string;

  @IsUUID()
  @IsOptional()
  educationId?: string;

  @IsUUID()
  @IsOptional()
  branchId?: string;

  @IsUUID()
  @IsOptional()
  cvSourceId?: string;

  @IsUUID()
  @IsOptional()
  assignTo?: string;
}
