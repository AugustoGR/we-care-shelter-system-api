import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('resources')
@Controller('resources')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo recurso' })
  @ApiResponse({
    status: 201,
    description: 'Recurso criado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Abrigo não encontrado',
  })
  create(@Body() createResourceDto: CreateResourceDto) {
    return this.resourcesService.create(createResourceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os recursos' })
  @ApiQuery({
    name: 'shelterId',
    required: false,
    description: 'Filtrar recursos por ID do abrigo',
  })
  @ApiQuery({
    name: 'categoria',
    required: false,
    description: 'Filtrar recursos por categoria',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de recursos retornada com sucesso',
  })
  findAll(
    @Query('shelterId') shelterId?: string,
    @Query('categoria') categoria?: string,
  ) {
    return this.resourcesService.findAll(shelterId, categoria);
  }

  @Get('shelter/:shelterId')
  @ApiOperation({ summary: 'Listar recursos por ID do abrigo' })
  @ApiResponse({
    status: 200,
    description: 'Lista de recursos do abrigo retornada com sucesso',
  })
  findByShelterId(@Param('shelterId') shelterId: string) {
    return this.resourcesService.findByShelterId(shelterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um recurso por ID' })
  @ApiResponse({
    status: 200,
    description: 'Recurso retornado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Recurso não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um recurso' })
  @ApiResponse({
    status: 200,
    description: 'Recurso atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Recurso não encontrado',
  })
  update(@Param('id') id: string, @Body() updateResourceDto: UpdateResourceDto) {
    return this.resourcesService.update(id, updateResourceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um recurso' })
  @ApiResponse({
    status: 200,
    description: 'Recurso removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Recurso não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.resourcesService.remove(id);
  }
}
