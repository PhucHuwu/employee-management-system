import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateManagerScopeDto {
  @IsOptional()
  @IsUUID()
  departmentScopeId?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  projectScopeIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopeEmployeeIds?: string[];
}
