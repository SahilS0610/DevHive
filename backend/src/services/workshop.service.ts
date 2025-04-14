import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workshop } from '../entities/Workshop';
import { WorkshopRegistration } from '../entities/WorkshopRegistration';
import { WorkshopResource } from '../entities/WorkshopResource';
import { CreateWorkshopDTO, UpdateWorkshopDTO, CreateResourceDTO, TrackAttendanceDTO } from '../dto/workshop.dto';
import { WorkshopStatus, RegistrationStatus } from '../entities/WorkshopRegistration';

@Injectable()
export class WorkshopService {
  constructor(
    @InjectRepository(Workshop)
    private workshopRepository: Repository<Workshop>,
    @InjectRepository(WorkshopRegistration)
    private registrationRepository: Repository<WorkshopRegistration>,
    @InjectRepository(WorkshopResource)
    private resourceRepository: Repository<WorkshopResource>,
  ) {}

  async createWorkshop(dto: CreateWorkshopDTO): Promise<Workshop> {
    const workshop = this.workshopRepository.create({
      ...dto,
      status: WorkshopStatus.DRAFT,
    });
    return this.workshopRepository.save(workshop);
  }

  async updateWorkshop(id: string, dto: UpdateWorkshopDTO): Promise<Workshop> {
    const workshop = await this.workshopRepository.findOneOrFail({ where: { id } });
    Object.assign(workshop, dto);
    return this.workshopRepository.save(workshop);
  }

  async getWorkshop(id: string): Promise<Workshop> {
    return this.workshopRepository.findOneOrFail({
      where: { id },
      relations: ['instructor', 'registrations', 'resources'],
    });
  }

  async listWorkshops(status?: WorkshopStatus): Promise<Workshop[]> {
    const where = status ? { status } : {};
    return this.workshopRepository.find({
      where,
      relations: ['instructor'],
      order: { startDate: 'ASC' },
    });
  }

  async registerForWorkshop(workshopId: string, userId: string): Promise<WorkshopRegistration> {
    const workshop = await this.workshopRepository.findOneOrFail({
      where: { id: workshopId },
      relations: ['registrations'],
    });

    if (workshop.status !== WorkshopStatus.PUBLISHED) {
      throw new Error('Workshop is not open for registration');
    }

    if (workshop.registrations.length >= workshop.maxParticipants) {
      throw new Error('Workshop is full');
    }

    const existingRegistration = await this.registrationRepository.findOne({
      where: { workshop: { id: workshopId }, user: { id: userId } },
    });

    if (existingRegistration) {
      throw new Error('User is already registered for this workshop');
    }

    const registration = this.registrationRepository.create({
      workshop: { id: workshopId },
      user: { id: userId },
      status: RegistrationStatus.PENDING,
      attendance: {},
      progress: { completedSessions: 0, xpEarned: 0 },
    });

    return this.registrationRepository.save(registration);
  }

  async addResource(workshopId: string, dto: CreateResourceDTO, uploadedById: string): Promise<WorkshopResource> {
    const resource = this.resourceRepository.create({
      ...dto,
      workshop: { id: workshopId },
      uploadedBy: { id: uploadedById },
      downloadCount: 0,
      viewCount: 0,
    });

    return this.resourceRepository.save(resource);
  }

  async trackAttendance(workshopId: string, dto: TrackAttendanceDTO): Promise<void> {
    const registrations = await this.registrationRepository.find({
      where: {
        workshop: { id: workshopId },
        user: { id: In(dto.attendeeIds) },
      },
    });

    for (const registration of registrations) {
      registration.attendance[dto.sessionDate.toISOString()] = true;
      registration.progress.completedSessions += 1;
      registration.progress.xpEarned += 10; // Award XP for attendance

      if (registration.progress.completedSessions >= 5) { // Assuming 5 sessions for completion
        registration.status = RegistrationStatus.COMPLETED;
      }
    }

    await this.registrationRepository.save(registrations);
  }

  async getWorkshopProgress(workshopId: string): Promise<{
    totalRegistrations: number;
    averageAttendance: number;
    completionRate: number;
  }> {
    const registrations = await this.registrationRepository.find({
      where: { workshop: { id: workshopId } },
    });

    const totalRegistrations = registrations.length;
    const completedRegistrations = registrations.filter(r => r.status === RegistrationStatus.COMPLETED).length;
    const totalSessions = 5; // Assuming 5 sessions per workshop
    const totalPossibleAttendance = totalRegistrations * totalSessions;
    const actualAttendance = registrations.reduce((sum, r) => sum + r.progress.completedSessions, 0);

    return {
      totalRegistrations,
      averageAttendance: totalPossibleAttendance > 0 ? (actualAttendance / totalPossibleAttendance) * 100 : 0,
      completionRate: totalRegistrations > 0 ? (completedRegistrations / totalRegistrations) * 100 : 0,
    };
  }
} 