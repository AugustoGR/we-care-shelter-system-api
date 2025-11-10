import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class WithdrawResourceDto {
  @ApiProperty({
    description: 'ID do recurso do qual será retirada a quantidade',
    example: 'cm123abc456',
  })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({
    description: 'Quantidade a ser retirada do estoque',
    example: 10,
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'A quantidade deve ser pelo menos 1' })
  quantidade: number;

  @ApiProperty({
    description: 'ID do abrigo do recurso',
    example: 'cmhmw2g560002t3q2140ronpg',
  })
  @IsString()
  @IsNotEmpty()
  shelterId: string;
}
