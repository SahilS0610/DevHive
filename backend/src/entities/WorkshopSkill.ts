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
import { Workshop } from './Workshop';
import { Skill } from './Skill';

@Entity('workshop_skills')
export class WorkshopSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['primary', 'secondary'],
    default: 'primary'
  })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Workshop, workshop => workshop.skills)
  workshop: Workshop;

  @ManyToOne(() => Skill, skill => skill.workshops)
  skill: Skill;

  // Validation hooks
  @BeforeInsert()
  @BeforeUpdate()
  validateType() {
    if (!['primary', 'secondary'].includes(this.type)) {
      throw new Error('Invalid skill type');
    }
  }
} 