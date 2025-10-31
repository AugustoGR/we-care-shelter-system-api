import { IsString, IsInt, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResourceDto {
  @ApiProperty({
    description: 'Nome do recurso',
    example: 'Arroz 5kg',
  })
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'Categoria do recurso',
    example: 'Alimentos',
  })
  @IsString()
  categoria: string;

  @ApiProperty({
    description: 'Quantidade disponível',
    example: 50,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  quantidade: number;

  @ApiProperty({
    description: 'Unidade de medida',
    example: 'pacotes',
  })
  @IsString()
  unidade: string;

  @ApiPropertyOptional({
    description: 'Data de validade do recurso',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  validade?: string;

  @ApiProperty({
    description: 'Status do recurso',
    example: 'Em Estoque',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'ID do abrigo',
    example: 'uuid-do-abrigo',
  })
  @IsString()
  shelterId: string;
}
