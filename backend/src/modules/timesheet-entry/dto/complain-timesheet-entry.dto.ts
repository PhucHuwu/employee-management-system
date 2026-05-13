import { IsString } from 'class-validator';

export class ComplainTimesheetEntryDto {
  @IsString()
  complainNote!: string;
}
