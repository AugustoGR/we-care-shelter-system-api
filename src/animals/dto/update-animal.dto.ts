import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { CreateAnimalDto } from './create-animal.dto';

export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {
  @ApiProperty({
    description: 'ID do abrigo onde o animal está',
    example: 'cmhmw2g560002t3q2140ronpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  shelterId?: string;
}
