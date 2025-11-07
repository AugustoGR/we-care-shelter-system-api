import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ShelterRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ERROR_MESSAGES } from '../../common/constants/error-messages';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ShelterRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(ERROR_MESSAGES.PERMISSION.INSUFFICIENT_ROLE);
    }

    return true;
  }
}
