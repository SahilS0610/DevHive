export enum AchievementTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum'
}

export enum AchievementCategory {
  PROJECTS = 'projects',
  SKILLS = 'skills',
  COLLABORATION = 'collaboration',
  INNOVATION = 'innovation'
}

export enum RequirementType {
  PROJECTS_COMPLETED = 'projects_completed',
  SKILLS_MASTERED = 'skills_mastered',
  COLLABORATIONS = 'collaborations'
}

export interface AchievementRequirement {
  type: RequirementType;
  target: number;
  level?: number; // Optional level requirement for skills
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: AchievementTier;
  category: AchievementCategory;
  xpReward: number;
  requirements: AchievementRequirement[];
}

export interface AchievementProgress {
  userId: string;
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  currentTier: number;
} 