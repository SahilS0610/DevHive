import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit.entity';
import { SecurityService } from './security.service';
import { NotificationService } from '../notification/notification.service';
import { RiskAssessmentService } from './risk-assessment.service';

export interface AuditLogData {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ip: string;
  userAgent: string;
  sessionId?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
    private readonly securityService: SecurityService,
    private readonly notificationService: NotificationService,
    private readonly riskAssessmentService: RiskAssessmentService
  ) {}

  async logAction(data: AuditLogData): Promise<void> {
    try {
      const riskScore = await this.securityService.calculateRiskScore({
        userId: data.userId,
        action: data.action,
        ip: data.ip,
        resource: data.resource,
        resourceId: data.resourceId
      });

      const auditLog = this.auditRepo.create({
        ...data,
        timestamp: new Date(),
        riskScore,
        metadata: {
          geoLocation: await this.securityService.getIpLocation(data.ip),
          deviceInfo: this.parseUserAgent(data.userAgent),
          sessionId: data.sessionId || await this.securityService.getCurrentSessionId(data.userId),
          riskFactors: await this.riskAssessmentService.getRiskFactors(data)
        }
      });

      await this.auditRepo.save(auditLog);

      // Trigger real-time security analysis
      if (riskScore > this.securityService.getRiskThreshold()) {
        await this.handleHighRiskAction(auditLog);
      }

      // Update user security profile
      await this.securityService.updateUserSecurityProfile(data.userId, {
        action: data.action,
        riskScore,
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error('Failed to log audit action:', error);
      throw error;
    }
  }

  async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    riskScore?: number;
  }): Promise<AuditLog[]> {
    const query = this.auditRepo.createQueryBuilder('audit');

    if (filters.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }
    if (filters.action) {
      query.andWhere('audit.action = :action', { action: filters.action });
    }
    if (filters.resource) {
      query.andWhere('audit.resource = :resource', { resource: filters.resource });
    }
    if (filters.startDate) {
      query.andWhere('audit.timestamp >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      query.andWhere('audit.timestamp <= :endDate', { endDate: filters.endDate });
    }
    if (filters.riskScore) {
      query.andWhere('audit.riskScore >= :riskScore', { riskScore: filters.riskScore });
    }

    return query.orderBy('audit.timestamp', 'DESC').getMany();
  }

  async getRiskSummary(): Promise<{
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    total: number;
  }> {
    const logs = await this.auditRepo.find();
    
    return {
      highRisk: logs.filter(log => log.riskScore > 80).length,
      mediumRisk: logs.filter(log => log.riskScore > 50 && log.riskScore <= 80).length,
      lowRisk: logs.filter(log => log.riskScore <= 50).length,
      total: logs.length
    };
  }

  private async handleHighRiskAction(log: AuditLog): Promise<void> {
    try {
      // Notify security team
      await this.notificationService.notifySecurityTeam({
        type: 'HIGH_RISK_ACTION',
        severity: 'high',
        data: {
          userId: log.userId,
          action: log.action,
          riskScore: log.riskScore,
          timestamp: log.timestamp,
          metadata: log.metadata
        }
      });

      // Add to security monitoring queue
      await this.securityService.addToMonitoring(log);

      // Update user risk profile
      await this.securityService.updateUserRiskProfile(log.userId, log);

      // Trigger additional security measures
      await this.securityService.enforceAdditionalSecurityMeasures(log.userId);
    } catch (error) {
      this.logger.error('Failed to handle high risk action:', error);
    }
  }

  private parseUserAgent(userAgent: string): {
    browser: string;
    os: string;
    device: string;
  } {
    // Implementation for parsing user agent string
    return {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'Unknown'
    };
  }
} 