import { SetMetadata } from '@nestjs/common';

export type ScopeType = 'department' | 'project';

export const SCOPE_METADATA_KEY = 'scopeType';

export const Scope = (scopeType: ScopeType): MethodDecorator & ClassDecorator =>
  SetMetadata(SCOPE_METADATA_KEY, scopeType);
