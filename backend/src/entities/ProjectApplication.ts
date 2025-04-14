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
import { User } from './User';
import { Project } from './Project';

@Entity('project_applications')
export class ProjectApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.applications)
  user: User;

  @ManyToOne(() => Project, project => project.applications)
  project: Project;

  // Validation hooks
  @BeforeInsert()
  @BeforeUpdate()
  validateMessage() {
    if (!this.message || this.message.length < 10) {
      throw new Error('Application message must be at least 10 characters long');
    }
  }
} 