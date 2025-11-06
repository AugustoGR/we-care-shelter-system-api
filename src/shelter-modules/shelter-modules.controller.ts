import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ShelterModulesService } from './shelter-modules.service';
import { UpdateShelterModuleDto } from './dto/update-shelter-module.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('shelters/:shelterId/modules')
@UseGuards(JwtAuthGuard)
export class ShelterModulesController {
  constructor(private readonly shelterModulesService: ShelterModulesService) {}

  @Get()
  findAll(@Param('shelterId') shelterId: string) {
    return this.shelterModulesService.findAll(shelterId);
  }

  @Get(':id')
  findOne(@Param('shelterId') shelterId: string, @Param('id') id: string) {
    return this.shelterModulesService.findOne(shelterId, id);
  }

  @Patch(':id')
  update(
    @Param('shelterId') shelterId: string,
    @Param('id') id: string,
    @Body() updateShelterModuleDto: UpdateShelterModuleDto,
  ) {
    return this.shelterModulesService.update(
      shelterId,
      id,
      updateShelterModuleDto,
    );
  }

  @Patch(':id/toggle')
  toggleActive(@Param('shelterId') shelterId: string, @Param('id') id: string) {
    return this.shelterModulesService.toggleActive(shelterId, id);
  }
}
