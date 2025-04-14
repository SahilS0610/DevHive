import { Injectable, Logger } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';
import { ElasticsearchService } from './elasticsearch.service';
import { AlertManager } from './alert-manager.service';
import { IncidentService } from './incident.service';
import { MetricsRepository } from './repositories/metrics.repository';
import { SystemMetrics, Anomaly, Incident } from './types/monitoring.types';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    private readonly prometheus: PrometheusService,
    private readonly elasticsearch: ElasticsearchService,
    private readonly alertManager: AlertManager,
    private readonly incidentService: IncidentService,
    private readonly metricsRepository: MetricsRepository
  ) {}

  async collectMetrics(): Promise<SystemMetrics> {
    try {
      const metrics = {
        system: await this.collectSystemMetrics(),
        application: await this.collectAppMetrics(),
        database: await this.collectDatabaseMetrics(),
        cache: await this.collectCacheMetrics(),
        network: await this.collectNetworkMetrics(),
        storage: await this.collectStorageMetrics()
      };

      // Store metrics
      await this.storeMetrics(metrics);

      // Check for anomalies
      await this.detectAnomalies(metrics);

      return metrics;
    } catch (error) {
      this.logger.error('Failed to collect metrics', error.stack);
      throw error;
    }
  }

  private async collectSystemMetrics() {
    return {
      cpu: {
        usage: await this.prometheus.getCPUUsage(),
        load: await this.prometheus.getCPULoad(),
        cores: await this.prometheus.getCPUCores(),
        temperature: await this.prometheus.getCPUTemperature()
      },
      memory: {
        total: await this.prometheus.getTotalMemory(),
        used: await this.prometheus.getUsedMemory(),
        free: await this.prometheus.getFreeMemory(),
        swap: await this.prometheus.getSwapUsage()
      },
      disk: {
        total: await this.prometheus.getTotalDisk(),
        used: await this.prometheus.getUsedDisk(),
        free: await this.prometheus.getFreeDisk(),
        io: await this.prometheus.getDiskIO()
      }
    };
  }

  private async collectAppMetrics() {
    return {
      requests: {
        total: await this.prometheus.getTotalRequests(),
        active: await this.prometheus.getActiveRequests(),
        rate: await this.prometheus.getRequestRate(),
        errors: await this.prometheus.getErrorRate()
      },
      response: {
        time: await this.prometheus.getResponseTime(),
        size: await this.prometheus.getResponseSize(),
        status: await this.prometheus.getStatusCodes()
      },
      sessions: {
        active: await this.prometheus.getActiveSessions(),
        total: await this.prometheus.getTotalSessions(),
        rate: await this.prometheus.getSessionRate()
      }
    };
  }

  private async collectDatabaseMetrics() {
    return {
      connections: {
        active: await this.prometheus.getActiveConnections(),
        total: await this.prometheus.getTotalConnections(),
        waiting: await this.prometheus.getWaitingConnections()
      },
      queries: {
        active: await this.prometheus.getActiveQueries(),
        rate: await this.prometheus.getQueryRate(),
        slow: await this.prometheus.getSlowQueries()
      },
      performance: {
        cacheHitRatio: await this.prometheus.getCacheHitRatio(),
        indexUsage: await this.prometheus.getIndexUsage(),
        lockWaitTime: await this.prometheus.getLockWaitTime()
      }
    };
  }

  private async collectCacheMetrics() {
    return {
      memory: {
        used: await this.prometheus.getCacheMemoryUsed(),
        total: await this.prometheus.getCacheMemoryTotal()
      },
      operations: {
        hits: await this.prometheus.getCacheHits(),
        misses: await this.prometheus.getCacheMisses(),
        evictions: await this.prometheus.getCacheEvictions()
      },
      performance: {
        hitRatio: await this.prometheus.getCacheHitRatio(),
        latency: await this.prometheus.getCacheLatency()
      }
    };
  }

  private async collectNetworkMetrics() {
    return {
      traffic: {
        in: await this.prometheus.getNetworkIn(),
        out: await this.prometheus.getNetworkOut(),
        errors: await this.prometheus.getNetworkErrors()
      },
      connections: {
        active: await this.prometheus.getActiveConnections(),
        rate: await this.prometheus.getConnectionRate(),
        errors: await this.prometheus.getConnectionErrors()
      },
      latency: {
        average: await this.prometheus.getNetworkLatency(),
        max: await this.prometheus.getMaxLatency()
      }
    };
  }

  private async collectStorageMetrics() {
    return {
      usage: {
        total: await this.prometheus.getStorageTotal(),
        used: await this.prometheus.getStorageUsed(),
        free: await this.prometheus.getStorageFree()
      },
      performance: {
        read: await this.prometheus.getStorageRead(),
        write: await this.prometheus.getStorageWrite(),
        latency: await this.prometheus.getStorageLatency()
      },
      health: {
        status: await this.prometheus.getStorageHealth(),
        errors: await this.prometheus.getStorageErrors()
      }
    };
  }

  private async storeMetrics(metrics: SystemMetrics): Promise<void> {
    try {
      // Store in time-series database
      await this.prometheus.storeMetrics(metrics);

      // Index in Elasticsearch for analysis
      await this.elasticsearch.indexMetrics(metrics);

      // Store in our database for historical analysis
      await this.metricsRepository.saveMetrics(metrics);
    } catch (error) {
      this.logger.error('Failed to store metrics', error.stack);
      throw error;
    }
  }

  private async detectAnomalies(metrics: SystemMetrics): Promise<void> {
    try {
      const anomalies = await this.alertManager.analyzeMetrics(metrics);
      
      if (anomalies.length > 0) {
        await this.handleAnomalies(anomalies);
      }
    } catch (error) {
      this.logger.error('Failed to detect anomalies', error.stack);
      throw error;
    }
  }

  private async handleAnomalies(anomalies: Anomaly[]): Promise<void> {
    for (const anomaly of anomalies) {
      try {
        // Create incident
        const incident = await this.createIncident(anomaly);
        
        // Trigger alerts
        await this.triggerAlerts(incident);
        
        // Update metrics
        await this.updateAnomalyMetrics(anomaly);
      } catch (error) {
        this.logger.error(`Failed to handle anomaly: ${anomaly.id}`, error.stack);
      }
    }
  }

  private async createIncident(anomaly: Anomaly): Promise<Incident> {
    return this.incidentService.create({
      anomalyId: anomaly.id,
      severity: anomaly.severity,
      status: 'open',
      title: anomaly.title,
      description: anomaly.description,
      metrics: anomaly.metrics,
      createdAt: new Date()
    });
  }

  private async triggerAlerts(incident: Incident): Promise<void> {
    await this.alertManager.triggerAlerts(incident);
  }

  private async updateAnomalyMetrics(anomaly: Anomaly): Promise<void> {
    await this.metricsRepository.updateAnomalyMetrics(anomaly);
  }

  async getMetricsHistory(
    startTime: Date,
    endTime: Date,
    interval: string
  ): Promise<SystemMetrics[]> {
    return this.metricsRepository.getMetricsHistory(startTime, endTime, interval);
  }

  async getAnomalyHistory(
    startTime: Date,
    endTime: Date
  ): Promise<Anomaly[]> {
    return this.metricsRepository.getAnomalyHistory(startTime, endTime);
  }

  async getIncidentHistory(
    startTime: Date,
    endTime: Date
  ): Promise<Incident[]> {
    return this.incidentService.getHistory(startTime, endTime);
  }
} 