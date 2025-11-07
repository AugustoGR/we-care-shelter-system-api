import { Module } from '@nestjs/common';
import { ShelterModulesService } from './shelter-modules.service';
import { ShelterModulesController } from './shelter-modules.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ShelterModulesController],
  providers: [ShelterModulesService],
  exports: [ShelterModulesService],
})
export class ShelterModulesModule {}
