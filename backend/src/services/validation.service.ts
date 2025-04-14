import { ProjectSubmission, ValidationCriteria, ValidationReview, ValidationMetrics, ValidationBadge, ProjectValidationStatus } from '../types/validation.types';
import { RewardService } from './reward.service';
import { NotificationService } from './notification.service';
import { ProjectService } from './project.service';
import { UserService } from './user.service';
import { ValidationRepository } from '../repositories/validation.repository';
import { ValidationCriteriaRepository } from '../repositories/validation-criteria.repository';
import { ValidationBadgeRepository } from '../repositories/validation-badge.repository';
import { ValidationMetricsRepository } from '../repositories/validation-metrics.repository';

export class ValidationService {
  private rewardService: RewardService;
  private notificationService: NotificationService;
  private projectService: ProjectService;
  private userService: UserService;
  private validationRepository: ValidationRepository;
  private criteriaRepository: ValidationCriteriaRepository;
  private badgeRepository: ValidationBadgeRepository;
  private metricsRepository: ValidationMetricsRepository;

  constructor() {
    this.rewardService = new RewardService();
    this.notificationService = new NotificationService();
    this.projectService = new ProjectService();
    this.userService = new UserService();
    this.validationRepository = new ValidationRepository();
    this.criteriaRepository = new ValidationCriteriaRepository();
    this.badgeRepository = new ValidationBadgeRepository();
    this.metricsRepository = new ValidationMetricsRepository();
  }

  async submitProject(submission: Omit<ProjectSubmission, 'validationStatus' | 'submittedAt'>): Promise<ProjectSubmission> {
    // Validate repository URL and branch
    await this.validateRepository(submission.repositoryUrl, submission.branchName);

    // Verify team contributions total 100%
    this.validateTeamContributions(submission.teamContributions);

    const newSubmission: ProjectSubmission = {
      ...submission,
      validationStatus: ProjectValidationStatus.PENDING,
      submittedAt: new Date()
    };

    // Save submission
    await this.validationRepository.saveSubmission(newSubmission);

    // Notify moderators
    await this.notificationService.notifyModerators('new_submission', {
      submissionId: newSubmission.projectId,
      projectName: (await this.projectService.getProject(submission.projectId)).name
    });

    // Update metrics
    await this.updateMetrics();

    return newSubmission;
  }

  async validateProject(
    submissionId: string,
    moderatorId: string,
    validation: {
      status: ProjectValidationStatus;
      notes?: string;
      criteriaResults: Array<{
        criteriaId: string;
        passed: boolean;
        comment?: string;
      }>;
    }
  ): Promise<ValidationReview> {
    const submission = await this.validationRepository.getSubmission(submissionId);
    const review: ValidationReview = {
      submissionId,
      moderatorId,
      status: validation.status,
      notes: validation.notes,
      criteriaResults: validation.criteriaResults.map(result => ({
        ...result,
        validatedBy: moderatorId,
        validatedAt: new Date()
      })),
      reviewedAt: new Date()
    };

    // Save review
    await this.validationRepository.saveReview(review);

    // Update submission status
    await this.validationRepository.updateSubmissionStatus(submissionId, validation.status);

    if (validation.status === ProjectValidationStatus.APPROVED) {
      // Calculate and distribute rewards
      await this.distributeRewards(submission, review);
      
      // Update team member profiles
      await this.updateTeamAchievements(submission, review);
      
      // Send congratulatory notifications
      await this.sendTeamNotifications(submission);
    } else if (validation.status === ProjectValidationStatus.NEEDS_REVISION) {
      // Notify team about required revisions
      await this.notifyTeamAboutRevisions(submission, validation.notes);
    }

    // Update metrics
    await this.updateMetrics();

    return review;
  }

  private async validateRepository(repositoryUrl: string, branchName: string): Promise<void> {
    // Implement repository validation logic
    // Check if repository exists, is accessible, and branch exists
    // This could involve using GitHub API or other version control system APIs
  }

  private validateTeamContributions(contributions: ProjectSubmission['teamContributions']): void {
    const totalPercentage = contributions.reduce(
      (sum, contribution) => sum + contribution.contributionPercentage,
      0
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error('Team contributions must total 100%');
    }
  }

  private async distributeRewards(submission: ProjectSubmission, review: ValidationReview): Promise<void> {
    const baseXP = 100; // Base XP for project completion
    
    // Calculate bonus XP based on validation criteria
    const bonusXP = await this.calculateBonusXP(review);

    // Get all applicable badges
    const badges = await this.determineBadges(submission, review);

    // Distribute rewards to team members based on contribution percentage
    for (const member of submission.teamContributions) {
      const memberXP = Math.round(
        (baseXP + bonusXP) * (member.contributionPercentage / 100)
      );

      // Award XP
      await this.rewardService.awardXP(member.userId, memberXP);

      // Award badges
      await this.rewardService.awardBadges(member.userId, badges);

      // Update leaderboard
      await this.rewardService.updateLeaderboard(member.userId, memberXP);
    }
  }

