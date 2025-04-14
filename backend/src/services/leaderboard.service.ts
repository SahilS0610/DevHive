import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { UserSkill } from '../entities/UserSkill';
import { Achievement } from '../entities/Achievement';

export type LeaderboardTimeframe = 'weekly' | 'monthly' | 'allTime';
export type LeaderboardType = 'overall' | 'skill' | 'projects' | 'achievements';

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  metrics: {
    projectsCompleted: number;
    skillsMastered: number;
    achievementsUnlocked: number;
    averageProjectRating: number;
  };
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(UserSkill)
    private userSkillRepository: Repository<UserSkill>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
  ) {}

  async getLeaderboards(options: {
    type: LeaderboardType;
    timeframe: LeaderboardTimeframe;
    skillId?: string;
    limit?: number;
  }): Promise<LeaderboardEntry[]> {
    const { type, timeframe, skillId, limit = 10 } = options;

    switch (type) {
      case 'overall':
        return this.getOverallLeaderboard(timeframe, limit);
      case 'skill':
        return this.getSkillLeaderboard(skillId!, timeframe, limit);
      case 'projects':
        return this.getProjectLeaderboard(timeframe, limit);
      case 'achievements':
        return this.getAchievementLeaderboard(timeframe, limit);
    }
  }

  private async getOverallLeaderboard(
    timeframe: LeaderboardTimeframe,
    limit: number,
  ): Promise<LeaderboardEntry[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.projects', 'project')
      .leftJoinAndSelect('user.skills', 'userSkill')
      .leftJoinAndSelect('user.achievements', 'achievement')
      .where(this.getTimeframeCondition(timeframe))
      .getMany();

    const entries = await Promise.all(
      users.map(async (user) => {
        const score = await this.calculateUserScore(user.id);
        const metrics = await this.calculateUserMetrics(user.id);
        
        return {
          userId: user.id,
          name: user.name,
          avatar: user.avatar,
          score,
          rank: 0, // Will be set after sorting
          metrics,
        };
      }),
    );

    return this.sortAndRankEntries(entries, limit);
  }

  private async getSkillLeaderboard(
    skillId: string,
    timeframe: LeaderboardTimeframe,
    limit: number,
  ): Promise<LeaderboardEntry[]> {
    const userSkills = await this.userSkillRepository
      .createQueryBuilder('userSkill')
      .leftJoinAndSelect('userSkill.user', 'user')
      .where('userSkill.skillId = :skillId', { skillId })
      .andWhere(this.getTimeframeCondition(timeframe))
      .orderBy('userSkill.level', 'DESC')
      .limit(limit)
      .getMany();

    return userSkills.map((userSkill, index) => ({
      userId: userSkill.user.id,
      name: userSkill.user.name,
      avatar: userSkill.user.avatar,
      score: userSkill.level,
      rank: index + 1,
      metrics: {
        projectsCompleted: 0,
        skillsMastered: 0,
        achievementsUnlocked: 0,
        averageProjectRating: 0,
      },
    }));
  }

  private async getProjectLeaderboard(
    timeframe: LeaderboardTimeframe,
    limit: number,
  ): Promise<LeaderboardEntry[]> {
    const projects = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.members', 'member')
      .where(this.getTimeframeCondition(timeframe))
      .getMany();

    const userProjectCounts = new Map<string, number>();
    const userProjectRatings = new Map<string, number[]>();

    projects.forEach((project) => {
      project.members.forEach((member) => {
        const count = userProjectCounts.get(member.id) || 0;
        userProjectCounts.set(member.id, count + 1);

        const ratings = userProjectRatings.get(member.id) || [];
        ratings.push(project.rating);
        userProjectRatings.set(member.id, ratings);
      });
    });

    const entries = await Promise.all(
      Array.from(userProjectCounts.entries()).map(async ([userId, count]) => {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const ratings = userProjectRatings.get(userId) || [];
        const averageRating = ratings.length
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

        return {
          userId,
          name: user.name,
          avatar: user.avatar,
          score: count * averageRating,
          rank: 0,
          metrics: {
            projectsCompleted: count,
            skillsMastered: 0,
            achievementsUnlocked: 0,
            averageProjectRating: averageRating,
          },
        };
      }),
    );

    return this.sortAndRankEntries(entries, limit);
  }

  private async getAchievementLeaderboard(
    timeframe: LeaderboardTimeframe,
    limit: number,
  ): Promise<LeaderboardEntry[]> {
    const achievements = await this.achievementRepository
      .createQueryBuilder('achievement')
      .leftJoinAndSelect('achievement.users', 'user')
      .where(this.getTimeframeCondition(timeframe))
      .getMany();

    const userAchievementCounts = new Map<string, number>();

    achievements.forEach((achievement) => {
      achievement.users.forEach((user) => {
        const count = userAchievementCounts.get(user.id) || 0;
        userAchievementCounts.set(user.id, count + 1);
      });
    });

    const entries = await Promise.all(
      Array.from(userAchievementCounts.entries()).map(async ([userId, count]) => {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        return {
          userId,
          name: user.name,
          avatar: user.avatar,
          score: count,
          rank: 0,
          metrics: {
            projectsCompleted: 0,
            skillsMastered: 0,
            achievementsUnlocked: count,
            averageProjectRating: 0,
          },
        };
      }),
    );

    return this.sortAndRankEntries(entries, limit);
  }

  private async calculateUserScore(userId: string): Promise<number> {
    const [projects, skills, achievements] = await Promise.all([
      this.projectRepository.find({ where: { members: { id: userId } } }),
      this.userSkillRepository.find({ where: { user: { id: userId } } }),
      this.achievementRepository.find({ where: { users: { id: userId } } }),
    ]);

    const projectScore = projects.reduce((total, project) => {
      return total + (project.complexity * project.rating);
    }, 0);

    const skillScore = skills.reduce((total, skill) => {
      return total + (skill.level * 100);
    }, 0);

    const achievementScore = achievements.length * 500;

    return Math.round(projectScore + skillScore + achievementScore);
  }

  private async calculateUserMetrics(userId: string) {
    const [projects, skills, achievements] = await Promise.all([
      this.projectRepository.find({ where: { members: { id: userId } } }),
      this.userSkillRepository.find({ where: { user: { id: userId } } }),
      this.achievementRepository.find({ where: { users: { id: userId } } }),
    ]);

    const averageProjectRating = projects.length
      ? projects.reduce((total, project) => total + project.rating, 0) / projects.length
      : 0;

    return {
      projectsCompleted: projects.length,
      skillsMastered: skills.filter(skill => skill.level >= 4).length,
      achievementsUnlocked: achievements.length,
      averageProjectRating,
    };
  }

  private getTimeframeCondition(timeframe: LeaderboardTimeframe): string {
    const now = new Date();
    switch (timeframe) {
      case 'weekly':
        return `createdAt >= '${new Date(now.setDate(now.getDate() - 7)).toISOString()}'`;
      case 'monthly':
        return `createdAt >= '${new Date(now.setMonth(now.getMonth() - 1)).toISOString()}'`;
      default:
        return '1=1';
    }
  }

  private sortAndRankEntries(
    entries: LeaderboardEntry[],
    limit: number,
  ): LeaderboardEntry[] {
    return entries
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }
} 