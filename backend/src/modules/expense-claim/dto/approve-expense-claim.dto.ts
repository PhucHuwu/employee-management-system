import { IsOptional, IsString } from 'class-validator';

export class ApproveExpenseClaimDto {
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
