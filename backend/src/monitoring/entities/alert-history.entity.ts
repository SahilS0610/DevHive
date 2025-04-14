import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AlertRule } from './alert-rule.entity';

export type AlertStatus = 'triggered' | 'resolved' | 'acknowledged';

@Entity('alert_history')
export class AlertHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AlertRule)
  @JoinColumn({ name: 'ruleId' })
  rule: AlertRule;

  @Column()
  ruleId: string;

  @Column({
    type: 'enum',
    enum: ['triggered', 'resolved', 'acknowledged'],
    default: 'triggered'
  })
  status: AlertStatus;

  @Column('jsonb')
  metrics: Record<string, number>;

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true })
  acknowledgedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
} 