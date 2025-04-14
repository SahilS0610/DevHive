import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SecurityAlert } from './security-alert.entity';

@Entity('security_profiles')
export class SecurityProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('jsonb')
  riskMetrics: {
    overallScore: number;
    lastUpdated: Date;
    factors: {
      loginPatterns: number;
      actionFrequency: number;
      resourceAccess: number;
      locationVariance: number;
      deviceVariance: number;
      timePatterns: number;
      apiUsage: number;
    };
    history: Array<{
      score: number;
      timestamp: Date;
      reason: string;
    }>;
  };

  @Column('jsonb')
  securitySettings: {
    mfaEnabled: boolean;
    mfaMethods: string[];
    allowedIPs: string[];
    restrictedActions: string[];
    notificationPreferences: {
      email: boolean;
      push: boolean;
      slack: boolean;
      webhook: boolean;
    };
    sessionSettings: {
      maxConcurrentSessions: number;
      sessionTimeout: number;
      requireReauthForSensitive: boolean;
    };
    passwordPolicy: {
      minLength: number;
      requireSpecialChar: boolean;
      requireNumber: boolean;
      requireUppercase: boolean;
      expiryDays: number;
      historySize: number;
    };
  };

  @Column('jsonb')
  accessPatterns: {
    commonIPs: Array<{
      ip: string;
      lastUsed: Date;
      frequency: number;
      location: string;
    }>;
    commonDevices: Array<{
      deviceId: string;
      deviceType: string;
      lastUsed: Date;
      frequency: number;
    }>;
    commonTimes: Array<{
      start: string;
      end: string;
      timezone: string;
      frequency: number;
    }>;
    resourceAccess: Array<{
      resource: string;
      frequency: number;
      lastAccessed: Date;
    }>;
  };

  @Column('jsonb')
  threatDetection: {
    lastScan: Date;
    activeThreats: number;
    threatHistory: Array<{
      type: string;
      detectedAt: Date;
      resolvedAt?: Date;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
    mitigationActions: Array<{
      action: string;
      timestamp: Date;
      success: boolean;
    }>;
  };

  @OneToMany(() => SecurityAlert, alert => alert.profile)
  alerts: SecurityAlert[];

  @Column({ default: false })
  isLocked: boolean;

  @Column({ nullable: true })
  lockedUntil?: Date;

  @Column({ nullable: true })
  lastPasswordChange?: Date;

  @Column({ nullable: true })
  lastSecurityReview?: Date;
} 