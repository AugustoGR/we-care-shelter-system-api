import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    // Remove password from response
    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async searchByEmail(emailQuery: string) {
    if (!emailQuery || emailQuery.length < 3) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: {
        email: {
          contains: emailQuery.toLowerCase(),
          mode: 'insensitive',
        },
      },
      take: 10, // Limitar a 10 resultados
      orderBy: {
        email: 'asc',
      },
    });

    return users.map(({ password, ...user }) => user);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map(({ password, ...user }) => user);
  }
}
