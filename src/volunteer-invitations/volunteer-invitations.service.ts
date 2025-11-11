import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVolunteerInvitationDto } from './dto/create-volunteer-invitation.dto';
import { InvitationResponse } from './dto/respond-invitation.dto';

@Injectable()
export class VolunteerInvitationsService {
  constructor(private prisma: PrismaService) {}

  async create(createInvitationDto: CreateVolunteerInvitationDto) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: createInvitationDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificar se o shelter existe
    const shelter = await this.prisma.shelter.findUnique({
      where: { id: createInvitationDto.shelterId },
    });

    if (!shelter) {
      throw new NotFoundException('Shelter not found');
    }

    // Verificar se o usuário já é voluntário deste abrigo
    const existingVolunteer = await this.prisma.volunteer.findFirst({
      where: {
        userId: createInvitationDto.userId,
        shelterId: createInvitationDto.shelterId,
      },
    });

    if (existingVolunteer) {
      throw new ConflictException('User is already a volunteer in this shelter');
    }

    // Verificar se já existe um convite pendente
    const existingInvitation = await this.prisma.volunteerInvitation.findUnique({
      where: {
        userId_shelterId: {
          userId: createInvitationDto.userId,
          shelterId: createInvitationDto.shelterId,
        },
      },
    });

    if (existingInvitation && existingInvitation.status === 'PENDING') {
      throw new ConflictException('There is already a pending invitation for this user in this shelter');
    }

    // Se já existe um convite rejeitado ou aceito, deletar e criar um novo
    if (existingInvitation) {
      await this.prisma.volunteerInvitation.delete({
        where: { id: existingInvitation.id },
      });
    }

    // Criar o convite
    return this.prisma.volunteerInvitation.create({
      data: {
        userId: createInvitationDto.userId,
        shelterId: createInvitationDto.shelterId,
        phone: createInvitationDto.phone,
        skills: createInvitationDto.skills || [],
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shelter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.volunteerInvitation.findMany({
      where: {
        userId,
        status: 'PENDING',
      },
      include: {
        shelter: {
          select: {
            id: true,
            name: true,
            description: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async respondToInvitation(invitationId: string, userId: string, response: InvitationResponse) {
    const invitation = await this.prisma.volunteerInvitation.findUnique({
      where: { id: invitationId },
      include: {
        user: true,
        shelter: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.userId !== userId) {
      throw new BadRequestException('You are not authorized to respond to this invitation');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('This invitation has already been responded to');
    }

    if (response === InvitationResponse.ACCEPTED) {
      // Criar o voluntário
      const volunteer = await this.prisma.volunteer.create({
        data: {
          userId: invitation.userId,
          shelterId: invitation.shelterId,
          phone: invitation.phone,
          skills: invitation.skills,
          status: 'Ativo',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          shelter: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Criar registro na tabela UserShelter com role VOLUNTEER
      await this.prisma.userShelter.create({
        data: {
          userId: invitation.userId,
          shelterId: invitation.shelterId,
          role: 'VOLUNTEER',
        },
      });

      // Atualizar o convite para ACCEPTED
      await this.prisma.volunteerInvitation.update({
        where: { id: invitationId },
        data: { status: 'ACCEPTED' },
      });

      return volunteer;
    } else {
      // Atualizar o convite para REJECTED
      await this.prisma.volunteerInvitation.update({
        where: { id: invitationId },
        data: { status: 'REJECTED' },
      });

      return { message: 'Invitation rejected successfully' };
    }
  }

  async remove(invitationId: string) {
    const invitation = await this.prisma.volunteerInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.prisma.volunteerInvitation.delete({
      where: { id: invitationId },
    });

    return { message: 'Invitation deleted successfully' };
  }
}

