import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as moment from 'moment';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShelteredPersonDto } from './dto/create-sheltered-person.dto';
import { UpdateShelteredPersonDto } from './dto/update-sheltered-person.dto';

@Injectable()
export class ShelteredPeopleService {
  constructor(private prisma: PrismaService) {}

  async create(createShelteredPersonDto: CreateShelteredPersonDto) {
    // Verifica se o abrigo existe
    const shelter = await this.prisma.shelter.findUnique({
      where: { id: createShelteredPersonDto.shelterId },
    });

    if (!shelter) {
      throw new NotFoundException(
        `Abrigo com ID ${createShelteredPersonDto.shelterId} não encontrado`,
      );
    }

    // Verifica se o CPF já está cadastrado
    const existingPerson = await this.prisma.shelteredPerson.findUnique({
      where: { cpf: createShelteredPersonDto.cpf },
    });

    if (existingPerson) {
      throw new ConflictException(
        `CPF ${createShelteredPersonDto.cpf} já está cadastrado`,
      );
    }

    return this.prisma.shelteredPerson.create({
      data: {
        nome: createShelteredPersonDto.nome,
        cpf: createShelteredPersonDto.cpf,
        dataNascimento: moment.utc(createShelteredPersonDto.dataNascimento, 'YYYY-MM-DD').toDate(),
        genero: createShelteredPersonDto.genero,
        status: createShelteredPersonDto.status || 'Ativo',
        shelterId: createShelteredPersonDto.shelterId,
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

    return this.prisma.shelteredPerson.findMany({
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
    const person = await this.prisma.shelteredPerson.findUnique({
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

    if (!person) {
      throw new NotFoundException(`Abrigado com ID ${id} não encontrado`);
    }

    return person;
  }

  async findByShelterId(shelterId: string) {
    // Verifica se o abrigo existe
    const shelter = await this.prisma.shelter.findUnique({
      where: { id: shelterId },
    });

    if (!shelter) {
      throw new NotFoundException(`Abrigo com ID ${shelterId} não encontrado`);
    }

    return this.prisma.shelteredPerson.findMany({
      where: { shelterId },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findByCpf(cpf: string) {
    const person = await this.prisma.shelteredPerson.findUnique({
      where: { cpf },
      include: {
        shelter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!person) {
      throw new NotFoundException(`Abrigado com CPF ${cpf} não encontrado`);
    }

    return person;
  }

  async update(id: string, updateShelteredPersonDto: UpdateShelteredPersonDto) {
    // Verifica se o abrigado existe
    const person = await this.prisma.shelteredPerson.findUnique({
      where: { id },
    });

    if (!person) {
      throw new NotFoundException(`Abrigado com ID ${id} não encontrado`);
    }

    // Se estiver atualizando o CPF, verifica se já existe
    if (
      updateShelteredPersonDto.cpf &&
      updateShelteredPersonDto.cpf !== person.cpf
    ) {
      const existingPerson = await this.prisma.shelteredPerson.findUnique({
        where: { cpf: updateShelteredPersonDto.cpf },
      });

      if (existingPerson) {
        throw new ConflictException(
          `CPF ${updateShelteredPersonDto.cpf} já está cadastrado`,
        );
      }
    }

    // Se estiver atualizando o shelterId, verifica se o abrigo existe
    if (updateShelteredPersonDto.shelterId) {
      const shelter = await this.prisma.shelter.findUnique({
        where: { id: updateShelteredPersonDto.shelterId },
      });

      if (!shelter) {
        throw new NotFoundException(
          `Abrigo com ID ${updateShelteredPersonDto.shelterId} não encontrado`,
        );
      }
    }

    // Preparar dados para atualização
    const updateData: any = { ...updateShelteredPersonDto };

    // Converter dataNascimento se fornecida
    if (updateShelteredPersonDto.dataNascimento) {
      updateData.dataNascimento = moment.utc(
        updateShelteredPersonDto.dataNascimento,
        'YYYY-MM-DD',
      ).toDate();
    }

    return this.prisma.shelteredPerson.update({
      where: { id },
      data: updateData,
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
    // Verifica se o abrigado existe
    const person = await this.prisma.shelteredPerson.findUnique({
      where: { id },
    });

    if (!person) {
      throw new NotFoundException(`Abrigado com ID ${id} não encontrado`);
    }

    await this.prisma.shelteredPerson.delete({
      where: { id },
    });

    return { message: 'Abrigado removido com sucesso' };
  }

  async getStatsByShelterId(shelterId: string) {
    // Verifica se o abrigo existe
    const shelter = await this.prisma.shelter.findUnique({
      where: { id: shelterId },
    });

    if (!shelter) {
      throw new NotFoundException(`Abrigo com ID ${shelterId} não encontrado`);
    }

    const total = await this.prisma.shelteredPerson.count({
      where: { shelterId },
    });

    const byGenero = await this.prisma.shelteredPerson.groupBy({
      by: ['genero'],
      where: { shelterId },
      _count: true,
    });

    const byStatus = await this.prisma.shelteredPerson.groupBy({
      by: ['status'],
      where: { shelterId },
      _count: true,
    });

    // Calcular faixas etárias
    const allPeople = await this.prisma.shelteredPerson.findMany({
      where: { shelterId },
      select: { dataNascimento: true },
    });

    const ageRanges = {
      '0-18': 0,
      '19-30': 0,
      '31-50': 0,
      '51+': 0,
    };

    allPeople.forEach((person) => {
      const age = this.calculateAge(person.dataNascimento);
      if (age <= 18) ageRanges['0-18']++;
      else if (age <= 30) ageRanges['19-30']++;
      else if (age <= 50) ageRanges['31-50']++;
      else ageRanges['51+']++;
    });

    return {
      total,
      byGenero,
      byStatus,
      byAgeRange: Object.entries(ageRanges).map(([range, count]) => ({
        range,
        count,
      })),
    };
  }

  private calculateAge(birthDate: Date): number {
    const today = moment();
    const birth = moment.utc(birthDate);
    return today.diff(birth, 'years');
  }
}
