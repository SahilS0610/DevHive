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
import { WorkshopSkill } from './WorkshopSkill';
import { WorkshopRegistration } from './WorkshopRegistration';

@Entity('workshops')
export class Workshop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ default: 0 })
  maxParticipants: number;

  @Column({
    type: 'enum',
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.organizedWorkshops)
  organizer: User;

  @ManyToMany(() => User, user => user.attendedWorkshops)
  @JoinTable({
    name: 'workshop_participants',
    joinColumn: { name: 'workshopId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
  })
  participants: User[];

  @OneToMany(() => WorkshopSkill, workshopSkill => workshopSkill.workshop)
  skills: WorkshopSkill[];

  @OneToMany(() => WorkshopRegistration, registration => registration.workshop)
  registrations: WorkshopRegistration[];

  // Validation hooks
  @BeforeInsert()
  @BeforeUpdate()
  validateDates() {
    if (this.startDate >= this.endDate) {
      throw new Error('Workshop end date must be after start date');
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  validateMaxParticipants() {
    if (this.maxParticipants < 1) {
      throw new Error('Workshop must have at least 1 participant');
    }
  }
} 