import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/utils/enums';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
