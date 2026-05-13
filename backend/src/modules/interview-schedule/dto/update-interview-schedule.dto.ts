import { IsString, IsOptional, IsISO8601, IsArray } from 'class-validator';

export class UpdateInterviewScheduleDto {
  @IsOptional()
  @IsString()
  candidateId?: string;

  @IsOptional()
  @IsISO8601()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsArray()
  interviewerIds?: string[];
}
