import { IsUUID } from 'class-validator';

export class BulkApproveTimesheetEntryDto {
  @IsUUID('4', { each: true })
  ids!: string[];
}
