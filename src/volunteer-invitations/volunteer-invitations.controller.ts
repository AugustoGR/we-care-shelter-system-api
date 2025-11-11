import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VolunteerInvitationsService } from './volunteer-invitations.service';
import { CreateVolunteerInvitationDto } from './dto/create-volunteer-invitation.dto';
import { RespondInvitationDto } from './dto/respond-invitation.dto';

@ApiTags('volunteer-invitations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('volunteer-invitations')
export class VolunteerInvitationsController {
  constructor(
    private readonly volunteerInvitationsService: VolunteerInvitationsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a volunteer invitation' })
  @ApiResponse({
    status: 201,
    description: 'The invitation has been successfully created.',
  })
  create(@Body() createInvitationDto: CreateVolunteerInvitationDto) {
    return this.volunteerInvitationsService.create(createInvitationDto);
  }

  @Get('my-invitations')
  @ApiOperation({ summary: 'Get all invitations for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return all pending invitations for the current user.',
  })
  findMyInvitations(@Request() req) {
    return this.volunteerInvitationsService.findAllByUser(req.user.id);
  }

  @Patch(':id/respond')
  @ApiOperation({ summary: 'Respond to a volunteer invitation' })
  @ApiResponse({
    status: 200,
    description: 'The invitation has been responded to.',
  })
  respond(
    @Param('id') id: string,
    @Request() req,
    @Body() respondDto: RespondInvitationDto,
  ) {
    return this.volunteerInvitationsService.respondToInvitation(
      id,
      req.user.id,
      respondDto.response,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a volunteer invitation' })
  @ApiResponse({
    status: 200,
    description: 'The invitation has been deleted.',
  })
  remove(@Param('id') id: string) {
    return this.volunteerInvitationsService.remove(id);
  }
}

