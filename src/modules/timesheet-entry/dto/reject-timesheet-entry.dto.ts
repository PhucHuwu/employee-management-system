import { IsString } from 'class-validator';

export class RejectTimesheetEntryDto {
  @IsString()
  reason!: string;
}
