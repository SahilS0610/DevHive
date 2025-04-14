import { Project } from '../entities/Project';
import { User } from '../entities/User';

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface Skill {
  name: string;
  level: SkillLevel;
  yearsOfExperience: number;
}

export interface MatchScore {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  skillLevels: {
    [skillName: string]: {
      required: SkillLevel;
      current: SkillLevel;
    };
  };
}

export interface ProjectMatch {
  project: Project;
  matchScore: MatchScore;
}

export interface UserMatch {
  user: User;
  matchScore: MatchScore;
} 