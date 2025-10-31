import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('animals')
@Controller('animals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo animal' })
  @ApiResponse({
    status: 201,
    description: 'Animal criado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Abrigo não encontrado',
  })
  create(@Body() createAnimalDto: CreateAnimalDto) {
    return this.animalsService.create(createAnimalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os animais' })
  @ApiQuery({
    name: 'shelterId',
    required: false,
    description: 'Filtrar animais por ID do abrigo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de animais retornada com sucesso',
  })
  findAll(@Query('shelterId') shelterId?: string) {
    return this.animalsService.findAll(shelterId);
  }

  @Get('shelter/:shelterId')
  @ApiOperation({ summary: 'Listar animais de um abrigo específico' })
  @ApiResponse({
    status: 200,
    description: 'Lista de animais do abrigo retornada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Abrigo não encontrado',
  })
  findByShelterId(@Param('shelterId') shelterId: string) {
    return this.animalsService.findByShelterId(shelterId);
  }

  @Get('shelter/:shelterId/stats')
  @ApiOperation({ summary: 'Obter estatísticas dos animais de um abrigo' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Abrigo não encontrado',
  })
  getStatsByShelterId(@Param('shelterId') shelterId: string) {
    return this.animalsService.getStatsByShelterId(shelterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um animal por ID' })
  @ApiResponse({
    status: 200,
    description: 'Animal encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Animal não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.animalsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um animal' })
  @ApiResponse({
    status: 200,
    description: 'Animal atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Animal não encontrado',
  })
  update(@Param('id') id: string, @Body() updateAnimalDto: UpdateAnimalDto) {
    return this.animalsService.update(id, updateAnimalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um animal' })
  @ApiResponse({
    status: 200,
    description: 'Animal removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Animal não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.animalsService.remove(id);
  }
}
