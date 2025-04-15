import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { Achievement } from '../entities/Achievement';
import { Badge } from '../entities/Badge';

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>
  ) {}

  async awardXP(userId: string, amount: number, reason: string): Promise<User> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId }
    });

    user.xp += amount;
    user.level = this.calculateLevel(user.xp);

    // Check for new achievements
    await this.checkAchievements(user);

    return this.userRepository.save(user);
  }

  async awardBadge(userId: string, badgeId: string): Promise<void> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      relations: ['badges']
    });

    const badge = await this.badgeRepository.findOneOrFail({
      where: { id: badgeId }
    });

    if (!user.badges.some(b => b.id === badge.id)) {
      user.badges.push(badge);
      await this.userRepository.save(user);
    }
  }

  private calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100));
  }

  private async checkAchievements(user: User): Promise<void> {
    const achievements = await this.achievementRepository.find();
    
    for (const achievement of achievements) {
      if (this.meetsRequirements(user, achievement) && 
          !user.achievements.some(a => a.id === achievement.id)) {
        user.achievements.push(achievement);
        await this.awardXP(user.id, achievement.xpReward, `Achievement: ${achievement.name}`);
      }
    }
  }

  private meetsRequirements(user: User, achievement: Achievement): boolean {
    switch (achievement.type) {
      case 'XP_MILESTONE':
        return user.xp >= achievement.requirement.xp;
      case 'PROJECTS_COMPLETED':
        return user.completedProjects >= achievement.requirement.count;
      case 'WORKSHOPS_ATTENDED':
        return user.attendedWorkshops >= achievement.requirement.count;
      default:
        return false;
    }
  }
} 