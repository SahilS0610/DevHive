export type WorkshopStatus = 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';

export type ResourceType = 'document' | 'video' | 'link';

export interface Workshop {
  id: string;
  title: string;
  description: string;
  prerequisites: string[];
  learningOutcomes: string[];
  status: WorkshopStatus;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  sessions: WorkshopSession[];
  resources: WorkshopResource[];
  completionRate: number;
}

export interface WorkshopSession {
  id: string;
  date: Date;
  duration: number;
  title: string;
  description: string;
  attendance: number;
}

export interface WorkshopResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  downloadCount: number;
  viewCount: number;
  createdAt: Date;
}

export interface WorkshopMetrics {
  attendanceRate: number;
  completionRate: number;
  averageScore: number;
  timeSpent: number;
  assignmentCompletion: number;
  quizScores: number;
  skills: SkillProgress[];
}

export interface SkillProgress {
  name: string;
  progress: number;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface WorkshopFormData {
  title: string;
  description: string;
  prerequisites: string;
  learningOutcomes: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  sessions: WorkshopSession[];
  resources: WorkshopResource[];
} 