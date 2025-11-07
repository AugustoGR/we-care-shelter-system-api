import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { CreateVolunteerDto } from './create-volunteer.dto';

export class UpdateVolunteerDto extends PartialType(CreateVolunteerDto) {
  @ApiProperty({
    description: 'ID do abrigo',
    example: 'cmhmw2g560002t3q2140ronpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  shelterId?: string;
}
