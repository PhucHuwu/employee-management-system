import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class AddProjectMemberDto {
  @IsUUID()
  employeeId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  roleInProject?: string;

  @IsOptional()
  @IsDateString()
  joinedAt?: string;

  @IsOptional()
  @IsDateString()
  leftAt?: string;
}
