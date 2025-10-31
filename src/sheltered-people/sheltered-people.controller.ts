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
import { ShelteredPeopleService } from './sheltered-people.service';
import { CreateShelteredPersonDto } from './dto/create-sheltered-person.dto';
import { UpdateShelteredPersonDto } from './dto/update-sheltered-person.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('sheltered-people')
@Controller('sheltered-people')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShelteredPeopleController {
  constructor(
    private readonly shelteredPeopleService: ShelteredPeopleService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo abrigado' })
  @ApiResponse({
    status: 201,
    description: 'Abrigado cadastrado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Abrigo não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'CPF já cadastrado',
  })
  create(@Body() createShelteredPersonDto: CreateShelteredPersonDto) {
    return this.shelteredPeopleService.create(createShelteredPersonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os abrigados' })
  @ApiQuery({
    name: 'shelterId',
    required: false,
    description: 'Filtrar abrigados por ID do abrigo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de abrigados retornada com sucesso',
  })
  findAll(@Query('shelterId') shelterId?: string) {
    return this.shelteredPeopleService.findAll(shelterId);
  }

  @Get('shelter/:shelterId')
  @ApiOperation({ summary: 'Listar abrigados de um abrigo específico' })
  @ApiResponse({
    status: 200,
    description: 'Lista de abrigados do abrigo retornada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Abrigo não encontrado',
  })
  findByShelterId(@Param('shelterId') shelterId: string) {
    return this.shelteredPeopleService.findByShelterId(shelterId);
  }

  @Get('shelter/:shelterId/stats')
  @ApiOperation({ summary: 'Obter estatísticas dos abrigados de um abrigo' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Abrigo não encontrado',
  })
  getStatsByShelterId(@Param('shelterId') shelterId: string) {
    return this.shelteredPeopleService.getStatsByShelterId(shelterId);
  }

  @Get('cpf/:cpf')
  @ApiOperation({ summary: 'Buscar um abrigado por CPF' })
  @ApiResponse({
    status: 200,
    description: 'Abrigado encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Abrigado não encontrado',
  })
  findByCpf(@Param('cpf') cpf: string) {
    return this.shelteredPeopleService.findByCpf(cpf);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um abrigado por ID' })
  @ApiResponse({
    status: 200,
    description: 'Abrigado encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Abrigado não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.shelteredPeopleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um abrigado' })
  @ApiResponse({
    status: 200,
    description: 'Abrigado atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Abrigado não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'CPF já cadastrado',
  })
  update(
    @Param('id') id: string,
    @Body() updateShelteredPersonDto: UpdateShelteredPersonDto,
  ) {
    return this.shelteredPeopleService.update(id, updateShelteredPersonDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um abrigado' })
  @ApiResponse({
    status: 200,
    description: 'Abrigado removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Abrigado não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.shelteredPeopleService.remove(id);
  }
}
