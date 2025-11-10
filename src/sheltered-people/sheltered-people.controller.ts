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
import { CheckoutShelteredPeopleDto } from './dto/checkout-sheltered-people.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ModulePermissionGuard } from '../auth/guards/module-permission.guard';
import {
  CheckModulePermission,
  ModulePermission,
} from '../auth/decorators/module-permission.decorator';
import { ModuleKey } from '../auth/decorators/module-key.decorator';

@ApiTags('sheltered-people')
@Controller('sheltered-people')
@UseGuards(JwtAuthGuard, ModulePermissionGuard)
@ApiBearerAuth()
@ModuleKey('people')
export class ShelteredPeopleController {
  constructor(
    private readonly shelteredPeopleService: ShelteredPeopleService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo abrigado' })
  @CheckModulePermission(ModulePermission.WRITE)
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
  @CheckModulePermission(ModulePermission.READ)
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
  @CheckModulePermission(ModulePermission.READ)
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
  @CheckModulePermission(ModulePermission.READ)
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
  @CheckModulePermission(ModulePermission.READ)
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
  @CheckModulePermission(ModulePermission.READ)
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
  @CheckModulePermission(ModulePermission.WRITE)
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
  @CheckModulePermission(ModulePermission.WRITE)
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

  @Post('checkout')
  @ApiOperation({ 
    summary: 'Fazer checkout de abrigados',
    description: 'Marca múltiplos abrigados como inativos (não estão mais no abrigo)'
  })
  @CheckModulePermission(ModulePermission.WRITE)
  @ApiResponse({
    status: 200,
    description: 'Checkout realizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Um ou mais abrigados não foram encontrados',
  })
  checkout(@Body() checkoutShelteredPeopleDto: CheckoutShelteredPeopleDto) {
    return this.shelteredPeopleService.checkoutPeople(
      checkoutShelteredPeopleDto.peopleIds,
      checkoutShelteredPeopleDto.shelterId
    );
  }
}
