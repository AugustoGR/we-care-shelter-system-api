import { PartialType } from '@nestjs/swagger';
import { CreateShelteredPersonDto } from './create-sheltered-person.dto';

export class UpdateShelteredPersonDto extends PartialType(
  CreateShelteredPersonDto,
) {}
