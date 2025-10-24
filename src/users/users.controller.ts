import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}
