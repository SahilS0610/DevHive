import { DataSource } from 'typeorm';
import { ProjectSubmission, ValidationReview, ProjectValidationStatus } from '../types/validation.types';
import { AppDataSource } from '../config/database';

export class ValidationRepository {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = AppDataSource;
  }

  async saveSubmission(submission: ProjectSubmission): Promise<void> {
    await this.dataSource.getRepository(ProjectSubmission).save(submission);
  }

  async getSubmission(submissionId: string): Promise<ProjectSubmission> {
    const submission = await this.dataSource
      .getRepository(ProjectSubmission)
      .findOne({ where: { projectId: submissionId } });

    if (!submission) {
      throw new Error(`Submission not found: ${submissionId}`);
    }

    return submission;
  }

  async updateSubmissionStatus(
    submissionId: string,
    status: ProjectValidationStatus
  ): Promise<void> {
    await this.dataSource
      .getRepository(ProjectSubmission)
      .update({ projectId: submissionId }, { validationStatus: status });
  }

  async saveReview(review: ValidationReview): Promise<void> {
    await this.dataSource.getRepository(ValidationReview).save(review);
  }

  async getRecentReviews(limit: number): Promise<ValidationReview[]> {
    return this.dataSource
      .getRepository(ValidationReview)
      .find({
        order: { reviewedAt: 'DESC' },
        take: limit
      });
  }

  async getAllSubmissions(): Promise<ProjectSubmission[]> {
    return this.dataSource.getRepository(ProjectSubmission).find();
  }

  async getAllReviews(): Promise<ValidationReview[]> {
    return this.dataSource.getRepository(ValidationReview).find();
  }

  async getPendingSubmissions(): Promise<ProjectSubmission[]> {
    return this.dataSource
      .getRepository(ProjectSubmission)
      .find({
        where: { validationStatus: ProjectValidationStatus.PENDING },
        order: { submittedAt: 'ASC' }
      });
  }
} 