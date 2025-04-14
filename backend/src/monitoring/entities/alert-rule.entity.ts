import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AlertCondition {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  threshold: number;
  duration: string;
}

export interface NotificationConfig {
  type: 'email' | 'slack' | 'webhook';
  target: string;
  template?: string;
}

@Entity('alert_rules')
export class AlertRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('jsonb')
  conditions: AlertCondition[];

  @Column({
    type: 'enum',
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'warning'
  })
  severity: AlertSeverity;

  @Column('jsonb')
  notifications: NotificationConfig[];

  @Column({ default: 300 }) // Default 5 minutes
  cooldown: number;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 