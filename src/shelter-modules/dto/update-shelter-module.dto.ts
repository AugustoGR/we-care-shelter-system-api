import { IsBoolean, IsOptional, IsArray, IsString } from 'class-validator';

export class UpdateShelterModuleDto {
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  responsibleVolunteerId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  associatedVolunteerIds?: string[];
}
