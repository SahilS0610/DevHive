import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BackupConfig {
  constructor(private readonly configService: ConfigService) {}

  get tempDir(): string {
    return this.configService.get<string>('BACKUP_TEMP_DIR', '/tmp/backups');
  }

  get sourceDir(): string {
    return this.configService.get<string>('BACKUP_SOURCE_DIR', '/app/data');
  }

  get storageProvider(): 'aws' | 'gcp' | 'azure' {
    return this.configService.get<'aws' | 'gcp' | 'azure'>(
      'BACKUP_STORAGE_PROVIDER',
      'aws'
    );
  }

  get retentionPeriod(): number {
    return this.configService.get<number>('BACKUP_RETENTION_DAYS', 30);
  }

  get encryptionKey(): string | undefined {
    return this.configService.get<string>('BACKUP_ENCRYPTION_KEY');
  }

  get maxBackupSize(): number {
    return this.configService.get<number>('BACKUP_MAX_SIZE_MB', 1024) * 1024 * 1024;
  }

  get compressionLevel(): number {
    return this.configService.get<number>('BACKUP_COMPRESSION_LEVEL', 6);
  }

  get backupSchedule(): {
    full: string;
    incremental: string;
  } {
    return {
      full: this.configService.get<string>(
        'BACKUP_FULL_SCHEDULE',
        '0 0 * * 0' // Weekly on Sunday at midnight
      ),
      incremental: this.configService.get<string>(
        'BACKUP_INCREMENTAL_SCHEDULE',
        '0 1 * * *' // Daily at 1 AM
      )
    };
  }

  get notificationConfig(): {
    email: string[];
    slack: string;
  } {
    return {
      email: this.configService
        .get<string>('BACKUP_NOTIFICATION_EMAILS', '')
        .split(',')
        .filter(Boolean),
      slack: this.configService.get<string>(
        'BACKUP_NOTIFICATION_SLACK_CHANNEL',
        '#backups'
      )
    };
  }

  get healthCheckConfig(): {
    enabled: boolean;
    interval: number;
    timeout: number;
  } {
    return {
      enabled: this.configService.get<boolean>('BACKUP_HEALTH_CHECK_ENABLED', true),
      interval: this.configService.get<number>('BACKUP_HEALTH_CHECK_INTERVAL', 3600),
      timeout: this.configService.get<number>('BACKUP_HEALTH_CHECK_TIMEOUT', 300)
    };
  }

  get monitoringConfig(): {
    enabled: boolean;
    metricsEndpoint: string;
    logLevel: string;
  } {
    return {
      enabled: this.configService.get<boolean>('BACKUP_MONITORING_ENABLED', true),
      metricsEndpoint: this.configService.get<string>(
        'BACKUP_METRICS_ENDPOINT',
        '/metrics/backup'
      ),
      logLevel: this.configService.get<string>('BACKUP_LOG_LEVEL', 'info')
    };
  }
} 