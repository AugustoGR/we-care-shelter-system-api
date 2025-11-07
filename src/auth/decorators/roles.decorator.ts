import { SetMetadata } from '@nestjs/common';
import { ShelterRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ShelterRole[]) => SetMetadata(ROLES_KEY, roles);
