import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShelterDto } from './dto/create-shelter.dto';
import { UpdateShelterDto } from './dto/update-shelter.dto';

@Injectable()
export class SheltersService {
  constructor(private prisma: PrismaService) {}

  async create(createShelterDto: CreateShelterDto, userId: string) {
    // Criar o abrigo
    const shelter = await this.prisma.shelter.create({
      data: {
        ...createShelterDto,
        ownerId: userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Criar registro na tabela UserShelter com role OWNER
    await this.prisma.userShelter.create({
      data: {
        userId,
        shelterId: shelter.id,
        role: 'OWNER',
      },
    });

    // Criar os módulos padrão
    const defaultModules = [
      { moduleKey: 'people', active: true },
      { moduleKey: 'resources', active: true },
      { moduleKey: 'volunteers', active: true },
      { moduleKey: 'animals', active: false },
      { moduleKey: 'reports', active: false },
    ];

    await this.prisma.shelterModule.createMany({
      data: defaultModules.map((mod) => ({
        shelterId: shelter.id,
        moduleKey: mod.moduleKey,
        active: mod.active,
      })),
    });

    return shelter;
  }

  async findAll(filters?: {
    active?: boolean;
    calamity?: string;
    city?: string;
    state?: string;
  }) {
    const where: any = {};

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    if (filters?.calamity) {
      where.calamity = filters.calamity;
    }

    if (filters?.city) {
      where.city = {
        contains: filters.city,
        mode: 'insensitive',
      };
    }

    if (filters?.state) {
      where.state = filters.state;
    }

    return this.prisma.shelter.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const shelter = await this.prisma.shelter.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!shelter) {
      throw new NotFoundException(`Abrigo com ID ${id} não encontrado`);
    }

    return shelter;
  }

  async findAllByUserId(userId: string) {
    // Busca abrigos onde o usuário é owner
    const ownedShelters = await this.prisma.shelter.findMany({
      where: { ownerId: userId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Busca abrigos onde o usuário é voluntário
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { userId },
      include: {
        shelter: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const volunteerShelters = volunteer ? [volunteer.shelter] : [];

    // Combina e remove duplicatas
    const allShelters = [...ownedShelters, ...volunteerShelters];
    const uniqueShelters = allShelters.filter(
      (shelter, index, self) =>
        index === self.findIndex((s) => s.id === shelter.id),
    );

    // Ordena por data de criação (mais recentes primeiro)
    return uniqueShelters.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async update(id: string, updateShelterDto: UpdateShelterDto, userId: string) {
    const shelter = await this.prisma.shelter.findUnique({
      where: { id },
    });

    if (!shelter) {
      throw new NotFoundException(`Abrigo com ID ${id} não encontrado`);
    }

    // Se está tentando alterar o owner, verifica se o usuário atual é o owner
    if (
      updateShelterDto.ownerId &&
      updateShelterDto.ownerId !== shelter.ownerId
    ) {
      if (shelter.ownerId !== userId) {
        throw new ForbiddenException(
          'Apenas o proprietário do abrigo pode transferir a propriedade',
        );
      }

      // Verifica se o novo owner existe
      const newOwner = await this.prisma.user.findUnique({
        where: { id: updateShelterDto.ownerId },
      });

      if (!newOwner) {
        throw new BadRequestException('Novo proprietário não encontrado');
      }
    }

    // Apenas o owner pode editar o abrigo
    if (shelter.ownerId !== userId) {
      throw new ForbiddenException(
        'Apenas o proprietário pode editar este abrigo',
      );
    }

    return this.prisma.shelter.update({
      where: { id },
      data: updateShelterDto,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const shelter = await this.prisma.shelter.findUnique({
      where: { id },
    });

    if (!shelter) {
      throw new NotFoundException(`Abrigo com ID ${id} não encontrado`);
    }

    // Apenas o owner pode deletar o abrigo
    if (shelter.ownerId !== userId) {
      throw new ForbiddenException(
        'Apenas o proprietário pode excluir este abrigo',
      );
    }

    return this.prisma.shelter.delete({
      where: { id },
    });
  }

  async getUserRoleInShelter(userId: string, shelterId: string) {
    const shelter = await this.prisma.shelter.findUnique({
      where: { id: shelterId },
    });

    if (!shelter) {
      throw new NotFoundException(`Abrigo com ID ${shelterId} não encontrado`);
    }

    // Verifica se é o owner do abrigo
    if (shelter.ownerId === userId) {
      return { role: 'OWNER', isAdmin: true };
    }

    // Verifica na tabela UserShelter
    const userShelter = await this.prisma.userShelter.findUnique({
      where: {
        userId_shelterId: {
          userId,
          shelterId,
        },
      },
    });

    if (userShelter) {
      return {
        role: userShelter.role,
        isAdmin: userShelter.role === 'OWNER' || userShelter.role === 'ADMIN',
      };
    }

    // Verifica se é voluntário do abrigo
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { userId },
    });

    if (volunteer && volunteer.shelterId === shelterId) {
      return { role: 'VOLUNTEER', isAdmin: false };
    }

    throw new NotFoundException('Usuário não tem acesso a este abrigo');
  }
}
