import { Injectable } from '@nestjs/common';
import { ShelterRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verifica se o usuário é owner ou admin do abrigo
   */
  async isAdminInShelter(userId: string, shelterId: string): Promise<boolean> {
    // Primeiro verifica se é o owner direto do abrigo
    const shelter = await this.prisma.shelter.findUnique({
      where: { id: shelterId },
      select: { ownerId: true },
    });

    if (shelter?.ownerId === userId) {
      return true;
    }

    // Depois verifica na tabela UserShelter
    const userShelter = await this.prisma.userShelter.findUnique({
      where: {
        userId_shelterId: {
          userId,
          shelterId,
        },
      },
    });

    return userShelter?.role === ShelterRole.OWNER || userShelter?.role === ShelterRole.ADMIN;
  }

  /**
   * Verifica se o usuário é owner do abrigo
   */
  async isOwnerOfShelter(userId: string, shelterId: string): Promise<boolean> {
    // Primeiro verifica se é o owner direto do abrigo
    const shelter = await this.prisma.shelter.findUnique({
      where: { id: shelterId },
      select: { ownerId: true },
    });

    if (shelter?.ownerId === userId) {
      return true;
    }

    // Depois verifica na tabela UserShelter
    const userShelter = await this.prisma.userShelter.findUnique({
      where: {
        userId_shelterId: {
          userId,
          shelterId,
        },
      },
    });

    return userShelter?.role === ShelterRole.OWNER;
  }

  /**
   * Obtém o role do usuário em um abrigo específico
   */
  async getUserRoleInShelter(userId: string, shelterId: string): Promise<ShelterRole | null> {
    const userShelter = await this.prisma.userShelter.findUnique({
      where: {
        userId_shelterId: {
          userId,
          shelterId,
        },
      },
    });

    return userShelter?.role || null;
  }

  /**
   * Verifica se o usuário pode editar/gerenciar um módulo específico
   * (adicionar/remover voluntários, editar configurações)
   * 
   * REGRAS:
   * ✅ OWNER/ADMIN do abrigo → pode gerenciar qualquer módulo
   * ✅ RESPONSÁVEL do módulo → pode gerenciar SEU módulo
   * ❌ VOLUNTÁRIO ASSOCIADO → NÃO pode gerenciar (apenas escrever dados)
   * ❌ VOLUNTÁRIO SEM ATRIBUIÇÃO → NÃO pode gerenciar
   * 
   * @param userId ID do usuário
   * @param moduleId ID do módulo específico
   * @param shelterId ID do abrigo
   * @returns true se pode gerenciar, false caso contrário
   */
  async canManageModule(
    userId: string,
    moduleId: string,
    shelterId: string,
  ): Promise<boolean> {
    if (!userId || !moduleId || !shelterId) {
      return false;
    }

    // Owner/Admin do abrigo pode tudo
    if (await this.isAdminInShelter(userId, shelterId)) {
      return true;
    }

    // Busca o voluntário do usuário
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { userId },
    });

    if (!volunteer || volunteer.shelterId !== shelterId) {
      return false;
    }

    // Verifica se é o responsável pelo módulo
    const module = await this.prisma.shelterModule.findUnique({
      where: { id: moduleId },
    });

    return module?.responsibleVolunteerId === volunteer.id;
  }

  /**
   * Verifica se o usuário pode escrever (criar/editar/deletar) em um módulo
   * 
   * REGRAS:
   * ✅ OWNER/ADMIN do abrigo → pode escrever em qualquer módulo
   * ✅ RESPONSÁVEL do módulo → pode escrever no seu módulo
   * ✅ VOLUNTÁRIO ASSOCIADO ao módulo → pode escrever no módulo
   * ❌ VOLUNTÁRIO SEM ATRIBUIÇÃO → NÃO pode escrever
   * 
   * @param userId ID do usuário
   * @param moduleKey Chave do módulo (ex: 'animals', 'resources', 'people')
   * @param shelterId ID do abrigo
   * @returns true se pode escrever, false caso contrário
   */
  async canWriteInModule(
    userId: string,
    moduleKey: string,
    shelterId: string,
  ): Promise<boolean> {
    if (!userId || !moduleKey || !shelterId) {
      return false;
    }

    // Owner/Admin do abrigo pode tudo
    if (await this.isAdminInShelter(userId, shelterId)) {
      return true;
    }

    // Busca o voluntário do usuário
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { userId },
      include: {
        associatedModules: {
          include: {
            shelterModule: true,
          },
        },
        responsibleForModules: true,
      },
    });

    if (!volunteer || volunteer.shelterId !== shelterId) {
      console.log('[PermissionsService] Volunteer not found or wrong shelter', {
        userId,
        volunteerId: volunteer?.id,
        volunteerShelterId: volunteer?.shelterId,
        requestedShelterId: shelterId,
      });
      return false;
    }

    // Verifica se é responsável por algum módulo com essa chave
    const isResponsible = volunteer.responsibleForModules.some(
      (module) => module.moduleKey === moduleKey && module.shelterId === shelterId,
    );

    if (isResponsible) {
      console.log('[PermissionsService] User is RESPONSIBLE for module', {
        userId,
        moduleKey,
      });
      return true;
    }

    // Verifica se está associado ao módulo
    const isAssociated = volunteer.associatedModules.some(
      (assoc) =>
        assoc.shelterModule.moduleKey === moduleKey &&
        assoc.shelterModule.shelterId === shelterId,
    );

    console.log('[PermissionsService] Checking if user is ASSOCIATED', {
      userId,
      moduleKey,
      isAssociated,
      associatedModules: volunteer.associatedModules.map(am => ({
        moduleKey: am.shelterModule.moduleKey,
        shelterId: am.shelterModule.shelterId,
      })),
    });

    return isAssociated;
  }

  /**
   * Verifica se o usuário pode ler dados de um módulo
   * 
   * REGRAS:
   * ✅ OWNER/ADMIN do abrigo → pode ler todos os módulos
   * ✅ QUALQUER VOLUNTÁRIO do abrigo → pode ler todos os módulos ativos
   *    (mesmo sem atribuição específica)
   * ❌ Não voluntário do abrigo → NÃO pode ler
   * 
   * @param userId ID do usuário
   * @param shelterId ID do abrigo
   * @returns true se pode ler, false caso contrário
   */
  async canReadModule(
    userId: string,
    shelterId: string,
  ): Promise<boolean> {
    if (!userId || !shelterId) {
      return false;
    }

    // Owner/Admin do abrigo pode tudo
    if (await this.isAdminInShelter(userId, shelterId)) {
      return true;
    }

    // Verifica se o usuário é voluntário deste abrigo
    // QUALQUER voluntário pode ler, mesmo sem módulos atribuídos
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { userId },
    });

    return volunteer?.shelterId === shelterId;
  }

  /**
   * Verifica se o usuário pode gerenciar (criar/editar/deletar) o abrigo
   * Apenas OWNER ou ADMIN do abrigo podem fazer isso
   */
  async canManageShelter(
    userId: string,
    shelterId: string,
  ): Promise<boolean> {
    if (!userId || !shelterId) {
      return false;
    }

    return await this.isAdminInShelter(userId, shelterId);
  }

  /**
   * Verifica se o usuário pode ativar/desativar módulos
   * Apenas OWNER ou ADMIN do abrigo podem fazer isso
   */
  async canManageModuleActivation(
    userId: string,
    shelterId: string,
  ): Promise<boolean> {
    return await this.isAdminInShelter(userId, shelterId);
  }
}
