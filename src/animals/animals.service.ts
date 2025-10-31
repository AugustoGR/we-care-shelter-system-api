import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@Injectable()
export class AnimalsService {
  constructor(private prisma: PrismaService) {}

  async create(createAnimalDto: CreateAnimalDto) {
    // Verifica se o abrigo existe
    const shelter = await this.prisma.shelter.findUnique({
      where: { id: createAnimalDto.shelterId },
    });

    if (!shelter) {
      throw new NotFoundException(
        `Abrigo com ID ${createAnimalDto.shelterId} não encontrado`,
      );
    }

    return this.prisma.animal.create({
      data: {
        name: createAnimalDto.name,
        species: createAnimalDto.species,
        breed: createAnimalDto.breed,
        age: createAnimalDto.age,
        sex: createAnimalDto.sex,
        health: createAnimalDto.health,
        care: createAnimalDto.care,
        rabies: createAnimalDto.rabies ?? false,
        cinomose: createAnimalDto.cinomose ?? false,
        parvo: createAnimalDto.parvo ?? false,
        felina: createAnimalDto.felina ?? false,
        photo: createAnimalDto.photo,
        status: createAnimalDto.status ?? 'Em Cuidado',
        shelterId: createAnimalDto.shelterId,
      },
      include: {
        shelter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(shelterId?: string) {
    const where = shelterId ? { shelterId } : {};

    return this.prisma.animal.findMany({
      where,
      include: {
        shelter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const animal = await this.prisma.animal.findUnique({
      where: { id },
      include: {
        shelter: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
      },
    });

    if (!animal) {
      throw new NotFoundException(`Animal com ID ${id} não encontrado`);
    }

    return animal;
  }

  async findByShelterId(shelterId: string) {
    // Verifica se o abrigo existe
    const shelter = await this.prisma.shelter.findUnique({
      where: { id: shelterId },
    });

    if (!shelter) {
      throw new NotFoundException(`Abrigo com ID ${shelterId} não encontrado`);
    }

    return this.prisma.animal.findMany({
      where: { shelterId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateAnimalDto: UpdateAnimalDto) {
    // Verifica se o animal existe
    const animal = await this.prisma.animal.findUnique({
      where: { id },
    });

    if (!animal) {
      throw new NotFoundException(`Animal com ID ${id} não encontrado`);
    }

    // Se estiver atualizando o shelterId, verifica se o novo abrigo existe
    if (updateAnimalDto.shelterId) {
      const shelter = await this.prisma.shelter.findUnique({
        where: { id: updateAnimalDto.shelterId },
      });

      if (!shelter) {
        throw new NotFoundException(
          `Abrigo com ID ${updateAnimalDto.shelterId} não encontrado`,
        );
      }
    }

    return this.prisma.animal.update({
      where: { id },
      data: updateAnimalDto,
      include: {
        shelter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Verifica se o animal existe
    const animal = await this.prisma.animal.findUnique({
      where: { id },
    });

    if (!animal) {
      throw new NotFoundException(`Animal com ID ${id} não encontrado`);
    }

    await this.prisma.animal.delete({
      where: { id },
    });

    return { message: 'Animal removido com sucesso' };
  }

  async getStatsByShelterId(shelterId: string) {
    // Verifica se o abrigo existe
    const shelter = await this.prisma.shelter.findUnique({
      where: { id: shelterId },
    });

    if (!shelter) {
      throw new NotFoundException(`Abrigo com ID ${shelterId} não encontrado`);
    }

    const total = await this.prisma.animal.count({
      where: { shelterId },
    });

    const bySpecies = await this.prisma.animal.groupBy({
      by: ['species'],
      where: { shelterId },
      _count: true,
    });

    const byHealth = await this.prisma.animal.groupBy({
      by: ['health'],
      where: { shelterId },
      _count: true,
    });

    const byStatus = await this.prisma.animal.groupBy({
      by: ['status'],
      where: { shelterId },
      _count: true,
    });

    return {
      total,
      bySpecies,
      byHealth,
      byStatus,
    };
  }
}
