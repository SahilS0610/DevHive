export interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'on_hold';
  progress: number;
  members: number;
  deadline: Date;
  role: 'leader' | 'member';
}

export interface Deadline {
  id: string;
  title: string;
  date: Date;
  projectId: string;
  type: 'project' | 'workshop' | 'assignment';
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number;
  verified: boolean;
}

export interface TimelineItem {
  id: string;
  title: string;
  date: Date;
  description: string;
  type: 'project' | 'workshop' | 'assignment';
  status: 'upcoming' | 'completed' | 'overdue';
} 