  private async calculateBonusXP(review: ValidationReview): Promise<number> {
    const criteria = await this.criteriaRepository.getAllCriteria();
    let bonusXP = 0;

    for (const result of review.criteriaResults) {
      if (result.passed) {
        const criterion = criteria.find(c => c.id === result.criteriaId);
        if (criterion && criterion.type === 'bonus') {
          bonusXP += criterion.points;
        }
      }
    }

    return bonusXP;
  }

  private async determineBadges(
    submission: ProjectSubmission,
    review: ValidationReview
  ): Promise<ValidationBadge[]> {
    const allBadges = await this.badgeRepository.getAllBadges();
    const earnedBadges: ValidationBadge[] = [];

    for (const badge of allBadges) {
      const meetsRequirements = badge.requirements.every(req => {
        const passedCriteria = review.criteriaResults.filter(
          result => result.passed && 
          criteria.find(c => c.id === result.criteriaId)?.type === req.criteriaType
        ).length;
        return passedCriteria >= req.count;
      });

      if (meetsRequirements) {
        earnedBadges.push(badge);
      }
    }

    return earnedBadges;
  }

  private async updateTeamAchievements(
    submission: ProjectSubmission,
    review: ValidationReview
  ): Promise<void> {
    for (const member of submission.teamContributions) {
      await this.userService.updateAchievements(member.userId, {
        projectId: submission.projectId,
        contribution: member.contribution,
        validationResults: review.criteriaResults
      });
    }
  }

  private async sendTeamNotifications(submission: ProjectSubmission): Promise<void> {
    for (const member of submission.teamContributions) {
      await this.notificationService.sendNotification(member.userId, 'project_approved', {
        projectId: submission.projectId,
        projectName: (await this.projectService.getProject(submission.projectId)).name
      });
    }
  }

  private async notifyTeamAboutRevisions(
    submission: ProjectSubmission,
    notes?: string
  ): Promise<void> {
    for (const member of submission.teamContributions) {
      await this.notificationService.sendNotification(member.userId, 'project_needs_revision', {
        projectId: submission.projectId,
        projectName: (await this.projectService.getProject(submission.projectId)).name,
        notes
      });
    }
  }

  private async updateMetrics(): Promise<void> {
    const metrics = await this.calculateMetrics();
    await this.metricsRepository.updateMetrics(metrics);
  }

  private async calculateMetrics(): Promise<ValidationMetrics> {
    const submissions = await this.validationRepository.getAllSubmissions();
    const reviews = await this.validationRepository.getAllReviews();
    const criteria = await this.criteriaRepository.getAllCriteria();

    const totalSubmissions = submissions.length;
    const approvedSubmissions = submissions.filter(
      s => s.validationStatus === ProjectValidationStatus.APPROVED
    ).length;

    const reviewTimes = reviews.map(review => {
      const submission = submissions.find(s => s.projectId === review.submissionId);
      return review.reviewedAt.getTime() - submission!.submittedAt.getTime();
    });

    const averageReviewTime = reviewTimes.length > 0
      ? reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length
      : 0;

    const rejectionRate = totalSubmissions > 0
      ? submissions.filter(s => s.validationStatus === ProjectValidationStatus.REJECTED).length / totalSubmissions
      : 0;

    const criteriaPassRate: Record<string, number> = {};
    for (const criterion of criteria) {
      const totalChecks = reviews.reduce(
        (count, review) => count + review.criteriaResults.filter(r => r.criteriaId === criterion.id).length,
        0
      );
      const passedChecks = reviews.reduce(
        (count, review) => count + review.criteriaResults.filter(r => r.criteriaId === criterion.id && r.passed).length,
        0
      );
      criteriaPassRate[criterion.id] = totalChecks > 0 ? passedChecks / totalChecks : 0;
    }

    return {
      totalSubmissions,
      approvedSubmissions,
      averageReviewTime,
      rejectionRate,
      criteriaPassRate
    };
  }

  async getValidationDashboard(): Promise<{
    pendingSubmissions: ProjectSubmission[];
    metrics: ValidationMetrics;
    recentReviews: ValidationReview[];
  }> {
    const [pendingSubmissions, metrics, recentReviews] = await Promise.all([
      this.validationRepository.getPendingSubmissions(),
      this.metricsRepository.getMetrics(),
      this.validationRepository.getRecentReviews(10)
    ]);

    return {
      pendingSubmissions,
      metrics,
      recentReviews
    };
  }
} 