import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../permissions.service';
import { ERROR_MESSAGES } from '../../common/constants/error-messages';

const SHELTER_ADMIN_ONLY_KEY = 'shelterAdminOnly';

@Injectable()
export class ShelterRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const shelterAdminOnly = this.reflector.getAllAndOverride<boolean>(
      SHELTER_ADMIN_ONLY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!shelterAdminOnly) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
    }

    // Extrai shelterId dos params
    const shelterId =
      request.params?.shelterId ||
      request.params?.shelter ||
      request.query?.shelterId ||
      request.body?.shelterId;

    if (!shelterId) {
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION.SHELTER_ID_REQUIRED);
    }

    const isAdmin = await this.permissionsService.isAdminInShelter(
      user.id,
      shelterId,
    );

    if (!isAdmin) {
      throw new ForbiddenException(ERROR_MESSAGES.PERMISSION.SHELTER_ADMIN_ONLY);
    }

    return true;
  }
}

// Decorator
export const ShelterAdminOnly = () =>
  Reflect.metadata(SHELTER_ADMIN_ONLY_KEY, true);
