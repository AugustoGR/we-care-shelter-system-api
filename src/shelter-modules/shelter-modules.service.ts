import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateShelterModuleDto } from './dto/update-shelter-module.dto';

@Injectable()
export class ShelterModulesService {
  constructor(private prisma: PrismaService) {}

  async findAll(shelterId: string) {
    const shelter = await this.prisma.shelter.findUnique({
      where: { id: shelterId },
    });

    if (!shelter) {
      throw new NotFoundException('Abrigo não encontrado');
    }

    return this.prisma.shelterModule.findMany({
      where: { shelterId },
      include: {
        responsibleVolunteer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        associatedVolunteers: {
          include: {
            volunteer: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        moduleKey: 'asc',
      },
    });
  }

  async findOne(shelterId: string, id: string) {
    const module = await this.prisma.shelterModule.findFirst({
      where: {
        id,
        shelterId,
      },
      include: {
        responsibleVolunteer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        associatedVolunteers: {
          include: {
            volunteer: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException('Módulo não encontrado');
    }

    return module;
  }

  /**
   * Atualiza um módulo do abrigo
   * 
   * Quando um voluntário é definido como responsável por um módulo:
   * - O voluntário é automaticamente associado ao módulo de "voluntários"
   * - Isso garante que responsáveis possam adicionar novos voluntários ao abrigo
   * - O voluntário terá permissões para gerenciar o cadastro de voluntários
   */
  async update(shelterId: string, id: string, updateDto: UpdateShelterModuleDto) {
    const module = await this.findOne(shelterId, id);

    // Guardar o responsável anterior antes da atualização
    const previousResponsibleId = module.responsibleVolunteerId;


    let volunteer = null;
    let newResponsibleId = updateDto.responsibleVolunteerId;

    // Normalizar valores vazios para null
    if (newResponsibleId === '' || newResponsibleId === undefined) {
      newResponsibleId = null;
    }

    // Verificar se o voluntário responsável existe e pertence ao abrigo
    if (newResponsibleId) {
      volunteer = await this.prisma.volunteer.findFirst({
        where: {
          id: newResponsibleId,
          shelterId,
        },
        include: {
          user: true,
        },
      });

      if (!volunteer) {
        throw new NotFoundException(
          'Voluntário responsável não encontrado ou não pertence ao abrigo',
        );
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};
    if (updateDto.active !== undefined) {
      updateData.active = updateDto.active;
    }
    // Apenas atualizar responsibleVolunteerId se foi explicitamente fornecido
    if ('responsibleVolunteerId' in updateDto) {
      updateData.responsibleVolunteerId = newResponsibleId;
    }

    // Atualizar o módulo
    const updatedModule = await this.prisma.shelterModule.update({
      where: { id: module.id },
      data: updateData,
    });

    // Se foi adicionado um responsável, criar/atualizar o voluntário no módulo de voluntários
    if (newResponsibleId && volunteer) {
      await this.ensureVolunteerInVolunteersModule(shelterId, volunteer);
    }

    // Se o responsável foi removido e havia um responsável anterior, remover do módulo de voluntários
    if (newResponsibleId === null && previousResponsibleId) {
      await this.removeVolunteerFromVolunteersModule(shelterId, previousResponsibleId);
    }

    // Atualizar voluntários associados, se fornecidos
    if (updateDto.associatedVolunteerIds !== undefined) {
      // Remover todos os voluntários associados atuais
      await this.prisma.moduleVolunteer.deleteMany({
        where: { moduleId: module.id },
      });

      // Adicionar os novos voluntários associados
      if (updateDto.associatedVolunteerIds.length > 0) {
        await this.addAssociatedVolunteers(
          module.id,
          shelterId,
          updateDto.associatedVolunteerIds,
        );
      }
    }

    return this.findOne(shelterId, updatedModule.id);
  }

  async toggleActive(shelterId: string, id: string) {
    const module = await this.findOne(shelterId, id);

    return this.prisma.shelterModule.update({
      where: { id: module.id },
      data: {
        active: !module.active,
      },
      include: {
        responsibleVolunteer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        associatedVolunteers: {
          include: {
            volunteer: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  private async addAssociatedVolunteers(
    moduleId: string,
    shelterId: string,
    volunteerIds: string[],
  ) {
    // Verificar se todos os voluntários existem e pertencem ao abrigo
    const volunteers = await this.prisma.volunteer.findMany({
      where: {
        id: { in: volunteerIds },
        shelterId,
      },
    });

    if (volunteers.length !== volunteerIds.length) {
      throw new BadRequestException(
        'Um ou mais voluntários não foram encontrados ou não pertencem ao abrigo',
      );
    }

    // Criar as associações
    const data = volunteerIds.map((volunteerId) => ({
      moduleId,
      volunteerId,
    }));

    await this.prisma.moduleVolunteer.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Garante que o voluntário responsável por um módulo esteja associado
   * ao módulo de voluntários com permissões para adicionar novos voluntários
   */
  private async ensureVolunteerInVolunteersModule(shelterId: string, volunteer: any) {
    // Buscar o módulo de voluntários do abrigo
    const volunteersModule = await this.prisma.shelterModule.findFirst({
      where: {
        shelterId,
        moduleKey: 'volunteers',
      },
    });

    if (!volunteersModule) {
      // Se o módulo de voluntários não existir, criar
      const newVolunteersModule = await this.prisma.shelterModule.create({
        data: {
          shelterId,
          moduleKey: 'volunteers',
          active: true,
        },
      });

      // Associar o voluntário ao módulo recém-criado
      await this.prisma.moduleVolunteer.create({
        data: {
          moduleId: newVolunteersModule.id,
          volunteerId: volunteer.id,
        },
      });
    } else {
      // Verificar se o voluntário já está associado ao módulo de voluntários
      const existingAssociation = await this.prisma.moduleVolunteer.findFirst({
        where: {
          moduleId: volunteersModule.id,
          volunteerId: volunteer.id,
        },
      });

      // Se não estiver associado, criar a associação
      if (!existingAssociation) {
        await this.prisma.moduleVolunteer.create({
          data: {
            moduleId: volunteersModule.id,
            volunteerId: volunteer.id,
          },
        });
      }
    }
  }

  /**
   * Remove um voluntário do módulo de voluntários quando ele deixa de ser
   * responsável por qualquer módulo.
   * Verifica se o voluntário ainda é responsável por outros módulos antes de remover.
   */
  private async removeVolunteerFromVolunteersModule(shelterId: string, volunteerId: string) {
    // Verificar se o voluntário ainda é responsável por outros módulos
    const otherModulesAsResponsible = await this.prisma.shelterModule.findMany({
      where: {
        shelterId,
        responsibleVolunteerId: volunteerId,
      },
    });

    // Se o voluntário ainda é responsável por outros módulos, não remover do módulo de voluntários
    if (otherModulesAsResponsible.length > 0) {
      return;
    }

    // Buscar o módulo de voluntários
    const volunteersModule = await this.prisma.shelterModule.findFirst({
      where: {
        shelterId,
        moduleKey: 'volunteers',
      },
    });

    if (!volunteersModule) {
      return;
    }

    // Remover a associação do voluntário com o módulo de voluntários
    await this.prisma.moduleVolunteer.deleteMany({
      where: {
        moduleId: volunteersModule.id,
        volunteerId: volunteerId,
      },
    });
  }
}
