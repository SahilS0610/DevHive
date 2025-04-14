export interface User {
  id: string;
  universityId: string;
  personalEmail: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  popularity: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'achievement' | 'skill' | 'contribution' | 'special';
} 