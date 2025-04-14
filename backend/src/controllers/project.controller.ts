import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import { 
  CreateProjectDTO, 
  UpdateProjectDTO, 
  ProjectFilters,
  ProjectStatus,
  ProjectMemberDTO,
  ProjectMilestoneDTO
} from '../types/project.types';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  async createProject(req: Request, res: Response) {
    try {
      const dto: CreateProjectDTO = req.body;
      const project = await this.projectService.createProject(dto, req.user!.id);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create project' });
      }
    }
  }

  async updateProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dto: UpdateProjectDTO = req.body;
      const project = await this.projectService.updateProject(id, dto);
      res.json(project);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update project' });
      }
    }
  }

  async getProjects(req: Request, res: Response) {
    try {
      const filters: ProjectFilters = {
        status: req.query.status as ProjectStatus,
        skills: req.query.skills as string[],
        search: req.query.search as string,
        leaderId: req.query.leaderId as string,
        memberId: req.query.memberId as string
      };

      const projects = await this.projectService.findProjects(filters);
      res.json(projects);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch projects' });
      }
    }
  }

  async getProjectById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(id);
      res.json(project);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch project' });
      }
    }
  }

  async addMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const memberDto: ProjectMemberDTO = req.body;
      const project = await this.projectService.addMember(id, memberDto);
      res.json(project);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to add member' });
      }
    }
  }

  async removeMember(req: Request, res: Response) {
    try {
      const { id, userId } = req.params;
      const project = await this.projectService.removeMember(id, userId);
      res.json(project);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to remove member' });
      }
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const project = await this.projectService.updateStatus(id, status);
      res.json(project);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update status' });
      }
    }
  }

  async addMilestone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const milestone: ProjectMilestoneDTO = req.body;
      const project = await this.projectService.addMilestone(id, milestone);
      res.json(project);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to add milestone' });
      }
    }
  }

  async updateMilestone(req: Request, res: Response) {
    try {
      const { id, milestoneIndex } = req.params;
      const milestone: ProjectMilestoneDTO = req.body;
      const project = await this.projectService.updateMilestone(
        id,
        parseInt(milestoneIndex),
        milestone
      );
      res.json(project);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update milestone' });
      }
    }
  }

  async deleteProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.projectService.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete project' });
      }
    }
  }
} 