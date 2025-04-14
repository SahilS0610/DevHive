import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { Workshop } from '../entities/workshop.entity';
import { User } from '../entities/user.entity';
import { ProjectValidation } from '../entities/project-validation.entity';
import { Team } from '../entities/team.entity';
import { Skill } from '../entities/skill.entity';

interface ProjectMetrics {
  totalProjects: number;
  successRate: number;
  averageCompletionTime: number;
  skillDistribution: Record<string, number>;
  teamPerformance: TeamPerformanceMetrics;
}

interface TeamPerformanceMetrics {
  averageTeamSize: number;
  averageSkillDiversity: number;
  averageCompletionTime: number;
  successRate: number;
  topPerformingTeams: Array<{
    teamId: string;
    projectCount: number;
    successRate: number;
  }>;
}

interface SkillProgressMetrics {
  skillGrowthRate: number;
  topGrowingSkills: Array<{
    skillId: string;
    growthRate: number;
    userCount: number;
  }>;
  skillGaps: Array<{
    skillId: string;
    demand: number;
    supply: number;
  }>;
  workshopImpact: Array<{
    workshopId: string;
    skillImprovement: number;
    participantCount: number;
  }>;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(Workshop)
    private workshopRepo: Repository<Workshop>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(ProjectValidation)
    private validationRepo: Repository<ProjectValidation>,
    @InjectRepository(Team)
    private teamRepo: Repository<Team>,
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>
  ) {}

  async getProjectMetrics(timeframe: 'week' | 'month' | 'year'): Promise<ProjectMetrics> {
    const projects = await this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.team', 'team')
      .leftJoinAndSelect('project.validations', 'validations')
      .where('project.createdAt >= :start', {
        start: this.getTimeframeStart(timeframe)
      })
      .getMany();

    return {
      totalProjects: projects.length,
      successRate: this.calculateSuccessRate(projects),
      averageCompletionTime: this.calculateAvgCompletionTime(projects),
      skillDistribution: this.analyzeSkillDistribution(projects),
      teamPerformance: await this.analyzeTeamPerformance(projects)
    };
  }

  async getSkillProgressMetrics(): Promise<SkillProgressMetrics> {
    const users = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.skills', 'skills')
      .leftJoinAndSelect('user.projects', 'projects')
      .getMany();

    return {
      skillGrowthRate: this.calculateSkillGrowthRate(users),
      topGrowingSkills: this.identifyTopGrowingSkills(users),
      skillGaps: await this.analyzeSkillGaps(),
      workshopImpact: await this.analyzeWorkshopImpact()
    };
  }

  private calculateSuccessRate(projects: Project[]): number {
    const successfulProjects = projects.filter(
      p => p.validations.some(v => v.status === 'APPROVED')
    );
    return projects.length > 0 ? (successfulProjects.length / projects.length) * 100 : 0;
  }

  private calculateAvgCompletionTime(projects: Project[]): number {
    const completedProjects = projects.filter(p => p.completedAt);
    if (completedProjects.length === 0) return 0;
    
    const totalTime = completedProjects.reduce((sum, project) => {
      return sum + (project.completedAt.getTime() - project.createdAt.getTime());
    }, 0);
    
    return totalTime / completedProjects.length;
  }

  private analyzeSkillDistribution(projects: Project[]): Record<string, number> {
    const skillCount: Record<string, number> = {};
    
    projects.forEach(project => {
      project.requiredSkills.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });
    
    return skillCount;
  }

  private async analyzeTeamPerformance(projects: Project[]): Promise<TeamPerformanceMetrics> {
    const teamMetrics = await Promise.all(
      projects.map(async project => {
        const teamSize = project.team.length;
        const skillDiversity = this.calculateSkillDiversity(project.team);
        const completionTime = this.calculateCompletionTime(project);
        
        return {
          projectId: project.id,
          teamSize,
          skillDiversity,
          completionTime,
          success: project.validations.some(v => v.status === 'APPROVED')
        };
      })
    );

    return this.aggregateTeamMetrics(teamMetrics);
  }

  private calculateSkillDiversity(team: Team): number {
    const uniqueSkills = new Set();
    team.members.forEach(member => {
      member.skills.forEach(skill => uniqueSkills.add(skill.id));
    });
    return uniqueSkills.size;
  }

  private calculateSkillGrowthRate(users: User[]): number {
    const totalSkillGrowth = users.reduce((sum, user) => {
      return sum + user.skills.length;
    }, 0);
    
    return users.length > 0 ? totalSkillGrowth / users.length : 0;
  }

  private identifyTopGrowingSkills(users: User[]): Array<{
    skillId: string;
    growthRate: number;
    userCount: number;
  }> {
    const skillGrowth: Record<string, { count: number; users: number }> = {};
    
    users.forEach(user => {
      user.skills.forEach(skill => {
        if (!skillGrowth[skill.id]) {
          skillGrowth[skill.id] = { count: 0, users: 0 };
        }
        skillGrowth[skill.id].count++;
        skillGrowth[skill.id].users++;
      });
    });

    return Object.entries(skillGrowth)
      .map(([skillId, data]) => ({
        skillId,
        growthRate: data.count,
        userCount: data.users
      }))
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, 5);
  }

  private async analyzeSkillGaps(): Promise<Array<{
    skillId: string;
    demand: number;
    supply: number;
  }>> {
    const [projects, users] = await Promise.all([
      this.projectRepo.find(),
      this.userRepo.find({ relations: ['skills'] })
    ]);

    const skillDemand: Record<string, number> = {};
    const skillSupply: Record<string, number> = {};

    projects.forEach(project => {
      project.requiredSkills.forEach(skill => {
        skillDemand[skill] = (skillDemand[skill] || 0) + 1;
      });
    });

    users.forEach(user => {
      user.skills.forEach(skill => {
        skillSupply[skill.id] = (skillSupply[skill.id] || 0) + 1;
      });
    });

    return Object.keys(skillDemand).map(skillId => ({
      skillId,
      demand: skillDemand[skillId],
      supply: skillSupply[skillId] || 0
    }));
  }

  private async analyzeWorkshopImpact(): Promise<Array<{
    workshopId: string;
    skillImprovement: number;
    participantCount: number;
  }>> {
    const workshops = await this.workshopRepo.find({
      relations: ['participants', 'skills']
    });

    return workshops.map(workshop => ({
      workshopId: workshop.id,
      skillImprovement: this.calculateWorkshopImpact(workshop),
      participantCount: workshop.participants.length
    }));
  }

  private calculateWorkshopImpact(workshop: Workshop): number {
    // Implementation depends on how workshop impact is measured
    // This is a placeholder implementation
    return workshop.participants.length * 0.5;
  }

  private getTimeframeStart(timeframe: 'week' | 'month' | 'year'): Date {
    const now = new Date();
    switch (timeframe) {
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setMonth(now.getMonth() - 1));
    }
  }
} 