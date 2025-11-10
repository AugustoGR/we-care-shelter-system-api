import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CheckoutShelteredPeopleDto {
  @ApiProperty({
    description: 'Array de IDs dos abrigados para fazer checkout (marcar como inativos)',
    example: ['cm123abc456', 'cm789xyz012'],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  peopleIds: string[];

  @ApiProperty({
    description: 'ID do abrigo dos abrigados',
    example: 'cmhmw2g560002t3q2140ronpg',
  })
  @IsString()
  @IsNotEmpty()
  shelterId: string;
}
