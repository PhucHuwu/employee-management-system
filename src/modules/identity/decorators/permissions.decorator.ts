import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_METADATA_KEY = 'permissions';

export interface PermissionMetadata {
  resource: string;
  action: string;
}

export const Permissions = (metadata: PermissionMetadata): MethodDecorator & ClassDecorator =>
  SetMetadata(PERMISSIONS_METADATA_KEY, metadata);
