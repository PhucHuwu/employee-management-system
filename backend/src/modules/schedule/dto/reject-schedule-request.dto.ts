import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectScheduleRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  rejectionReason!: string;
}
