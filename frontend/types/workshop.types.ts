export interface Workshop {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: Date;
  endDate: Date;
  maxSeats: number;
  enrolledCount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  coverImage: string;
  instructor: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
  };
  resources: WorkshopResource[];
  prerequisites: string[];
  isEnrolled: boolean;
  isSaved: boolean;
  progress?: number;
}

export interface WorkshopResource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'link' | 'code';
  url: string;
  description?: string;
  uploadedAt: Date;
  uploadedBy: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface WorkshopRegistration {
  id: string;
  workshopId: string;
  userId: string;
  status: 'registered' | 'waitlisted' | 'cancelled';
  registeredAt: Date;
  lastAccessedAt?: Date;
  progress?: number;
}

export interface WorkshopFilter {
  category?: string;
  status?: Workshop['status'];
  instructor?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
} 