import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

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

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updateData: any = {};

    // Busca o usuário para validações
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (updateUserDto.name !== undefined) {
      updateData.name = updateUserDto.name;
    }

    if (updateUserDto.email !== undefined) {
      updateData.email = updateUserDto.email;
    }

    // Validação de senha
    if (updateUserDto.password !== undefined) {
      if (!updateUserDto.currentPassword) {
        throw new BadRequestException(
          'Senha atual é obrigatória para alterar a senha',
        );
      }

      // Verifica se a senha atual está correta
      const isPasswordValid = await bcrypt.compare(
        updateUserDto.currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Senha atual incorreta');
      }

      // Hash da nova senha
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password, ...result } = updatedUser;
    return result;
  }
}
