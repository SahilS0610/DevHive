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
import { Skill } from './Skill';

@Entity('user_skills')
export class UserSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  })
  level: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.skills)
  user: User;

  @ManyToOne(() => Skill, skill => skill.users)
  skill: Skill;

  // Validation hooks
  @BeforeInsert()
  @BeforeUpdate()
  validateLevel() {
    if (!['beginner', 'intermediate', 'advanced', 'expert'].includes(this.level)) {
      throw new Error('Invalid skill level');
    }
  }
} 