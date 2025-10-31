import { IsString, IsEmail, IsArray, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum VolunteerStatus {
  ATIVO = 'Ativo',
  INATIVO = 'Inativo',
  AUSENTE = 'Ausente',
}

export class CreateVolunteerDto {
  @ApiProperty({ example: 'uuid-do-usuario', description: 'ID do usuário que será o voluntário' })
  @IsString()
  userId: string;

  @ApiProperty({ example: '(11) 98765-4321' })
  @IsString()
  phone: string;

  @ApiProperty({ example: ['Enfermagem', 'Organização'], required: false })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiProperty({ enum: VolunteerStatus, default: VolunteerStatus.ATIVO })
  @IsEnum(VolunteerStatus)
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'uuid-do-abrigo' })
  @IsString()
  shelterId: string;
}
