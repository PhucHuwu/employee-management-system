import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

class TestableJwtAuthGuard extends JwtAuthGuard {
  delegated = false;

  protected activateWithPassport(context: ExecutionContext): boolean {
    void context;
    this.delegated = true;
    return true;
  }
}

describe('JwtAuthGuard', () => {
  const createContext = (): ExecutionContext =>
    ({
      getHandler: () => ({}),
      getClass: () => class {},
    }) as ExecutionContext;

  it('returns true for public route', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as unknown as Reflector;

    const guard = new JwtAuthGuard(reflector);
    const result = guard.canActivate(createContext());

    expect(result).toBe(true);
  });

  it('delegates to passport guard for private route', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;

    const guard = new TestableJwtAuthGuard(reflector);

    const result = guard.canActivate(createContext());

    expect(result).toBe(true);
    expect(guard.delegated).toBe(true);
  });
});
