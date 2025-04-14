import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm';
import { User } from './User';
import { Workshop } from './Workshop';

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

@Entity('workshop_registrations')
export class WorkshopRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workshop)
  @JoinColumn({ name: 'workshop_id' })
  workshop: Workshop;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING
  })
  status: RegistrationStatus;

  @Column('jsonb', { nullable: true })
  attendance: {
    [sessionDate: string]: {
      attended: boolean;
      notes?: string;
    };
  };

  @Column('jsonb', { nullable: true })
  progress: {
    completedSessions: number;
    totalSessions: number;
    lastSessionAttended?: Date;
    xpEarned: number;
  };

  @Column({ default: false })
  hasCompleted: boolean;

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 