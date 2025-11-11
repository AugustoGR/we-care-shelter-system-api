import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VolunteerInvitationsService } from './volunteer-invitations.service';
import { VolunteerInvitationsController } from './volunteer-invitations.controller';

@Module({
  imports: [PrismaModule],
  providers: [VolunteerInvitationsService],
  controllers: [VolunteerInvitationsController],
  exports: [VolunteerInvitationsService],
})
export class VolunteerInvitationsModule {}
