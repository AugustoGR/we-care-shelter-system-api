import { IsBoolean, IsOptional, IsArray, IsString, ValidateIf } from 'class-validator';

export class UpdateShelterModuleDto {
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ValidateIf((o) => o.responsibleVolunteerId !== null && o.responsibleVolunteerId !== '')
  @IsString()
  @IsOptional()
  responsibleVolunteerId?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  associatedVolunteerIds?: string[];
}
