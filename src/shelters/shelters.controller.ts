import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SheltersService } from './shelters.service';
import { CreateShelterDto } from './dto/create-shelter.dto';
import { UpdateShelterDto } from './dto/update-shelter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('shelters')
@Controller('shelters')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SheltersController {
  constructor(private readonly sheltersService: SheltersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo abrigo' })
  @ApiResponse({ status: 201, description: 'Abrigo criado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(@Body() createShelterDto: CreateShelterDto, @Request() req) {
    return this.sheltersService.create(createShelterDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os abrigos' })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({ name: 'calamity', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de abrigos' })
  findAll(
    @Query('active') active?: string,
    @Query('calamity') calamity?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
  ) {
    const filters: any = {};

    if (active !== undefined) {
      filters.active = active === 'true';
    }

    if (calamity) {
      filters.calamity = calamity;
    }

    if (city) {
      filters.city = city;
    }

    if (state) {
      filters.state = state;
    }

    return this.sheltersService.findAll(filters);
  }

  @Get('my-shelters')
  @ApiOperation({
    summary: 'Listar todos os abrigos do usuário (proprietário + voluntário)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de todos os abrigos do usuário (como proprietário ou voluntário)',
  })
  findMyShelters(@Request() req) {
    return this.sheltersService.findAllByUserId(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um abrigo por ID' })
  @ApiResponse({ status: 200, description: 'Detalhes do abrigo' })
  @ApiResponse({ status: 404, description: 'Abrigo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.sheltersService.findOne(id);
  }

  @Get(':id/user-role')
  @ApiOperation({ summary: 'Obter o role do usuário no abrigo' })
  @ApiResponse({ status: 200, description: 'Role do usuário no abrigo' })
  @ApiResponse({
    status: 404,
    description: 'Abrigo não encontrado ou usuário não tem acesso',
  })
  getUserRole(@Param('id') id: string, @Request() req) {
    return this.sheltersService.getUserRoleInShelter(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um abrigo' })
  @ApiResponse({ status: 200, description: 'Abrigo atualizado com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar' })
  @ApiResponse({ status: 404, description: 'Abrigo não encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateShelterDto: UpdateShelterDto,
    @Request() req,
  ) {
    return this.sheltersService.update(id, updateShelterDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um abrigo' })
  @ApiResponse({ status: 200, description: 'Abrigo deletado com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para deletar' })
  @ApiResponse({ status: 404, description: 'Abrigo não encontrado' })
  remove(@Param('id') id: string, @Request() req) {
    return this.sheltersService.remove(id, req.user.id);
  }
}
