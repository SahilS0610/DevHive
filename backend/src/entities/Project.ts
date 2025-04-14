import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { User } from './User';
import { Skill } from './Skill';
import { ProjectSkill } from './ProjectSkill';
import { ProjectApplication } from './ProjectApplication';
import { ProjectStatus, ProjectRole } from '../types/project.types';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column('text', { array: true })
  requiredSkills!: string[];

  @Column()
  maxMembers!: number;

  @Column()
  currentMembers!: number;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING
  })
  status!: ProjectStatus;

  @Column('jsonb')
  timeline!: {
    startDate: Date;
    endDate: Date;
  };

  @Column('jsonb')
  milestones!: {
    title: string;
    description: string;
    dueDate: Date;
    completed: boolean;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => User, user => user.ledProjects)
  leader!: User;

  @ManyToMany(() => User, user => user.joinedProjects)
  @JoinTable({
    name: 'project_members',
    joinColumn: {
      name: 'projectId',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id'
    }
  })
  members!: User[];

  @OneToMany(() => ProjectSkill, projectSkill => projectSkill.project)
  skills!: ProjectSkill[];

  @OneToMany(() => ProjectApplication, application => application.project)
  applications!: ProjectApplication[];

  // Validation hooks
  @BeforeInsert()
  @BeforeUpdate()
  validateMaxMembers() {
    if (this.maxMembers < 1) {
      throw new Error('Project must have at least 1 member');
    }
  }
} 