import { Controller, Get, UseGuards, Request, Query, Patch, Param, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário retornado com sucesso.',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        name: 'Nome do Usuário',
        createdAt: '2025-10-23T00:00:00.000Z',
        updatedAt: '2025-10-23T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token inválido ou ausente.',
  })
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar usuários por email' })
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'Parte do email para buscar (mínimo 3 caracteres)',
    example: 'joao',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários encontrados.',
    schema: {
      example: [
        {
          id: 'uuid',
          email: 'joao@example.com',
          name: 'João Silva',
          createdAt: '2025-10-23T00:00:00.000Z',
          updatedAt: '2025-10-23T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email deve ter pelo menos 3 caracteres.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token inválido ou ausente.',
  })
  searchByEmail(@Query('email') email: string) {
    return this.usersService.searchByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso.',
    schema: {
      example: [
        {
          id: 'uuid',
          email: 'user1@example.com',
          name: 'Usuário 1',
          createdAt: '2025-10-23T00:00:00.000Z',
          updatedAt: '2025-10-23T00:00:00.000Z',
        },
        {
          id: 'uuid',
          email: 'user2@example.com',
          name: 'Usuário 2',
          createdAt: '2025-10-23T00:00:00.000Z',
          updatedAt: '2025-10-23T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token inválido ou ausente.',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar dados do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso.',
    schema: {
      example: {
        id: 'uuid',
        email: 'novo@example.com',
        name: 'Novo Nome',
        role: 'VOLUNTEER',
        createdAt: '2025-10-23T00:00:00.000Z',
        updatedAt: '2025-11-10T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token inválido ou ausente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
}
