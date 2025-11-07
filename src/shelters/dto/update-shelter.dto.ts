import { PartialType } from '@nestjs/swagger';
import { CreateShelterDto } from './create-shelter.dto';
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateShelterDto extends PartialType(CreateShelterDto) {
  @ApiPropertyOptional({
    example: 'cmhmw2g560002t3q2140ronpg',
    description: 'ID do novo proprietário do abrigo',
  })
  @IsString()
  @IsOptional()
  ownerId?: string;
}
