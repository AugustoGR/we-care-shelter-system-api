import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

const sharp = require('sharp');

@Injectable()
export class AnimalsService {
  constructor(private prisma: PrismaService) {}

  async create(createAnimalDto: CreateAnimalDto, photoFile?: Express.Multer.File) {
    // Verifica se o abrigo existe
    const shelter = await this.prisma.shelter.findUnique({
      where: { id: createAnimalDto.shelterId },
    });

    if (!shelter) {
      throw new NotFoundException(
        `Abrigo com ID ${createAnimalDto.shelterId} não encontrado`,
      );
    }

    // Processar foto se foi enviada como arquivo
    let processedPhoto: string | undefined = undefined;
    if (photoFile) {
      try {
        
        // Processar a imagem com Sharp
        const processedBuffer = await sharp(photoFile.buffer)
          .jpeg({ quality: 60, progressive: true })
          .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toBuffer();
        
        // Converter para base64
        const base64 = processedBuffer.toString('base64');
        processedPhoto = `data:image/jpeg;base64,${base64}`;
        
      } catch (error) {
        console.error('❌ Erro ao processar imagem:', error);
        throw new BadRequestException(
          `Erro ao processar imagem: ${error.message}`,
        );
      }
    }

    const animal = await this.prisma.animal.create({
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
        photo: processedPhoto,
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


    return animal;
  }

  async findAll(shelterId?: string) {
    const where = shelterId ? { shelterId } : {};

    const animals = await this.prisma.animal.findMany({
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

    return animals;
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

    const animals = await this.prisma.animal.findMany({
      where: { shelterId },
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

    return animals;
  }

  async update(id: string, updateAnimalDto: UpdateAnimalDto, photoFile?: Express.Multer.File) {
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

    // Processar foto se foi enviada como arquivo
    let processedPhoto: string | undefined = undefined;
    if (photoFile) {
      try {
        
        const processedBuffer = await sharp(photoFile.buffer)
          .jpeg({ quality: 60, progressive: true })
          .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toBuffer();
        
        const base64 = processedBuffer.toString('base64');
        processedPhoto = `data:image/jpeg;base64,${base64}`;
        
      } catch (error) {
        throw new BadRequestException(
          `Erro ao processar imagem: ${error.message}`,
        );
      }
    }

    return this.prisma.animal.update({
      where: { id },
      data: {
        ...updateAnimalDto,
        ...(processedPhoto && { photo: processedPhoto }),
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

  async checkoutAnimals(animalIds: string[], shelterId: string) {
    // Verifica se todos os animais existem e pertencem ao abrigo especificado
    const animals = await this.prisma.animal.findMany({
      where: {
        id: {
          in: animalIds,
        },
        shelterId: shelterId, // Validação de segurança
      },
    });

    if (animals.length !== animalIds.length) {
      const foundIds = animals.map((a) => a.id);
      const notFoundIds = animalIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Os seguintes animais não foram encontrados ou não pertencem a este abrigo: ${notFoundIds.join(', ')}`,
      );
    }

    // Marca todos os animais como inativos
    const result = await this.prisma.animal.updateMany({
      where: {
        id: {
          in: animalIds,
        },
        shelterId: shelterId, // Validação adicional
      },
      data: {
        active: false,
        status: 'Inativo',
      },
    });

    return {
      message: `${result.count} animal(is) marcado(s) como inativo(s) com sucesso`,
      count: result.count,
      animalIds,
    };
  }
}
