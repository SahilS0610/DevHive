export enum ProjectValidationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVISION = 'NEEDS_REVISION'
}

export enum ValidationCriteriaType {
  REQUIRED = 'required',
  BONUS = 'bonus'
}

export interface ValidationCriteria {
  id: string;
  title: string;
  description: string;
  type: ValidationCriteriaType;
  points: number;
  category: 'code_quality' | 'documentation' | 'testing' | 'deployment' | 'innovation';
}

export interface ProjectSubmission {
  projectId: string;
  repositoryUrl: string;
  submittedAt: Date;
  submittedBy: string;
  validationStatus: ProjectValidationStatus;
  teamContributions: {
    userId: string;
    contribution: string;
  }[];
}

export interface ValidationResult {
  criteriaId: string;
  passed: boolean;
  comment?: string;
  validatedBy: string;
  validatedAt: Date;
}

export interface ValidationReview {
  id: string;
  projectId: string;
  reviewerId: string;
  reviewedAt: Date;
  status: ProjectValidationStatus;
  comments: string;
  feedback: {
    category: string;
    comment: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
}

export interface ValidationMetrics {
  totalSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  averageReviewTime: number;
  pendingSubmissions: number;
  submissionsByStatus: Record<ProjectValidationStatus, number>;
}

export interface ValidationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: {
    criteriaType: ValidationCriteriaType;
    count: number;
  }[];
  xpReward: number;
} 