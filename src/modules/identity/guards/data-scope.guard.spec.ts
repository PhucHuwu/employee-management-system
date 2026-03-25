import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { DataScopeGuard } from './data-scope.guard';

type ScopeType = 'department' | 'project' | undefined;

describe('DataScopeGuard', () => {
  const createContext = (
    scope: ScopeType,
    query: Record<string, string | string[] | undefined>,
    user: {
      role: Role;
      departmentScopeId?: string | null;
      projectScopeIds?: string[];
    } | null,
  ): ExecutionContext =>
    ({
      getHandler: () => ({}),
      getClass: () => Object,
      switchToHttp: () => ({
        getRequest: () => ({ query, user: user ?? undefined }),
      }),
    }) as unknown as ExecutionContext;

  const createGuard = (scope: ScopeType): DataScopeGuard => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(scope),
    } as unknown as Reflector;
    return new DataScopeGuard(reflector);
  };

  it('allows when endpoint has no scope metadata', () => {
    const guard = createGuard(undefined);

    expect(
      guard.canActivate(
        createContext(undefined, {}, { role: Role.MANAGER, projectScopeIds: [] }),
      ),
    ).toBe(true);
  });

  it('allows admin regardless of query scope', () => {
    const guard = createGuard('department');

    expect(
      guard.canActivate(
        createContext('department', { departmentId: 'd-1' }, { role: Role.ADMIN }),
      ),
    ).toBe(true);
  });

  it('throws for manager with mismatched department scope', () => {
    const guard = createGuard('department');

    expect(() =>
      guard.canActivate(
        createContext(
          'department',
          { departmentId: 'd-2' },
          {
            role: Role.MANAGER,
            departmentScopeId: 'd-1',
            projectScopeIds: [],
          },
        ),
      ),
    ).toThrow(ForbiddenException);
  });

  it('allows manager with in-scope projectId', () => {
    const guard = createGuard('project');

    expect(
      guard.canActivate(
        createContext(
          'project',
          { projectId: 'p-1' },
          {
            role: Role.MANAGER,
            projectScopeIds: ['p-1', 'p-2'],
          },
        ),
      ),
    ).toBe(true);
  });

  it('throws when missing authenticated user', () => {
    const guard = createGuard('project');

    expect(() => guard.canActivate(createContext('project', { projectId: 'p-1' }, null))).toThrow(
      ForbiddenException,
    );
  });
});
