import { Test, TestingModule } from '@nestjs/testing';
import { VolunteerInvitationsController } from './volunteer-invitations.controller';

describe('VolunteerInvitationsController', () => {
  let controller: VolunteerInvitationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VolunteerInvitationsController],
    }).compile();

    controller = module.get<VolunteerInvitationsController>(VolunteerInvitationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
