import { IsUUID } from 'class-validator';

export class CreateProjectMemberShadowDto {
  @IsUUID()
  projectMemberId!: string;

  @IsUUID()
  targetEmployeeId!: string;
}
