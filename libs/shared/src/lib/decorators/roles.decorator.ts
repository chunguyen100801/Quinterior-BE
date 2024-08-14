import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/db-api';

export const ROLES = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES, roles);
