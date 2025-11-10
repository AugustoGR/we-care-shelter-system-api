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
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { CheckoutAnimalsDto } from './dto/checkout-animals.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ModulePermissionGuard } from '../auth/guards/module-permission.guard';
import {
  CheckModulePermission,
  ModulePermission,
} from '../auth/decorators/module-permission.decorator';
import { ModuleKey } from '../auth/decorators/module-key.decorator';

// DTO para documentação do Swagger para upload de foto
class CreateAnimalWithPhotoDto {
  @ApiProperty({ description: 'Nome do animal', example: 'Tobby' })
  name: string;

  @ApiProperty({ description: 'Espécie do animal', example: 'Cachorro' })
  species: string;

  @ApiProperty({ description: 'Raça do animal', example: 'Labrador', required: false })
  breed?: string;

  @ApiProperty({ description: 'Idade do animal em anos', example: 3, required: false })
  age?: number;

  @ApiProperty({ description: 'Sexo do animal', example: 'Macho', enum: ['Macho', 'Fêmea'] })
  sex: string;

  @ApiProperty({ description: 'Estado de saúde do animal', example: 'Saudável' })
  health: string;

  @ApiProperty({ description: 'Requisitos de cuidado especial', required: false })
  care?: string;

  @ApiProperty({ description: 'Vacinado contra raiva', example: true, required: false })
  rabies?: boolean;

  @ApiProperty({ description: 'Vacinado contra cinomose', example: true, required: false })
  cinomose?: boolean;

  @ApiProperty({ description: 'Vacinado contra parvovirose', example: false, required: false })
  parvo?: boolean;

  @ApiProperty({ description: 'Vacinado contra doença felina', example: false, required: false })
  felina?: boolean;

  @ApiProperty({ description: 'Foto do animal', type: 'string', format: 'binary', required: false })
  photo?: any;

  @ApiProperty({ description: 'Status atual do animal', example: 'Em Cuidado', required: false })
  status?: string;

  @ApiProperty({ description: 'ID do abrigo onde o animal está', example: 'cmhmw2g560002t3q2140ronpg' })
  shelterId: string;
}

@ApiTags('animals')
@Controller('animals')
@UseGuards(JwtAuthGuard, ModulePermissionGuard)
@ApiBearerAuth()
@ModuleKey('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar um novo animal',
    description: 'Cria um novo animal. Se enviar com foto, use multipart/form-data e adicione shelterId como query parameter (?shelterId=xxx). A foto será automaticamente otimizada (JPEG 60%, max 800x800px) e armazenada como base64.'
  })
  @CheckModulePermission(ModulePermission.WRITE)
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    description: 'Dados do animal. Para upload com foto, use multipart/form-data',
    type: CreateAnimalWithPhotoDto,
  })
  @ApiQuery({
    name: 'shelterId',
    required: false,
    description: 'ID do abrigo (obrigatório quando enviando com foto via multipart/form-data)',
  })
  @ApiResponse({
    status: 201,
    description: 'Animal criado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Abrigo não encontrado',
  })
  @UseInterceptors(FileInterceptor('photo'))
  create(
    @Req() req: Request,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    if (!req.body.shelterId) {
      throw new BadRequestException('shelterId é obrigatório');
    }
    
    const createAnimalDto: CreateAnimalDto = {
      name: req.body.name,
      species: req.body.species,
      breed: req.body.breed,
      age: req.body.age ? parseInt(req.body.age) : undefined,
      sex: req.body.sex,
      health: req.body.health,
      care: req.body.care,
      rabies: req.body.rabies === 'true',
      cinomose: req.body.cinomose === 'true',
      parvo: req.body.parvo === 'true',
      felina: req.body.felina === 'true',
      status: req.body.status,
      shelterId: req.body.shelterId,
    };
    
    return this.animalsService.create(createAnimalDto, photo);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os animais' })
  @CheckModulePermission(ModulePermission.READ)
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
  @CheckModulePermission(ModulePermission.READ)
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
    return this.animalsService.getStatsByShelterId(shelterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um animal por ID' })
  @CheckModulePermission(ModulePermission.READ)
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
  @ApiOperation({
    summary: 'Atualizar um animal',
    description: 'Atualiza dados de um animal existente. Para atualizar a foto, use multipart/form-data. A foto será automaticamente otimizada (JPEG 60%, max 800x800px).'
  })
  @CheckModulePermission(ModulePermission.WRITE)
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    description: 'Dados do animal para atualização. Para upload com foto, use multipart/form-data',
    type: CreateAnimalWithPhotoDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Animal atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Animal não encontrado',
  })
  @UseInterceptors(FileInterceptor('photo'))
  update(
    @Param('id') id: string,
    @Req() req: Request,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    const updateAnimalDto: UpdateAnimalDto = {};
    
    if (req.body.name) updateAnimalDto.name = req.body.name;
    if (req.body.species) updateAnimalDto.species = req.body.species;
    if (req.body.breed) updateAnimalDto.breed = req.body.breed;
    if (req.body.age) updateAnimalDto.age = parseInt(req.body.age);
    if (req.body.sex) updateAnimalDto.sex = req.body.sex;
    if (req.body.health) updateAnimalDto.health = req.body.health;
    if (req.body.care) updateAnimalDto.care = req.body.care;
    if (req.body.rabies !== undefined) updateAnimalDto.rabies = req.body.rabies === 'true';
    if (req.body.cinomose !== undefined) updateAnimalDto.cinomose = req.body.cinomose === 'true';
    if (req.body.parvo !== undefined) updateAnimalDto.parvo = req.body.parvo === 'true';
    if (req.body.felina !== undefined) updateAnimalDto.felina = req.body.felina === 'true';
    if (req.body.status) updateAnimalDto.status = req.body.status;
    if (req.body.shelterId) updateAnimalDto.shelterId = req.body.shelterId;
    
    return this.animalsService.update(id, updateAnimalDto, photo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um animal' })
  @CheckModulePermission(ModulePermission.WRITE)
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

  @Post('checkout')
  @ApiOperation({ 
    summary: 'Fazer checkout de animais',
    description: 'Marca múltiplos animais como inativos (não estão mais no abrigo)'
  })
  @CheckModulePermission(ModulePermission.WRITE)
  @ApiResponse({
    status: 200,
    description: 'Checkout realizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Um ou mais animais não foram encontrados',
  })
  checkout(@Body() checkoutAnimalsDto: CheckoutAnimalsDto) {
    return this.animalsService.checkoutAnimals(
      checkoutAnimalsDto.animalIds,
      checkoutAnimalsDto.shelterId
    );
  }
}
