import { Injectable, NotFoundException } from '@nestjs/common';
import * as moment from 'moment';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async create(createResourceDto: CreateResourceDto) {
    const { validade, ...rest } = createResourceDto;
    
    return this.prisma.resource.create({
      data: {
        ...rest,
        validade: validade ? moment.utc(validade, 'YYYY-MM-DD').toDate() : null,
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

  async findAll(shelterId?: string, categoria?: string) {
    const where: any = {};

    if (shelterId) {
      where.shelterId = shelterId;
    }

    if (categoria) {
      where.categoria = categoria;
    }

    return this.prisma.resource.findMany({
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
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        shelter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    return resource;
  }

  async update(id: string, updateResourceDto: UpdateResourceDto) {
    await this.findOne(id);

    const { validade, ...rest } = updateResourceDto;
    
    return this.prisma.resource.update({
      where: { id },
      data: {
        ...rest,
        ...(validade !== undefined && { 
          validade: validade ? moment.utc(validade, 'YYYY-MM-DD').toDate() : null 
        }),
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
    await this.findOne(id);
    
    return this.prisma.resource.delete({
      where: { id },
    });
  }

  async findByShelterId(shelterId: string) {
    return this.prisma.resource.findMany({
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
  }
}
