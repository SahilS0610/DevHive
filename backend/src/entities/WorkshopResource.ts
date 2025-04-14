import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm';
import { Workshop } from './Workshop';
import { User } from './User';

export enum ResourceType {
  DOCUMENT = 'document',
  VIDEO = 'video',
  LINK = 'link',
  EXERCISE = 'exercise',
  QUIZ = 'quiz'
}

@Entity('workshop_resources')
export class WorkshopResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workshop)
  @JoinColumn({ name: 'workshop_id' })
  workshop: Workshop;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ResourceType
  })
  type: ResourceType;

  @Column()
  url: string;

  @Column('jsonb', { nullable: true })
  metadata: {
    fileSize?: number;
    duration?: number;
    format?: string;
    tags?: string[];
    isRequired?: boolean;
  };

  @Column('int', { default: 0 })
  downloadCount: number;

  @Column('int', { default: 0 })
  viewCount: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 