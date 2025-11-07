import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateAnimalDto {
  @ApiProperty({
    description: 'Nome do animal',
    example: 'Tobby',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Espécie do animal',
    example: 'Cachorro',
  })
  @IsString()
  @IsNotEmpty()
  species: string;

  @ApiPropertyOptional({
    description: 'Raça do animal',
    example: 'Labrador',
  })
  @IsString()
  @IsOptional()
  breed?: string;

  @ApiPropertyOptional({
    description: 'Idade do animal em anos',
    example: 3,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  age?: number;

  @ApiProperty({
    description: 'Sexo do animal',
    example: 'Macho',
    enum: ['Macho', 'Fêmea'],
  })
  @IsString()
  @IsNotEmpty()
  sex: string;

  @ApiProperty({
    description: 'Estado de saúde do animal',
    example: 'Saudável',
    enum: ['Saudável', 'Em Cuidado', 'Aguardando Adoção', 'Adotado', 'Reunido'],
  })
  @IsString()
  @IsNotEmpty()
  health: string;

  @ApiPropertyOptional({
    description: 'Requisitos de cuidado especial',
    example: 'Precisa de medicação diária',
  })
  @IsString()
  @IsOptional()
  care?: string;

  @ApiPropertyOptional({
    description: 'Vacinado contra raiva',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  rabies?: boolean;

  @ApiPropertyOptional({
    description: 'Vacinado contra cinomose',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  cinomose?: boolean;

  @ApiPropertyOptional({
    description: 'Vacinado contra parvovirose',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  parvo?: boolean;

  @ApiPropertyOptional({
    description: 'Vacinado contra doença felina',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  felina?: boolean;

  @ApiPropertyOptional({
    description: 'URL da foto do animal',
    example: 'https://example.com/photo.jpg',
  })
  @IsString()
  @IsOptional()
  photo?: string;

  @ApiPropertyOptional({
    description: 'Status atual do animal',
    example: 'Em Cuidado',
    default: 'Em Cuidado',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'ID do abrigo onde o animal está',
    example: 'cmhmw2g560002t3q2140ronpg',
  })
  @IsString()
  @IsNotEmpty()
  shelterId: string;
}
