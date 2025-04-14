import { AppDataSource } from '../config/database';
import { Project } from '../entities/Project';
import { User } from '../entities/User';
import { 
  CreateProjectDTO, 
  UpdateProjectDTO, 
  ProjectFilters, 
  ProjectStatus,
  ProjectRole,
  ProjectMemberDTO,
  ProjectMilestoneDTO
} from '../types/project.types';

export class ProjectService {
  private projectRepository = AppDataSource.getRepository(Project);
  private userRepository = AppDataSource.getRepository(User);

  async createProject(dto: CreateProjectDTO, leaderId: string): Promise<Project> {
    const leader = await this.userRepository.findOneOrFail({
      where: { id: leaderId }
    });

    const project = this.projectRepository.create({
      ...dto,
      leader,
      status: ProjectStatus.PLANNING,
      currentMembers: 1,
      members: [leader]
    });

    return this.projectRepository.save(project);
  }

  async updateProject(id: string, dto: UpdateProjectDTO): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({
      where: { id }
    });

    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  async findProjects(filters: ProjectFilters): Promise<Project[]> {
    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.leader', 'leader')
      .leftJoinAndSelect('project.members', 'members')
      .leftJoinAndSelect('project.skills', 'skills');

    if (filters.status) {
      queryBuilder.andWhere('project.status = :status', { 
        status: filters.status 
      });
    }

    if (filters.skills?.length) {
      queryBuilder.andWhere('project.requiredSkills && :skills', { 
        skills: filters.skills 
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(project.title ILIKE :search OR project.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.leaderId) {
      queryBuilder.andWhere('project.leaderId = :leaderId', { 
        leaderId: filters.leaderId 
      });
    }

    if (filters.memberId) {
      queryBuilder.andWhere('members.id = :memberId', { 
        memberId: filters.memberId 
      });
    }

    return queryBuilder.getMany();
  }

  async getProjectById(id: string): Promise<Project> {
    return this.projectRepository.findOneOrFail({
      where: { id },
      relations: ['leader', 'members', 'skills', 'applications']
    });
  }

  async addMember(projectId: string, memberDto: ProjectMemberDTO): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({
      where: { id: projectId },
      relations: ['members']
    });

    if (project.currentMembers >= project.maxMembers) {
      throw new Error('Project has reached maximum member capacity');
    }

    const user = await this.userRepository.findOneOrFail({
      where: { id: memberDto.userId }
    });

    if (project.members.some(member => member.id === user.id)) {
      throw new Error('User is already a member of this project');
    }

    project.members.push(user);
    project.currentMembers += 1;

    return this.projectRepository.save(project);
  }

  async removeMember(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({
      where: { id: projectId },
      relations: ['members']
    });

    if (project.leader.id === userId) {
      throw new Error('Cannot remove project leader');
    }

    project.members = project.members.filter(member => member.id !== userId);
    project.currentMembers -= 1;

    return this.projectRepository.save(project);
  }

  async updateStatus(projectId: string, status: ProjectStatus): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({
      where: { id: projectId }
    });

    project.status = status;
    return this.projectRepository.save(project);
  }

  async addMilestone(projectId: string, milestone: ProjectMilestoneDTO): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({
      where: { id: projectId }
    });

    project.milestones.push({
      ...milestone,
      completed: false
    });

    return this.projectRepository.save(project);
  }

  async updateMilestone(
    projectId: string, 
    milestoneIndex: number, 
    milestone: ProjectMilestoneDTO
  ): Promise<Project> {
    const project = await this.projectRepository.findOneOrFail({
      where: { id: projectId }
    });

    if (milestoneIndex >= project.milestones.length) {
      throw new Error('Milestone index out of range');
    }

    project.milestones[milestoneIndex] = {
      ...project.milestones[milestoneIndex],
      ...milestone
    };

    return this.projectRepository.save(project);
  }

  async deleteProject(id: string): Promise<void> {
    await this.projectRepository.delete(id);
  }
} 