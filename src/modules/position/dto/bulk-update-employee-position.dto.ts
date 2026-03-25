import { IsArray, IsUUID } from 'class-validator';

export class BulkUpdateEmployeePositionDto {
  @IsUUID()
  positionId!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  employeeIds!: string[];
}
