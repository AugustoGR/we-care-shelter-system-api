import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { CreateResourceDto } from './create-resource.dto';

export class UpdateResourceDto extends PartialType(CreateResourceDto) {
  @ApiProperty({
    description: 'ID do abrigo',
    example: 'cmhmw2g560002t3q2140ronpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  shelterId?: string;
}
