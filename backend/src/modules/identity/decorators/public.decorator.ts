import { SetMetadata } from '@nestjs/common';
import { AUTH_PUBLIC_ROUTE_KEY } from '../identity.constants';

export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(AUTH_PUBLIC_ROUTE_KEY, true);
