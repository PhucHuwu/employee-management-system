import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ROLE_METADATA_KEY } from '@/common/constants/auth.constant';

export const Roles = (...roles: Role[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLE_METADATA_KEY, roles);
