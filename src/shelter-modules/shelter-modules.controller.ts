import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShelterModulesService } from './shelter-modules.service';
import { UpdateShelterModuleDto } from './dto/update-shelter-module.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ModulePermissionGuard } from '../auth/guards/module-permission.guard';
import { ShelterRolesGuard, ShelterAdminOnly } from '../auth/guards/shelter-roles.guard';
import {
  CheckModulePermission,
  ModulePermission,
} from '../auth/decorators/module-permission.decorator';

@Controller('shelters/:shelterId/modules')
@UseGuards(JwtAuthGuard)
export class ShelterModulesController {
  constructor(private readonly shelterModulesService: ShelterModulesService) {}

  // Qualquer usuário autenticado pode listar os módulos
  @Get()
  findAll(@Param('shelterId') shelterId: string) {
    return this.shelterModulesService.findAll(shelterId);
  }

  // Qualquer usuário autenticado pode ver detalhes de um módulo
  @Get(':id')
  findOne(@Param('shelterId') shelterId: string, @Param('id') id: string) {
    return this.shelterModulesService.findOne(shelterId, id);
  }

  // Apenas responsável pelo módulo pode editar
  @Patch(':id')
  @UseGuards(ModulePermissionGuard)
  @CheckModulePermission(ModulePermission.MANAGE)
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

  // Apenas OWNER/ADMIN do abrigo pode ativar/desativar módulos
  @Patch(':id/toggle')
  @UseGuards(ShelterRolesGuard)
  @ShelterAdminOnly()
  toggleActive(@Param('shelterId') shelterId: string, @Param('id') id: string) {
    return this.shelterModulesService.toggleActive(shelterId, id);
  }
}
