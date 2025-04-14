import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertHistory } from '../monitoring/entities/alert-history.entity';
import { AlertRule } from '../monitoring/entities/alert-rule.entity';
import { SystemMetrics } from '../monitoring/types/metrics.types';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    @InjectRepository(AlertHistory)
    private readonly alertHistoryRepository: Repository<AlertHistory>,
    @InjectRepository(AlertRule)
    private readonly alertRuleRepository: Repository<AlertRule>,
  ) {}

  async getSystemMetrics(timeRange: string): Promise<SystemMetrics> {
    try {
      // Get current metrics
      const cpuUsage = await this.getCpuUsage();
      const memoryUsage = await this.getMemoryUsage();
      const apiMetrics = await this.getApiMetrics();
      const errorMetrics = await this.getErrorMetrics();

      // Get historical data for charts
      const performanceData = await this.getPerformanceData(timeRange);
      const resourceData = await this.getResourceData(timeRange);

      // Get active alerts
      const activeAlerts = await this.getActiveAlerts();

      return {
        cpu: {
          usage: cpuUsage.current,
          trend: cpuUsage.trend,
        },
        memory: {
          used: memoryUsage.used,
          total: memoryUsage.total,
          percentage: memoryUsage.percentage,
          trend: memoryUsage.trend,
        },
        api: {
          responseTime: apiMetrics.responseTime,
          trend: apiMetrics.trend,
        },
        errors: {
          rate: errorMetrics.rate,
          trend: errorMetrics.trend,
        },
        performance: performanceData,
        resources: resourceData,
        activeAlerts,
      };
    } catch (error) {
      this.logger.error('Failed to get system metrics', error);
      throw error;
    }
  }

  private async getCpuUsage() {
    // Implement CPU usage monitoring
    return {
      current: 45.2,
      trend: 2.1,
    };
  }

  private async getMemoryUsage() {
    // Implement memory usage monitoring
    return {
      used: 8.5,
      total: 16,
      percentage: 53.1,
      trend: -1.2,
    };
  }

  private async getApiMetrics() {
    // Implement API metrics monitoring
    return {
      responseTime: 125,
      trend: -5.3,
    };
  }

  private async getErrorMetrics() {
    // Implement error metrics monitoring
    return {
      rate: 0.5,
      trend: -0.2,
    };
  }

  private async getPerformanceData(timeRange: string) {
    // Implement performance data collection
    return {
      timestamps: [],
      responseTime: [],
      throughput: [],
    };
  }

  private async getResourceData(timeRange: string) {
    // Implement resource data collection
    return {
      timestamps: [],
      cpu: [],
      memory: [],
      disk: [],
    };
  }

  private async getActiveAlerts() {
    return this.alertHistoryRepository.find({
      where: { status: 'triggered' },
      relations: ['rule'],
      order: { createdAt: 'DESC' },
    });
  }
} 