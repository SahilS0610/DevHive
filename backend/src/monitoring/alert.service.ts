import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertRule } from './entities/alert-rule.entity';
import { NotificationService } from '../notification/notification.service';
import { SystemMetrics } from './types/monitoring.types';

export interface AlertConfig {
  name: string;
  description: string;
  conditions: AlertCondition[];
  severity: 'info' | 'warning' | 'error' | 'critical';
  notifications: NotificationConfig[];
  cooldown?: number;
  enabled?: boolean;
}

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

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(
    @InjectRepository(AlertRule)
    private readonly alertRuleRepo: Repository<AlertRule>,
    private readonly notificationService: NotificationService
  ) {}

  async configureAlert(config: AlertConfig): Promise<AlertRule> {
    try {
      const rule = this.alertRuleRepo.create({
        name: config.name,
        description: config.description,
        conditions: config.conditions,
        severity: config.severity,
        notifications: config.notifications,
        cooldown: config.cooldown || 300, // Default 5 minutes
        enabled: config.enabled ?? true,
        createdAt: new Date()
      });

      await this.alertRuleRepo.save(rule);
      return rule;
    } catch (error) {
      this.logger.error('Failed to configure alert', error.stack);
      throw error;
    }
  }

  async evaluateAlerts(metrics: SystemMetrics): Promise<void> {
    try {
      const activeRules = await this.getActiveRules();

      for (const rule of activeRules) {
        const isTriggered = await this.evaluateRule(rule, metrics);

        if (isTriggered) {
          await this.triggerAlert(rule, metrics);
        }
      }
    } catch (error) {
      this.logger.error('Failed to evaluate alerts', error.stack);
      throw error;
    }
  }

  private async getActiveRules(): Promise<AlertRule[]> {
    return this.alertRuleRepo.find({
      where: { enabled: true },
      order: { severity: 'DESC' }
    });
  }

  private async evaluateRule(
    rule: AlertRule,
    metrics: SystemMetrics
  ): Promise<boolean> {
    try {
      for (const condition of rule.conditions) {
        const value = this.getMetricValue(metrics, condition.metric);
        const isTriggered = this.evaluateCondition(value, condition);

        if (!isTriggered) {
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to evaluate rule: ${rule.id}`, error.stack);
      return false;
    }
  }

  private getMetricValue(metrics: SystemMetrics, path: string): number {
    const parts = path.split('.');
    let value: any = metrics;

    for (const part of parts) {
      value = value[part];
      if (value === undefined) {
        throw new Error(`Metric path not found: ${path}`);
      }
    }

    return Number(value);
  }

  private evaluateCondition(
    value: number,
    condition: AlertCondition
  ): boolean {
    switch (condition.operator) {
      case '>':
        return value > condition.threshold;
      case '<':
        return value < condition.threshold;
      case '>=':
        return value >= condition.threshold;
      case '<=':
        return value <= condition.threshold;
      case '==':
        return value === condition.threshold;
      case '!=':
        return value !== condition.threshold;
      default:
        throw new Error(`Unsupported operator: ${condition.operator}`);
    }
  }

  private async triggerAlert(
    rule: AlertRule,
    metrics: SystemMetrics
  ): Promise<void> {
    try {
      const alert = {
        ruleId: rule.id,
        severity: rule.severity,
        message: this.formatAlertMessage(rule, metrics),
        timestamp: new Date(),
        metrics: this.extractRelevantMetrics(rule, metrics)
      };

      // Store alert
      await this.storeAlert(alert);

      // Send notifications
      await this.notificationService.sendAlerts(alert, rule.notifications);
    } catch (error) {
      this.logger.error(`Failed to trigger alert for rule: ${rule.id}`, error.stack);
      throw error;
    }
  }

  private formatAlertMessage(rule: AlertRule, metrics: SystemMetrics): string {
    const conditions = rule.conditions
      .map(condition => {
        const value = this.getMetricValue(metrics, condition.metric);
        return `${condition.metric} ${condition.operator} ${condition.threshold} (current: ${value})`;
      })
      .join(', ');

    return `Alert: ${rule.name}\nDescription: ${rule.description}\nConditions: ${conditions}`;
  }

  private extractRelevantMetrics(
    rule: AlertRule,
    metrics: SystemMetrics
  ): Record<string, number> {
    const relevantMetrics: Record<string, number> = {};

    for (const condition of rule.conditions) {
      const value = this.getMetricValue(metrics, condition.metric);
      relevantMetrics[condition.metric] = value;
    }

    return relevantMetrics;
  }

  private async storeAlert(alert: any): Promise<void> {
    // Implement alert storage logic
    // This could involve storing in a database, time-series database, etc.
  }

  async getAlertHistory(
    startTime: Date,
    endTime: Date,
    severity?: string
  ): Promise<any[]> {
    // Implement alert history retrieval
    return [];
  }

  async updateAlertRule(
    id: string,
    updates: Partial<AlertConfig>
  ): Promise<AlertRule> {
    const rule = await this.alertRuleRepo.findOne({ where: { id } });
    if (!rule) {
      throw new Error(`Alert rule not found: ${id}`);
    }

    Object.assign(rule, updates);
    await this.alertRuleRepo.save(rule);
    return rule;
  }

  async deleteAlertRule(id: string): Promise<void> {
    await this.alertRuleRepo.delete(id);
  }
} 