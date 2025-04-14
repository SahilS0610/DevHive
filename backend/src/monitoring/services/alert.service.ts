import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertRule } from '../entities/alert-rule.entity';
import { AlertHistory } from '../entities/alert-history.entity';
import { AlertSeverity, AlertCondition, NotificationConfig } from '../entities/alert-rule.entity';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(
    @InjectRepository(AlertRule)
    private readonly alertRuleRepository: Repository<AlertRule>,
    @InjectRepository(AlertHistory)
    private readonly alertHistoryRepository: Repository<AlertHistory>,
  ) {}

  async createAlertRule(
    name: string,
    conditions: AlertCondition[],
    severity: AlertSeverity,
    notifications: NotificationConfig[],
    description?: string,
    cooldown?: number,
  ): Promise<AlertRule> {
    const rule = this.alertRuleRepository.create({
      name,
      description,
      conditions,
      severity,
      notifications,
      cooldown: cooldown || 300,
    });

    return this.alertRuleRepository.save(rule);
  }

  async evaluateMetrics(metrics: Record<string, number>): Promise<void> {
    const rules = await this.alertRuleRepository.find({
      where: { enabled: true },
    });

    for (const rule of rules) {
      const shouldTrigger = this.evaluateConditions(rule.conditions, metrics);
      
      if (shouldTrigger) {
        await this.handleAlertTrigger(rule, metrics);
      }
    }
  }

  private evaluateConditions(
    conditions: AlertCondition[],
    metrics: Record<string, number>,
  ): boolean {
    return conditions.every(condition => {
      const value = metrics[condition.metric];
      if (value === undefined) return false;

      switch (condition.operator) {
        case 'gt':
          return value > condition.threshold;
        case 'gte':
          return value >= condition.threshold;
        case 'lt':
          return value < condition.threshold;
        case 'lte':
          return value <= condition.threshold;
        case 'eq':
          return value === condition.threshold;
        default:
          return false;
      }
    });
  }

  private async handleAlertTrigger(
    rule: AlertRule,
    metrics: Record<string, number>,
  ): Promise<void> {
    // Check if there's a recent alert for this rule
    const recentAlert = await this.alertHistoryRepository.findOne({
      where: {
        ruleId: rule.id,
        status: 'triggered',
      },
      order: { createdAt: 'DESC' },
    });

    if (recentAlert) {
      const timeSinceLastAlert = Date.now() - recentAlert.createdAt.getTime();
      if (timeSinceLastAlert < rule.cooldown * 1000) {
        return; // Skip if within cooldown period
      }
    }

    // Create new alert history entry
    const alert = this.alertHistoryRepository.create({
      ruleId: rule.id,
      metrics,
      status: 'triggered',
      message: `Alert triggered for rule: ${rule.name}`,
    });

    await this.alertHistoryRepository.save(alert);

    // Send notifications
    await this.sendNotifications(rule, alert);
  }

  private async sendNotifications(
    rule: AlertRule,
    alert: AlertHistory,
  ): Promise<void> {
    for (const notification of rule.notifications) {
      try {
        switch (notification.type) {
          case 'email':
            await this.sendEmailNotification(notification, rule, alert);
            break;
          case 'slack':
            await this.sendSlackNotification(notification, rule, alert);
            break;
          case 'webhook':
            await this.sendWebhookNotification(notification, rule, alert);
            break;
        }
      } catch (error) {
        this.logger.error(
          `Failed to send ${notification.type} notification for alert ${alert.id}`,
          error,
        );
      }
    }
  }

  private async sendEmailNotification(
    config: NotificationConfig,
    rule: AlertRule,
    alert: AlertHistory,
  ): Promise<void> {
    // Implement email notification logic
    this.logger.log(`Sending email notification for alert ${alert.id}`);
  }

  private async sendSlackNotification(
    config: NotificationConfig,
    rule: AlertRule,
    alert: AlertHistory,
  ): Promise<void> {
    // Implement Slack notification logic
    this.logger.log(`Sending Slack notification for alert ${alert.id}`);
  }

  private async sendWebhookNotification(
    config: NotificationConfig,
    rule: AlertRule,
    alert: AlertHistory,
  ): Promise<void> {
    // Implement webhook notification logic
    this.logger.log(`Sending webhook notification for alert ${alert.id}`);
  }

  async acknowledgeAlert(
    alertId: string,
    userId: string,
  ): Promise<AlertHistory> {
    const alert = await this.alertHistoryRepository.findOne({
      where: { id: alertId },
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.status = 'acknowledged';
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();

    return this.alertHistoryRepository.save(alert);
  }

  async resolveAlert(alertId: string): Promise<AlertHistory> {
    const alert = await this.alertHistoryRepository.findOne({
      where: { id: alertId },
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();

    return this.alertHistoryRepository.save(alert);
  }

  async getActiveAlerts(): Promise<AlertHistory[]> {
    return this.alertHistoryRepository.find({
      where: { status: 'triggered' },
      relations: ['rule'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAlertHistory(
    ruleId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AlertHistory[]> {
    const query = this.alertHistoryRepository.createQueryBuilder('alert')
      .leftJoinAndSelect('alert.rule', 'rule')
      .orderBy('alert.createdAt', 'DESC');

    if (ruleId) {
      query.where('alert.ruleId = :ruleId', { ruleId });
    }

    if (startDate) {
      query.andWhere('alert.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('alert.createdAt <= :endDate', { endDate });
    }

    return query.getMany();
  }
} 