import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  email?: string;
  role: Role;
  departmentScopeId?: string | null;
  projectScopeIds?: string[];
  scopeEmployeeIds?: string[];
}
