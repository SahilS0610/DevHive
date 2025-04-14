import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { Project } from './Project';
import { Workshop } from './Workshop';
import { Skill } from './Skill';
import { UserSkill } from './UserSkill';
import { ProjectApplication } from './ProjectApplication';
import { WorkshopRegistration } from './WorkshopRegistration';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 8 })
  universityId!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({
    type: 'enum',
    enum: ['student', 'project_leader', 'moderator', 'admin'],
    default: 'student'
  })
  role!: string;

  @Column({ nullable: true })
  avatar!: string;

  @Column({ default: 0 })
  points!: number;

  @Column({ default: 1 })
  level!: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relationships
  @OneToMany(() => Project, project => project.leader)
  ledProjects!: Project[];

  @ManyToMany(() => Project, project => project.members)
  @JoinTable({
    name: 'project_members',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'projectId', referencedColumnName: 'id' }
  })
  joinedProjects!: Project[];

  @OneToMany(() => Workshop, workshop => workshop.organizer)
  organizedWorkshops!: Workshop[];

  @ManyToMany(() => Workshop, workshop => workshop.participants)
  @JoinTable({
    name: 'workshop_participants',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'workshopId', referencedColumnName: 'id' }
  })
  attendedWorkshops!: Workshop[];

  @OneToMany(() => UserSkill, userSkill => userSkill.user)
  skills!: UserSkill[];

  @OneToMany(() => ProjectApplication, application => application.user)
  applications!: ProjectApplication[];

  @OneToMany(() => WorkshopRegistration, registration => registration.user)
  workshopRegistrations!: WorkshopRegistration[];

  // Validation hooks
  @BeforeInsert()
  @BeforeUpdate()
  validateUniversityId() {
    if (!/^\d{8}$/.test(this.universityId)) {
      throw new Error('University ID must be exactly 8 digits');
    }
  }
} 