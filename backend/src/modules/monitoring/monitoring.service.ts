import { Injectable, Logger } from '@nestjs/common';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { PrometheusMetrics } from '../metrics/prometheus.metrics';
import { CacheService } from '../optimization/cache.service';
import { ResourceService } from '../resource/resource.service';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    bytesIn: number;
    bytesOut: number;
  };
}

interface DatabaseMetrics {
  connectionPool: number;
  queryTimeAvg: number;
  activeConnections: number;
  slowQueries: number;
}

interface ErrorMetrics {
  apiErrorRate: number;
  databaseErrorRate: number;
  resourceErrorRate: number;
  recentErrors: Array<{
    timestamp: Date;
    type: string;
    message: string;
    stack?: string;
  }>;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private influxDB: InfluxDB;
  private metrics: PrometheusMetrics;

  constructor(
    private readonly cacheService: CacheService,
    private readonly resourceService: ResourceService
  ) {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    this.influxDB = new InfluxDB({
      url: process.env.INFLUXDB_URL,
      token: process.env.INFLUXDB_TOKEN
    });
    this.metrics = new PrometheusMetrics();
  }

  async trackSystemMetrics(): Promise<void> {
    try {
      const metrics = await this.gatherSystemMetrics();
      
      // Write to InfluxDB for time-series data
      const point = new Point('system_metrics')
        .floatField('cpu_usage', metrics.cpu)
        .floatField('memory_usage', metrics.memory)
        .floatField('disk_usage', metrics.disk)
        .floatField('network_in', metrics.network.bytesIn)
        .floatField('network_out', metrics.network.bytesOut)
        .tag('environment', process.env.NODE_ENV);

      await this.influxDB.write(point);

      // Update Prometheus metrics
      this.metrics.systemResourceGauge.set({
        resource: 'cpu',
        value: metrics.cpu
      });
      this.metrics.systemResourceGauge.set({
        resource: 'memory',
        value: metrics.memory
      });
      this.metrics.systemResourceGauge.set({
        resource: 'disk',
        value: metrics.disk
      });
    } catch (error) {
      this.logger.error('Failed to track system metrics:', error);
    }
  }

  async trackApiPerformance(endpoint: string, duration: number, statusCode: number): Promise<void> {
    try {
      const point = new Point('api_performance')
        .floatField('duration_ms', duration)
        .intField('status_code', statusCode)
        .tag('endpoint', endpoint)
        .tag('method', endpoint.split(' ')[0]);

      await this.influxDB.write(point);
      
      // Update API metrics
      this.metrics.apiLatencyHistogram.observe({
        endpoint,
        duration
      });

      // Track response codes
      this.metrics.apiResponseCounter.inc({
        endpoint,
        statusCode
      });
    } catch (error) {
      this.logger.error('Failed to track API performance:', error);
    }
  }

  async monitorDatabaseHealth(): Promise<void> {
    try {
      const dbMetrics = await this.getDatabaseMetrics();
      
      const point = new Point('database_health')
        .floatField('connection_pool', dbMetrics.connectionPool)
        .floatField('query_time_avg', dbMetrics.queryTimeAvg)
        .intField('active_connections', dbMetrics.activeConnections)
        .intField('slow_queries', dbMetrics.slowQueries);

      await this.influxDB.write(point);

      // Update database metrics
      this.metrics.databaseGauge.set({
        metric: 'connection_pool',
        value: dbMetrics.connectionPool
      });
      this.metrics.databaseGauge.set({
        metric: 'slow_queries',
        value: dbMetrics.slowQueries
      });
    } catch (error) {
      this.logger.error('Failed to monitor database health:', error);
    }
  }

  async trackErrorRates(): Promise<void> {
    try {
      const errorMetrics = await this.getErrorMetrics();
      
      // Track error rates in Prometheus
      this.metrics.errorRateGauge.set({
        type: 'api',
        value: errorMetrics.apiErrorRate
      });
      this.metrics.errorRateGauge.set({
        type: 'database',
        value: errorMetrics.databaseErrorRate
      });
      this.metrics.errorRateGauge.set({
        type: 'resource',
        value: errorMetrics.resourceErrorRate
      });

      // Log recent errors
      errorMetrics.recentErrors.forEach(error => {
        this.logger.error(`Error: ${error.type} - ${error.message}`, error.stack);
      });
    } catch (error) {
      this.logger.error('Failed to track error rates:', error);
    }
  }

  async monitorResourceUsage(): Promise<void> {
    try {
      const resourceMetrics = await this.resourceService.getResourceMetrics();
      const cacheMetrics = await this.cacheService.getCacheMetrics();

      const point = new Point('resource_usage')
        .floatField('active_resources', resourceMetrics.activeResources)
        .floatField('resource_utilization', resourceMetrics.utilization)
        .floatField('cache_hit_rate', cacheMetrics.hitRate)
        .floatField('cache_memory_usage', cacheMetrics.memoryUsage);

      await this.influxDB.write(point);

      // Update resource metrics
      this.metrics.resourceGauge.set({
        metric: 'active_resources',
        value: resourceMetrics.activeResources
      });
      this.metrics.resourceGauge.set({
        metric: 'cache_hit_rate',
        value: cacheMetrics.hitRate
      });
    } catch (error) {
      this.logger.error('Failed to monitor resource usage:', error);
    }
  }

  private async gatherSystemMetrics(): Promise<SystemMetrics> {
    // Implementation for gathering system metrics
    // This would typically use system-specific APIs or libraries
    return {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: {
        bytesIn: 0,
        bytesOut: 0
      }
    };
  }

  private async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    // Implementation for gathering database metrics
    return {
      connectionPool: 0,
      queryTimeAvg: 0,
      activeConnections: 0,
      slowQueries: 0
    };
  }

  private async getErrorMetrics(): Promise<ErrorMetrics> {
    // Implementation for gathering error metrics
    return {
      apiErrorRate: 0,
      databaseErrorRate: 0,
      resourceErrorRate: 0,
      recentErrors: []
    };
  }
} 