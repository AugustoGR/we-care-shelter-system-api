import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShelterDto {
  @ApiProperty({ example: 'Abrigo Esperança', description: 'Nome do abrigo' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Abrigo para vítimas de enchentes',
    description: 'Descrição do abrigo',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'Inundação',
    description: 'Tipo de calamidade',
  })
  @IsString()
  @IsNotEmpty()
  calamity: string;

  @ApiProperty({ example: 'Rua da Paz, 123', description: 'Endereço do abrigo' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Porto Alegre', description: 'Cidade' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'RS', description: 'Estado (sigla)' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '90000-000', description: 'CEP' })
  @IsString()
  @IsNotEmpty()
  cep: string;

  @ApiPropertyOptional({ example: true, description: 'Status do abrigo (ativo/inativo)' })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
