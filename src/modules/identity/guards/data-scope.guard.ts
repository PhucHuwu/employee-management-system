import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { SCOPE_METADATA_KEY, ScopeType } from '../decorators/scope.decorator';
import { AuthenticatedRequest } from '../types/authenticated-request.type';

@Injectable()
export class DataScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScope = this.reflector.getAllAndOverride<ScopeType>(SCOPE_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredScope) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Missing authenticated user context');
    }

    if (user.role === Role.ADMIN) {
      return true;
    }

    if (user.role !== Role.MANAGER) {
      throw new ForbiddenException('Role is not allowed for scoped resource');
    }

    if (requiredScope === 'department') {
      const departmentId =
        this.extractFirstString(request.query.departmentId) ??
        this.extractFirstString(request.params.departmentId);
      if (!departmentId) {
        return true;
      }

      if (!user.departmentScopeId || user.departmentScopeId !== departmentId) {
        throw new ForbiddenException('Department scope violation');
      }

      return true;
    }

    const projectId =
      this.extractFirstString(request.query.projectId) ??
      this.extractFirstString(request.params.projectId) ??
      this.extractFirstString(request.params.id);
    if (!projectId) {
      return true;
    }

    if (!(user.projectScopeIds ?? []).includes(projectId)) {
      throw new ForbiddenException('Project scope violation');
    }

    return true;
  }

  private extractFirstString(input: unknown): string | undefined {
    if (typeof input === 'string') {
      return input;
    }

    if (Array.isArray(input)) {
      const [first] = input as unknown[];
      return typeof first === 'string' ? first : undefined;
    }

    return undefined;
  }
}
