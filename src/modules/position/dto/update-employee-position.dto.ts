import { IsUUID } from 'class-validator';

export class UpdateEmployeePositionDto {
  @IsUUID()
  positionId!: string;
}
