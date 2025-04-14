import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { UserSkill } from './UserSkill';
import { ProjectSkill } from './ProjectSkill';
import { WorkshopSkill } from './WorkshopSkill';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({
    type: 'enum',
    enum: ['technical', 'soft', 'language', 'other'],
    default: 'technical'
  })
  category: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => UserSkill, userSkill => userSkill.skill)
  users: UserSkill[];

  @OneToMany(() => ProjectSkill, projectSkill => projectSkill.skill)
  projects: ProjectSkill[];

  @OneToMany(() => WorkshopSkill, workshopSkill => workshopSkill.skill)
  workshops: WorkshopSkill[];

  // Validation hooks
  @BeforeInsert()
  @BeforeUpdate()
  validateName() {
    if (!this.name || this.name.length < 2) {
      throw new Error('Skill name must be at least 2 characters long');
    }
  }
} 