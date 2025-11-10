import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CheckoutAnimalsDto {
  @ApiProperty({
    description: 'Array de IDs dos animais para fazer checkout (marcar como inativos)',
    example: ['cm123abc456', 'cm789xyz012'],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  animalIds: string[];

  @ApiProperty({
    description: 'ID do abrigo dos animais',
    example: 'cmhmw2g560002t3q2140ronpg',
  })
  @IsString()
  @IsNotEmpty()
  shelterId: string;
}
