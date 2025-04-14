import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { Skill, MatchScore, ProjectMatch, UserMatch } from '../types/matching.types';
import { getRepository } from 'typeorm';
import { ProjectStatus } from '../types/project.types';

export class MatchingService {
  private readonly levelWeights = {
    BEGINNER: 0.3,
    INTERMEDIATE: 0.6,
    ADVANCED: 0.8,
    EXPERT: 1.0
  };

  private readonly experienceWeights = {
    min: 0.5,
    max: 1.0
  };

  private calculateLevelScore(userLevel: Skill['level'], projectLevel: Skill['level']): number {
    const userWeight = this.levelWeights[userLevel];
    const projectWeight = this.levelWeights[projectLevel];
    return userWeight >= projectWeight ? 1.0 : userWeight / projectWeight;
  }

  private calculateExperienceScore(userExperience: number, projectExperience: number): number {
    if (userExperience >= projectExperience) {
      return this.experienceWeights.max;
    }
    return this.experienceWeights.min + 
      ((userExperience / projectExperience) * (this.experienceWeights.max - this.experienceWeights.min));
  }

  private findSimilarSkills(userSkills: Skill[], projectSkills: Skill[]): Array<{
    userSkill: Skill;
    projectSkill: Skill;
    similarity: number;
  }> {
    const similarSkills: Array<{
      userSkill: Skill;
      projectSkill: Skill;
      similarity: number;
    }> = [];

    for (const userSkill of userSkills) {
      for (const projectSkill of projectSkills) {
        if (this.areSkillsSimilar(userSkill.name, projectSkill.name)) {
          const similarity = this.calculateSkillSimilarity(userSkill.name, projectSkill.name);
          similarSkills.push({
            userSkill,
            projectSkill,
            similarity
          });
        }
      }
    }

    return similarSkills;
  }

  private areSkillsSimilar(skill1: string, skill2: string): boolean {
    // Implement skill similarity logic (e.g., using Levenshtein distance or predefined mappings)
    const normalized1 = skill1.toLowerCase().replace(/\s+/g, '');
    const normalized2 = skill2.toLowerCase().replace(/\s+/g, '');
    return normalized1.includes(normalized2) || normalized2.includes(normalized1);
  }

  private calculateSkillSimilarity(skill1: string, skill2: string): number {
    // Implement similarity calculation (e.g., using string similarity algorithms)
    const normalized1 = skill1.toLowerCase().replace(/\s+/g, '');
    const normalized2 = skill2.toLowerCase().replace(/\s+/g, '');
    const maxLength = Math.max(normalized1.length, normalized2.length);
    const commonChars = [...normalized1].filter(char => normalized2.includes(char)).length;
    return commonChars / maxLength;
  }

  private calculateSkillMatch(
    userSkills: Skill[],
    projectSkills: Skill[]
  ): MatchScore {
    const matchedSkills: MatchScore['matchedSkills'] = [];
    const missingSkills: string[] = [];
    const partialMatches: MatchScore['partialMatches'] = [];

    // Find exact matches
    for (const projectSkill of projectSkills) {
      const userSkill = userSkills.find(s => s.name === projectSkill.name);
      if (userSkill) {
        const levelScore = this.calculateLevelScore(userSkill.level, projectSkill.level);
        const experienceScore = this.calculateExperienceScore(
          userSkill.yearsOfExperience,
          projectSkill.yearsOfExperience
        );
        const experienceMatch = (levelScore + experienceScore) / 2;

        matchedSkills.push({
          name: userSkill.name,
          userLevel: userSkill.level,
          projectLevel: projectSkill.level,
          experienceMatch
        });
      } else {
        missingSkills.push(projectSkill.name);
      }
    }

    // Find partial matches
    const similarSkills = this.findSimilarSkills(userSkills, projectSkills);
    for (const { userSkill, projectSkill, similarity } of similarSkills) {
      if (similarity >= 0.7) { // Threshold for considering as partial match
        partialMatches.push({
          name: userSkill.name,
          userLevel: userSkill.level,
          projectLevel: projectSkill.level,
          similarity
        });
      }
    }

    // Calculate overall score
    const exactMatchScore = matchedSkills.reduce((sum, match) => sum + match.experienceMatch, 0);
    const partialMatchScore = partialMatches.reduce((sum, match) => sum + match.similarity, 0);
    const totalScore = (exactMatchScore + (partialMatchScore * 0.5)) / projectSkills.length * 100;

    return {
      score: Math.min(100, totalScore),
      matchedSkills,
      missingSkills,
      partialMatches
    };
  }

  async findMatchingProjects(
    user: User,
    minMatchScore: number = 60
  ): Promise<ProjectMatch[]> {
    const projectRepository = getRepository(Project);
    const projects = await projectRepository.find({
      where: { status: ProjectStatus.OPEN },
      relations: ['requiredSkills']
    });

    const matches = projects.map(project => ({
      project,
      matchScore: this.calculateSkillMatch(
        user.skills.map(skill => ({
          name: skill.skill.name,
          level: skill.level,
          yearsOfExperience: skill.yearsOfExperience
        })),
        project.requiredSkills.map(skill => ({
          name: skill.name,
          level: skill.level,
          yearsOfExperience: skill.yearsOfExperience
        }))
      )
    }));

    return matches
      .filter(match => match.matchScore.score >= minMatchScore)
      .sort((a: ProjectMatch, b: ProjectMatch) => b.matchScore.score - a.matchScore.score);
  }

  async findMatchingCandidates(
    project: Project,
    minMatchScore: number = 60
  ): Promise<UserMatch[]> {
    const userRepository = getRepository(User);
    const users = await userRepository.find({
      relations: ['skills', 'skills.skill']
    });

    const matches = users.map(user => ({
      user,
      matchScore: this.calculateSkillMatch(
        user.skills.map(skill => ({
          name: skill.skill.name,
          level: skill.level,
          yearsOfExperience: skill.yearsOfExperience
        })),
        project.requiredSkills.map(skill => ({
          name: skill.name,
          level: skill.level,
          yearsOfExperience: skill.yearsOfExperience
        }))
      )
    }));

    return matches
      .filter(match => match.matchScore.score >= minMatchScore)
      .sort((a: UserMatch, b: UserMatch) => b.matchScore.score - a.matchScore.score);
  }
} 