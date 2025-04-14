import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../project/project.entity';
import { Workshop } from '../workshop/workshop.entity';
import { User } from '../user/user.entity';

export enum ResourceType {
  DOCUMENT = 'document',
  CODE = 'code',
  TEMPLATE = 'template',
  TUTORIAL = 'tutorial',
  TOOL = 'tool'
}

export enum IntegrationType {
  GITHUB = 'github',
  GITLAB = 'gitlab',
  BITBUCKET = 'bitbucket',
  EXTERNAL = 'external'
}

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ResourceType,
    default: ResourceType.DOCUMENT
  })
  type: ResourceType;

  @Column('jsonb')
  metadata: {
    version?: string;
    source?: string;
    language?: string;
    tags: string[];
    requirements?: string[];
    lastUpdated?: Date;
    size?: number;
    format?: string;
  };

  @Column('jsonb')
  integration: {
    type: IntegrationType;
    url: string;
    apiKey?: string;
    webhook?: string;
    branch?: string;
    repository?: string;
  };

  @Column({ default: false })
  isArchived: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Project, project => project.resources)
  project: Project;

  @ManyToMany(() => Workshop, workshop => workshop.resources)
  @JoinTable()
  workshops: Workshop[];

  @ManyToOne(() => User)
  createdBy: User;

  @ManyToOne(() => User)
  updatedBy: User;

  @Column('jsonb', { nullable: true })
  versionHistory: Array<{
    version: string;
    changes: string[];
    updatedAt: Date;
    updatedBy: string;
  }>;
} 