import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';

@Injectable()
export class VolunteersService {
  constructor(private prisma: PrismaService) {}

  async create(createVolunteerDto: CreateVolunteerDto) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: createVolunteerDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificar se o usuário já é voluntário
    const existingVolunteer = await this.prisma.volunteer.findUnique({
      where: { userId: createVolunteerDto.userId },
    });

    if (existingVolunteer) {
      throw new ConflictException('User is already registered as a volunteer');
    }

    // Verificar se o shelter existe
    const shelter = await this.prisma.shelter.findUnique({
      where: { id: createVolunteerDto.shelterId },
    });

    if (!shelter) {
      throw new NotFoundException('Shelter not found');
    }

    return this.prisma.volunteer.create({
      data: {
        userId: createVolunteerDto.userId,
        phone: createVolunteerDto.phone,
        skills: createVolunteerDto.skills || [],
        status: createVolunteerDto.status || 'Ativo',
        shelterId: createVolunteerDto.shelterId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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

    return this.prisma.volunteer.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shelter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!volunteer) {
      throw new NotFoundException(`Volunteer with ID ${id} not found`);
    }

    return volunteer;
  }

  async update(id: string, updateVolunteerDto: UpdateVolunteerDto) {
    // Verificar se o voluntário existe
    await this.findOne(id);

    // Se está atualizando o userId, verificar se o usuário existe e não está vinculado a outro voluntário
    if (updateVolunteerDto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: updateVolunteerDto.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingVolunteer = await this.prisma.volunteer.findUnique({
        where: { userId: updateVolunteerDto.userId },
      });

      if (existingVolunteer && existingVolunteer.id !== id) {
        throw new ConflictException('User is already registered as a volunteer');
      }
    }

    // Se está atualizando o shelterId, verificar se o shelter existe
    if (updateVolunteerDto.shelterId) {
      const shelter = await this.prisma.shelter.findUnique({
        where: { id: updateVolunteerDto.shelterId },
      });

      if (!shelter) {
        throw new NotFoundException('Shelter not found');
      }
    }

    return this.prisma.volunteer.update({
      where: { id },
      data: updateVolunteerDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    // Verificar se o voluntário existe
    await this.findOne(id);

    return this.prisma.volunteer.delete({
      where: { id },
    });
  }

  async updateLastActivity(id: string) {
    await this.findOne(id);

    return this.prisma.volunteer.update({
      where: { id },
      data: {
        lastActivity: new Date(),
      },
    });
  }
}
