import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { Project } from './Project';
import { Skill } from './Skill';

@Entity('project_skills')
export class ProjectSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['required', 'preferred', 'optional'],
    default: 'required'
  })
  requirement: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Project, project => project.skills)
  project: Project;

  @ManyToOne(() => Skill, skill => skill.projects)
  skill: Skill;

  // Validation hooks
  @BeforeInsert()
  @BeforeUpdate()
  validateRequirement() {
    if (!['required', 'preferred', 'optional'].includes(this.requirement)) {
      throw new Error('Invalid skill requirement level');
    }
  }
} 