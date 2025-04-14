export enum ProjectStatus {
  PLANNING = 'planning',
  RECRUITING = 'recruiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum ProjectRole {
  LEADER = 'leader',
  MEMBER = 'member',
  PENDING = 'pending'
}

export interface CreateProjectDTO {
  title: string;
  description: string;
  requiredSkills: string[];
  maxMembers: number;
  timeline: {
    startDate: Date;
    endDate: Date;
  };
  milestones: {
    title: string;
    description: string;
    dueDate: Date;
  }[];
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string;
  requiredSkills?: string[];
  maxMembers?: number;
  status?: ProjectStatus;
  timeline?: {
    startDate: Date;
    endDate: Date;
  };
  milestones?: {
    title: string;
    description: string;
    dueDate: Date;
    completed?: boolean;
  }[];
}

export interface ProjectFilters {
  status?: ProjectStatus;
  skills?: string[];
  search?: string;
  leaderId?: string;
  memberId?: string;
}

export interface ProjectMemberDTO {
  userId: string;
  role: ProjectRole;
}

export interface ProjectMilestoneDTO {
  title: string;
  description: string;
  dueDate: Date;
  completed?: boolean;
} 