import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { DataScopeGuard } from '@/modules/identity/guards/data-scope.guard';

describe('Project endpoints data-scope guard', () => {
  function createContext(input: {
    query?: Record<string, string | string[] | undefined>;
    params?: Record<string, string | undefined>;
    user?: {
      role: Role;
      projectScopeIds?: string[];
      departmentScopeId?: string;
    };
  }): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => Object,
      switchToHttp: () => ({
        getRequest: () => ({
          query: input.query ?? {},
          params: input.params ?? {},
          user: input.user,
        }),
      }),
    } as unknown as ExecutionContext;
  }

  function createProjectScopeGuard() {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue('project'),
    } as unknown as Reflector;

    return new DataScopeGuard(reflector);
  }

  it('allows manager for in-scope project id from route param', () => {
    const guard = createProjectScopeGuard();

    const canActivate = guard.canActivate(
      createContext({
        params: { id: '00000000-0000-0000-0000-000000000020' },
        user: {
          role: Role.MANAGER,
          projectScopeIds: ['00000000-0000-0000-0000-000000000020'],
        },
      }),
    );

    expect(canActivate).toBe(true);
  });

  it('blocks manager for out-of-scope project id from route param', () => {
    const guard = createProjectScopeGuard();

    expect(() =>
      guard.canActivate(
        createContext({
          params: { id: '00000000-0000-0000-0000-000000000099' },
          user: {
            role: Role.MANAGER,
            projectScopeIds: ['00000000-0000-0000-0000-000000000020'],
          },
        }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('allows admin regardless of project scope', () => {
    const guard = createProjectScopeGuard();

    const canActivate = guard.canActivate(
      createContext({
        params: { id: '00000000-0000-0000-0000-000000000099' },
        user: {
          role: Role.ADMIN,
        },
      }),
    );

    expect(canActivate).toBe(true);
  });
});
