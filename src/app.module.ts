import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SheltersModule } from './shelters/shelters.module';
import { VolunteersModule } from './volunteers/volunteers.module';
import { AnimalsModule } from './animals/animals.module';
import { ShelteredPeopleModule } from './sheltered-people/sheltered-people.module';
import { ResourcesModule } from './resources/resources.module';
import { ShelterModulesModule } from './shelter-modules/shelter-modules.module';
import { VolunteerInvitationsModule } from './volunteer-invitations/volunteer-invitations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SheltersModule,
    VolunteersModule,
    AnimalsModule,
    ShelteredPeopleModule,
    ResourcesModule,
    ShelterModulesModule,
    VolunteerInvitationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
