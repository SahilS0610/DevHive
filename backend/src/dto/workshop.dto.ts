import { IsString, IsDate, IsNumber, IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ResourceType } from '../entities/WorkshopResource';

export enum WorkshopStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class CreateWorkshopDTO {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsArray()
  @IsString({ each: true })
  prerequisites: string[];

  @IsArray()
  @IsString({ each: true })
  learningOutcomes: string[];

  @IsNumber()
  maxParticipants: number;

  @IsUUID()
  instructorId: string;
}

export class UpdateWorkshopDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(WorkshopStatus)
  @IsOptional()
  status?: WorkshopStatus;

  @IsNumber()
  @IsOptional()
  maxParticipants?: number;
}

export class CreateResourceDTO {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ResourceType)
  type: ResourceType;

  @IsString()
  url: string;

  @IsOptional()
  metadata?: {
    fileSize?: number;
    duration?: number;
    format?: string;
    tags?: string[];
    isRequired?: boolean;
  };
}

export class TrackAttendanceDTO {
  @IsArray()
  @IsString({ each: true })
  attendeeIds: string[];

  @IsDate()
  sessionDate: Date;
} 