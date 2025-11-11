import { Test, TestingModule } from '@nestjs/testing';
import { VolunteerInvitationsService } from './volunteer-invitations.service';

describe('VolunteerInvitationsService', () => {
  let service: VolunteerInvitationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VolunteerInvitationsService],
    }).compile();

    service = module.get<VolunteerInvitationsService>(VolunteerInvitationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
