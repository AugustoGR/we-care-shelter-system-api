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

  async update(shelterId: string, id: string, updateDto: UpdateShelterModuleDto) {
    const module = await this.findOne(shelterId, id);

    // Verificar se o voluntário responsável existe e pertence ao abrigo
    if (updateDto.responsibleVolunteerId) {
      const volunteer = await this.prisma.volunteer.findFirst({
        where: {
          id: updateDto.responsibleVolunteerId,
          shelterId,
        },
      });

      if (!volunteer) {
        throw new NotFoundException(
          'Voluntário responsável não encontrado ou não pertence ao abrigo',
        );
      }
    }

    // Atualizar o módulo
    const updatedModule = await this.prisma.shelterModule.update({
      where: { id: module.id },
      data: {
        active: updateDto.active,
        responsibleVolunteerId: updateDto.responsibleVolunteerId,
      },
    });

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
}
