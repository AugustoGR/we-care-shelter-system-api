import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { CreateShelteredPersonDto } from './create-sheltered-person.dto';

export class UpdateShelteredPersonDto extends PartialType(
  CreateShelteredPersonDto,
) {
  @ApiProperty({
    description: 'ID do abrigo onde a pessoa está abrigada',
    example: 'cmhmw2g560002t3q2140ronpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  shelterId?: string;
}
