import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  MODULE_PERMISSION_KEY,
  ModulePermission,
} from '../decorators/module-permission.decorator';
import { MODULE_KEY_METADATA } from '../decorators/module-key.decorator';
import { PermissionsService } from '../permissions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_MESSAGES } from '../../common/constants/error-messages';

@Injectable()
export class ModulePermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<ModulePermission>(
      MODULE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
    }

    // Buscar moduleKey no decorator
    const decoratorModuleKey = this.reflector.getAllAndOverride<string>(
      MODULE_KEY_METADATA,
      [context.getHandler(), context.getClass()],
    );

    const { shelterId, moduleKey, moduleId } = await this.extractParams(
      request,
      decoratorModuleKey,
    );

    if (!shelterId) {
      throw new BadRequestException(ERROR_MESSAGES.VALIDATION.SHELTER_ID_REQUIRED);
    }

    // Verifica se é OWNER/ADMIN do abrigo - pode tudo
    const isAdmin = await this.permissionsService.isAdminInShelter(user.id, shelterId);
    if (isAdmin) {
      return true;
    }

    let hasPermission = false;

    switch (requiredPermission) {
      case ModulePermission.READ:
        hasPermission = await this.permissionsService.canReadModule(
          user.id,
          shelterId,
        );
        break;

      case ModulePermission.WRITE:
        if (!moduleKey) {
          throw new BadRequestException(ERROR_MESSAGES.VALIDATION.MODULE_KEY_REQUIRED);
        }
        hasPermission = await this.permissionsService.canWriteInModule(
          user.id,
          moduleKey,
          shelterId,
        );
        break;

      case ModulePermission.MANAGE:
        if (!moduleId) {
          throw new BadRequestException(ERROR_MESSAGES.VALIDATION.MODULE_ID_REQUIRED);
        }
        hasPermission = await this.permissionsService.canManageModule(
          user.id,
          moduleId,
          shelterId,
        );
        break;
    }

    if (!hasPermission) {
      const errorMap = {
        [ModulePermission.READ]: ERROR_MESSAGES.PERMISSION.MODULE_READ_DENIED,
        [ModulePermission.WRITE]: ERROR_MESSAGES.PERMISSION.MODULE_WRITE_DENIED,
        [ModulePermission.MANAGE]: ERROR_MESSAGES.PERMISSION.MODULE_MANAGE_DENIED,
      };
      throw new ForbiddenException(errorMap[requiredPermission]);
    }

    return true;
  }

  private async extractParams(
    request: any,
    decoratorModuleKey?: string,
  ): Promise<{
    shelterId?: string;
    moduleKey?: string;
    moduleId?: string;
  }> {
    // Para multipart/form-data, NÃO podemos parsear o stream aqui
    // porque o Multer precisa dele depois. O shelterId deve vir via query param.
    const isMultipart = request.headers['content-type']?.includes('multipart/form-data');
    
    // Extrai parâmetros de diferentes locais (params, query, body)
    // Para multipart, prioriza query params
    let shelterId =
      request.params?.shelterId ||
      request.params?.shelter ||
      request.query?.shelterId ||
      (!isMultipart && request.body?.shelterId);

    // Se não encontrou shelterId e há um ID no path, tenta buscar do registro
    if (!shelterId && request.params?.id) {
      const resourceId = request.params.id;
      
      // Determina qual tabela consultar baseado na URL/moduleKey
      const url = request.url.toLowerCase();
      
      try {
        if (url.includes('/animals/')) {
          const animal = await this.prisma.animal.findUnique({
            where: { id: resourceId },
            select: { shelterId: true },
          });
          shelterId = animal?.shelterId;
        } else if (url.includes('/resources/')) {
          const resource = await this.prisma.resource.findUnique({
            where: { id: resourceId },
            select: { shelterId: true },
          });
          shelterId = resource?.shelterId;
        } else if (url.includes('/sheltered-people/')) {
          const person = await this.prisma.shelteredPerson.findUnique({
            where: { id: resourceId },
            select: { shelterId: true },
          });
          shelterId = person?.shelterId;
        } else if (url.includes('/volunteers/')) {
          const volunteer = await this.prisma.volunteer.findUnique({
            where: { id: resourceId },
            select: { shelterId: true },
          });
          shelterId = volunteer?.shelterId;
        }
      } catch (error) {
        // Se der erro ao buscar, continua sem shelterId
        console.error('Error fetching shelterId from resource:', error);
      }
    }

    const moduleKey =
      decoratorModuleKey ||
      request.params?.moduleKey ||
      request.query?.moduleKey ||
      (!isMultipart && request.body?.moduleKey);

    const moduleId =
      request.params?.moduleId ||
      request.params?.id ||
      request.query?.moduleId ||
      (!isMultipart && request.body?.moduleId);

    return { shelterId, moduleKey, moduleId };
  }
}
