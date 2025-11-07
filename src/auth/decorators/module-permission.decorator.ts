import { SetMetadata } from '@nestjs/common';

export enum ModulePermission {
  READ = 'read',
  WRITE = 'write',
  MANAGE = 'manage',
}

export const MODULE_PERMISSION_KEY = 'modulePermission';
export const CheckModulePermission = (permission: ModulePermission) =>
  SetMetadata(MODULE_PERMISSION_KEY, permission);
