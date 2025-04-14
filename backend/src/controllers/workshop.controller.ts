import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { WorkshopService } from '../services/workshop.service';
import { CreateWorkshopDTO, UpdateWorkshopDTO, CreateResourceDTO, TrackAttendanceDTO } from '../dto/workshop.dto';
import { WorkshopStatus } from '../entities/WorkshopRegistration';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/User';

@Controller('workshops')
@UseGuards(JwtAuthGuard)
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  @Post()
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async createWorkshop(@Body() dto: CreateWorkshopDTO) {
    return this.workshopService.createWorkshop(dto);
  }

  @Put(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async updateWorkshop(@Param('id') id: string, @Body() dto: UpdateWorkshopDTO) {
    return this.workshopService.updateWorkshop(id, dto);
  }

  @Get(':id')
  async getWorkshop(@Param('id') id: string) {
    return this.workshopService.getWorkshop(id);
  }

  @Get()
  async listWorkshops(@Param('status') status?: WorkshopStatus) {
    return this.workshopService.listWorkshops(status);
  }

  @Post(':id/register')
  async registerForWorkshop(@Param('id') workshopId: string, @Req() req) {
    return this.workshopService.registerForWorkshop(workshopId, req.user.id);
  }

  @Post(':id/resources')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async addResource(
    @Param('id') workshopId: string,
    @Body() dto: CreateResourceDTO,
    @Req() req,
  ) {
    return this.workshopService.addResource(workshopId, dto, req.user.id);
  }

  @Post(':id/attendance')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async trackAttendance(
    @Param('id') workshopId: string,
    @Body() dto: TrackAttendanceDTO,
  ) {
    return this.workshopService.trackAttendance(workshopId, dto);
  }

  @Get(':id/progress')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async getWorkshopProgress(@Param('id') workshopId: string) {
    return this.workshopService.getWorkshopProgress(workshopId);
  }
} 