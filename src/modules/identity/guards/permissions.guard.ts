import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PERMISSIONS_METADATA_KEY, PermissionMetadata } from '@/modules/identity/decorators/permissions.decorator';
import { PermissionService } from '@/modules/identity/services/permission.service';
import { AuthenticatedRequest } from '../types/authenticated-request.type';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const metadata = this.reflector.getAllAndOverride<PermissionMetadata>(PERMISSIONS_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!metadata) {
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

    const permission = this.permissionService.findPermission(
      metadata.resource,
      metadata.action,
      user.role,
    );

    if (!permission || !permission.allowed) {
      throw new ForbiddenException('Permission denied');
    }

    if (permission.ownership === 'any') {
      return true;
    }

    if (permission.ownership === 'own') {
      if (!user.employeeId) {
        throw new ForbiddenException('Employee identity required');
      }

      const bodyEmployeeId = this.extractBodyEmployeeId(request);
      if (bodyEmployeeId && bodyEmployeeId !== user.employeeId) {
        throw new ForbiddenException('Cannot act on another employee record');
      }

      return true;
    }

    if (permission.ownership === 'scope') {
      return this.assertScopeAccess(request, user);
    }

    return true;
  }

  private extractBodyEmployeeId(request: AuthenticatedRequest): string | undefined {
    const body = request.body as Record<string, unknown> | undefined;
    if (!body) {
      return undefined;
    }

    const employeeId = body.employeeId;
    if (typeof employeeId === 'string') {
      return employeeId;
    }

    return undefined;
  }

  private assertScopeAccess(request: AuthenticatedRequest, user: AuthenticatedRequest['user']): boolean {
    if (!user) {
      throw new ForbiddenException('Missing authenticated user context');
    }

    if (user.role === Role.ADMIN) {
      return true;
    }

    if (user.role !== Role.MANAGER) {
      throw new ForbiddenException('Role is not allowed for scoped resource');
    }

    const departmentId =
      this.extractFirstString(request.query.departmentId) ??
      this.extractFirstString(request.params.departmentId);

    if (departmentId) {
      if (!user.departmentScopeId || user.departmentScopeId !== departmentId) {
        throw new ForbiddenException('Department scope violation');
      }
      return true;
    }

    const projectId =
      this.extractFirstString(request.query.projectId) ??
      this.extractFirstString(request.params.projectId) ??
      this.extractFirstString(request.params.id);

    if (projectId) {
      if (!(user.projectScopeIds ?? []).includes(projectId)) {
        throw new ForbiddenException('Project scope violation');
      }
      return true;
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
