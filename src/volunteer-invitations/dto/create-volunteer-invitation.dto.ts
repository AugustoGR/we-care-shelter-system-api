import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateVolunteerInvitationDto {
  @ApiProperty({ example: 'uuid-do-usuario', description: 'ID do usuário que será convidado' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'uuid-do-abrigo' })
  @IsString()
  shelterId: string;

  @ApiProperty({ example: '(11) 98765-4321' })
  @IsString()
  phone: string;

  @ApiProperty({ example: ['Enfermagem', 'Organização'], required: false })
  @IsArray()
  @IsOptional()
  skills?: string[];
}
