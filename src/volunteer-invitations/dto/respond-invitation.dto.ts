import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum InvitationResponse {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export class RespondInvitationDto {
  @ApiProperty({ enum: InvitationResponse })
  @IsEnum(InvitationResponse)
  response: InvitationResponse;
}
