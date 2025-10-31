import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { VolunteersService } from './volunteers.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('volunteers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new volunteer' })
  @ApiResponse({
    status: 201,
    description: 'The volunteer has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Shelter not found.' })
  create(@Body() createVolunteerDto: CreateVolunteerDto) {
    return this.volunteersService.create(createVolunteerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all volunteers' })
  @ApiQuery({
    name: 'shelterId',
    required: false,
    description: 'Filter volunteers by shelter ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all volunteers.',
  })
  findAll(@Query('shelterId') shelterId?: string) {
    return this.volunteersService.findAll(shelterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a volunteer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the volunteer.',
  })
  @ApiResponse({ status: 404, description: 'Volunteer not found.' })
  findOne(@Param('id') id: string) {
    return this.volunteersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a volunteer' })
  @ApiResponse({
    status: 200,
    description: 'The volunteer has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Volunteer not found.' })
  update(
    @Param('id') id: string,
    @Body() updateVolunteerDto: UpdateVolunteerDto,
  ) {
    return this.volunteersService.update(id, updateVolunteerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a volunteer' })
  @ApiResponse({
    status: 200,
    description: 'The volunteer has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Volunteer not found.' })
  remove(@Param('id') id: string) {
    return this.volunteersService.remove(id);
  }

  @Patch(':id/activity')
  @ApiOperation({ summary: 'Update volunteer last activity' })
  @ApiResponse({
    status: 200,
    description: 'The volunteer activity has been updated.',
  })
  @ApiResponse({ status: 404, description: 'Volunteer not found.' })
  updateActivity(@Param('id') id: string) {
    return this.volunteersService.updateLastActivity(id);
  }
}
