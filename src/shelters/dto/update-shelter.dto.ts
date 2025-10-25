import { PartialType } from '@nestjs/swagger';
import { CreateShelterDto } from './create-shelter.dto';
import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateShelterDto extends PartialType(CreateShelterDto) {
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do novo proprietário do abrigo',
  })
  @IsUUID()
  @IsOptional()
  ownerId?: string;
}
