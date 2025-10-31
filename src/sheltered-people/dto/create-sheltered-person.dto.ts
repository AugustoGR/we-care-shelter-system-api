import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsUUID,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateShelteredPersonDto {
  @ApiProperty({
    description: 'Nome completo do abrigado',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    description: 'CPF do abrigado',
    example: '123.456.789-00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF deve estar no formato 000.000.000-00',
  })
  cpf: string;

  @ApiProperty({
    description: 'Data de nascimento do abrigado',
    example: '1985-03-15',
  })
  @IsDateString()
  @IsNotEmpty()
  dataNascimento: string;

  @ApiProperty({
    description: 'Gênero do abrigado',
    example: 'Masculino',
    enum: ['Masculino', 'Feminino', 'Outro'],
  })
  @IsString()
  @IsNotEmpty()
  genero: string;

  @ApiProperty({
    description: 'Status do abrigado',
    example: 'Ativo',
    enum: ['Ativo', 'Inativo', 'Transferido'],
    default: 'Ativo',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'ID do abrigo onde a pessoa está abrigada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  shelterId: string;
}
