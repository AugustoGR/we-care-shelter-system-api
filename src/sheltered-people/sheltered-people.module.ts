import { Module } from '@nestjs/common';
import { ShelteredPeopleService } from './sheltered-people.service';
import { ShelteredPeopleController } from './sheltered-people.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShelteredPeopleController],
  providers: [ShelteredPeopleService],
  exports: [ShelteredPeopleService],
})
export class ShelteredPeopleModule {}
