import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from '../modules/resource/resource.entity';
import { Project } from '../modules/project/project.entity';
import { IntegrationType } from '../modules/resource/resource.entity';
import { GithubService } from './github.service';
import { GitlabService } from './gitlab.service';
import { NotificationService } from './notification.service';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepo: Repository<Resource>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly githubService: GithubService,
    private readonly gitlabService: GitlabService,
    private readonly notificationService: NotificationService
  ) {}

  async syncProjectResources(projectId: string): Promise<void> {
    try {
      const project = await this.projectRepo.findOne({
        where: { id: projectId },
        relations: ['resources']
      });

      if (!project) {
        throw new Error('Project not found');
      }

      const resources = await this.resourceRepo.find({
        where: { project: { id: projectId } }
      });

      for (const resource of resources) {
        if (resource.integration?.type) {
          await this.syncResource(resource);
        }
      }

      await this.notificationService.notifyTeam(
        projectId,
        'Resources synchronized successfully'
      );
    } catch (error) {
      this.logger.error(`Failed to sync resources for project ${projectId}:`, error);
      throw error;
    }
  }

  private async syncResource(resource: Resource): Promise<void> {
    try {
      switch (resource.integration.type) {
        case IntegrationType.GITHUB:
          await this.syncGithubResource(resource);
          break;
        case IntegrationType.GITLAB:
          await this.syncGitlabResource(resource);
          break;
        case IntegrationType.BITBUCKET:
          await this.syncBitbucketResource(resource);
          break;
        default:
          this.logger.warn(`Unsupported integration type: ${resource.integration.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to sync resource ${resource.id}:`, error);
      throw error;
    }
  }

  private async syncGithubResource(resource: Resource): Promise<void> {
    const { url, branch, repository } = resource.integration;
    
    if (!url || !repository) {
      throw new Error('Missing required GitHub integration parameters');
    }

    const repoData = await this.githubService.getRepository(repository);
    const commits = await this.githubService.getCommits(repository, branch);

    if (commits.length > 0) {
      const latestCommit = commits[0];
      resource.metadata = {
        ...resource.metadata,
        version: latestCommit.sha,
        lastUpdated: new Date(latestCommit.date),
        source: repoData.html_url
      };

      resource.versionHistory = [
        ...(resource.versionHistory || []),
        {
          version: latestCommit.sha,
          changes: commits.slice(0, 5).map(commit => commit.message),
          updatedAt: new Date(latestCommit.date),
          updatedBy: latestCommit.author?.name || 'Unknown'
        }
      ];

      await this.resourceRepo.save(resource);
    }
  }

  private async syncGitlabResource(resource: Resource): Promise<void> {
    const { url, branch, repository } = resource.integration;
    
    if (!url || !repository) {
      throw new Error('Missing required GitLab integration parameters');
    }

    const repoData = await this.gitlabService.getRepository(repository);
    const commits = await this.gitlabService.getCommits(repository, branch);

    if (commits.length > 0) {
      const latestCommit = commits[0];
      resource.metadata = {
        ...resource.metadata,
        version: latestCommit.id,
        lastUpdated: new Date(latestCommit.committed_date),
        source: repoData.web_url
      };

      resource.versionHistory = [
        ...(resource.versionHistory || []),
        {
          version: latestCommit.id,
          changes: commits.slice(0, 5).map(commit => commit.message),
          updatedAt: new Date(latestCommit.committed_date),
          updatedBy: latestCommit.author_name
        }
      ];

      await this.resourceRepo.save(resource);
    }
  }

  private async syncBitbucketResource(resource: Resource): Promise<void> {
    // Implement Bitbucket integration similar to GitHub/GitLab
    // This is a placeholder for future implementation
    this.logger.warn('Bitbucket integration not yet implemented');
  }

  async validateIntegration(integration: {
    type: IntegrationType;
    url: string;
    apiKey?: string;
  }): Promise<boolean> {
    try {
      switch (integration.type) {
        case IntegrationType.GITHUB:
          return await this.githubService.validateConnection(integration.apiKey);
        case IntegrationType.GITLAB:
          return await this.gitlabService.validateConnection(integration.apiKey);
        default:
          return false;
      }
    } catch (error) {
      this.logger.error('Integration validation failed:', error);
      return false;
    }
  }
} 