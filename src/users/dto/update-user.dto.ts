import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nome do usuário',
    example: 'João Silva',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Email do usuário',
    example: 'joao@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Senha atual do usuário (obrigatória para alterar a senha)',
    example: 'senhaAtual123',
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiPropertyOptional({
    description: 'Nova senha do usuário (mínimo 6 caracteres)',
    example: 'novaSenha123',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
