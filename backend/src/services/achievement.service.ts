import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement, AchievementProgress } from '../types/achievement.types';
import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { UserSkill } from '../entities/UserSkill';

@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(UserSkill)
    private userSkillRepository: Repository<UserSkill>,
  ) {}

  async getAchievements(): Promise<Achievement[]> {
    // In a real implementation, this would fetch from a database
    return [
      {
        id: 'project-master',
        title: 'Project Master',
        description: 'Complete 5 projects',
        icon: '🏆',
        tier: 'gold',
        category: 'projects',
        xpReward: 1000,
        requirements: [
          { type: 'projects_completed', target: 5 }
        ]
      },
      {
        id: 'skill-expert',
        title: 'Skill Expert',
        description: 'Master 3 skills to level 5',
        icon: '🎯',
        tier: 'silver',
        category: 'skills',
        xpReward: 750,
        requirements: [
          { type: 'skills_mastered', target: 3, level: 5 }
        ]
      },
      {
        id: 'team-player',
        title: 'Team Player',
        description: 'Collaborate on 10 projects',
        icon: '🤝',
        tier: 'bronze',
        category: 'collaboration',
        xpReward: 500,
        requirements: [
          { type: 'collaborations', target: 10 }
        ]
      }
    ];
  }

  async getUserAchievements(userId: string): Promise<AchievementProgress[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['projects', 'skills']
    });

    if (!user) {
      throw new Error('User not found');
    }

    const achievements = await this.getAchievements();
    const progress: AchievementProgress[] = [];

    for (const achievement of achievements) {
      const currentProgress = await this.calculateProgress(user, achievement);
      progress.push(currentProgress);
    }

    return progress;
  }

  private async calculateProgress(user: User, achievement: Achievement): Promise<AchievementProgress> {
    let progress = 0;
    let completed = false;
    let currentTier = 0;

    for (const requirement of achievement.requirements) {
      switch (requirement.type) {
        case 'projects_completed':
          progress = user.projects.length;
          completed = progress >= requirement.target;
          currentTier = Math.floor(progress / requirement.target);
          break;
        case 'skills_mastered':
          const masteredSkills = user.skills.filter(skill => skill.level >= requirement.level);
          progress = masteredSkills.length;
          completed = progress >= requirement.target;
          currentTier = Math.floor(progress / requirement.target);
          break;
        case 'collaborations':
          progress = user.projects.length;
          completed = progress >= requirement.target;
          currentTier = Math.floor(progress / requirement.target);
          break;
      }
    }

    return {
      userId: user.id,
      achievementId: achievement.id,
      progress,
      completed,
      currentTier,
      completedAt: completed ? new Date() : undefined
    };
  }

  async checkAchievementUnlocks(userId: string): Promise<Achievement[]> {
    const progress = await this.getUserAchievements(userId);
    const newlyUnlocked = progress
      .filter(p => p.completed && !p.completedAt)
      .map(p => this.getAchievementById(p.achievementId));

    return Promise.all(newlyUnlocked);
  }

  private async getAchievementById(id: string): Promise<Achievement> {
    const achievements = await this.getAchievements();
    const achievement = achievements.find(a => a.id === id);
    if (!achievement) {
      throw new Error('Achievement not found');
    }
    return achievement;
  }
} 