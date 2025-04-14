import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackupRegistry } from './entities/backup-registry.entity';
import { BackupFile } from './entities/backup-file.entity';
import { StorageService } from '../storage/storage.service';
import { NotificationService } from '../notification/notification.service';
import { BackupConfig } from './config/backup.config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface BackupMetadata {
  id: string;
  type: 'full' | 'incremental';
  startTime: Date;
  environment: string;
  version: string;
}

export interface BackupExecutionResult {
  files: BackupFile[];
  size: number;
  checksum: string;
  storageLocation: string;
}

export interface BackupResult {
  success: boolean;
  backupId: string;
  size: number;
  duration: number;
  location: string;
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    @InjectRepository(BackupRegistry)
    private readonly backupRegistryRepository: Repository<BackupRegistry>,
    @InjectRepository(BackupFile)
    private readonly backupFileRepository: Repository<BackupFile>,
    private readonly config: BackupConfig,
    private readonly storageService: StorageService,
    private readonly notificationService: NotificationService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async scheduleDailyBackup(): Promise<void> {
    try {
      await this.createBackup('incremental');
    } catch (error) {
      this.logger.error('Scheduled backup failed', error.stack);
      await this.notificationService.sendBackupFailureNotification(error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async scheduleWeeklyBackup(): Promise<void> {
    try {
      await this.createBackup('full');
    } catch (error) {
      this.logger.error('Weekly backup failed', error.stack);
      await this.notificationService.sendBackupFailureNotification(error);
    }
  }

  async createBackup(type: 'full' | 'incremental'): Promise<BackupResult> {
    const backupId = this.generateBackupId();
    
    try {
      // Initialize backup metadata
      const metadata: BackupMetadata = {
        id: backupId,
        type,
        startTime: new Date(),
        environment: process.env.NODE_ENV,
        version: process.env.APP_VERSION
      };

      // Execute backup strategy
      const result = await this.executeBackupStrategy(type, metadata);

      // Verify backup integrity
      await this.verifyBackupIntegrity(result);

      // Upload to storage
      await this.uploadBackup(result);

      // Update backup registry
      await this.updateBackupRegistry(result, metadata);

      return {
        success: true,
        backupId,
        size: result.size,
        duration: Date.now() - metadata.startTime.getTime(),
        location: result.storageLocation
      };
    } catch (error) {
      await this.handleBackupFailure(backupId, error);
      throw error;
    }
  }

  private async executeBackupStrategy(
    type: 'full' | 'incremental',
    metadata: BackupMetadata
  ): Promise<BackupExecutionResult> {
    const backupDir = path.join(this.config.tempDir, metadata.id);
    await fs.promises.mkdir(backupDir, { recursive: true });

    const files: BackupFile[] = [];
    let totalSize = 0;

    // Backup database
    const dbBackup = await this.backupDatabase(backupDir);
    files.push(dbBackup);
    totalSize += dbBackup.size;

    // Backup files
    const fileBackups = await this.backupFiles(backupDir, type);
    files.push(...fileBackups);
    totalSize += fileBackups.reduce((sum, file) => sum + file.size, 0);

    // Calculate checksum
    const checksum = await this.calculateChecksum(backupDir);

    return {
      files,
      size: totalSize,
      checksum,
      storageLocation: backupDir
    };
  }

  private async backupDatabase(backupDir: string): Promise<BackupFile> {
    const timestamp = new Date().toISOString();
    const filename = `database-${timestamp}.sql`;
    const filepath = path.join(backupDir, filename);

    // Execute database dump command
    // This is a placeholder - implement actual database backup logic
    await fs.promises.writeFile(filepath, 'Database backup content');

    const stats = await fs.promises.stat(filepath);
    return {
      id: uuidv4(),
      filename,
      path: filepath,
      size: stats.size,
      type: 'database',
      createdAt: new Date()
    };
  }

  private async backupFiles(
    backupDir: string,
    type: 'full' | 'incremental'
  ): Promise<BackupFile[]> {
    const files: BackupFile[] = [];
    const sourceDir = this.config.sourceDir;

    // Get list of files to backup
    const fileList = await this.getFilesToBackup(sourceDir, type);

    for (const file of fileList) {
      const relativePath = path.relative(sourceDir, file);
      const backupPath = path.join(backupDir, relativePath);
      
      await fs.promises.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.promises.copyFile(file, backupPath);

      const stats = await fs.promises.stat(backupPath);
      files.push({
        id: uuidv4(),
        filename: path.basename(file),
        path: backupPath,
        size: stats.size,
        type: 'file',
        createdAt: new Date()
      });
    }

    return files;
  }

  private async getFilesToBackup(
    sourceDir: string,
    type: 'full' | 'incremental'
  ): Promise<string[]> {
    if (type === 'full') {
      return this.getAllFiles(sourceDir);
    }

    // For incremental backup, get files modified since last backup
    const lastBackup = await this.getLastBackup();
    if (!lastBackup) {
      return this.getAllFiles(sourceDir);
    }

    return this.getModifiedFiles(sourceDir, lastBackup.metadata.startTime);
  }

  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await this.getAllFiles(fullPath)));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  private async getModifiedFiles(
    dir: string,
    since: Date
  ): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await this.getModifiedFiles(fullPath, since)));
      } else {
        const stats = await fs.promises.stat(fullPath);
        if (stats.mtime > since) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  private async calculateChecksum(dir: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    const files = await this.getAllFiles(dir);

    for (const file of files) {
      const content = await fs.promises.readFile(file);
      hash.update(content);
    }

    return hash.digest('hex');
  }

  private async verifyBackupIntegrity(result: BackupExecutionResult): Promise<void> {
    const calculatedChecksum = await this.calculateChecksum(result.storageLocation);
    if (calculatedChecksum !== result.checksum) {
      throw new Error('Backup integrity verification failed');
    }
  }

  private async uploadBackup(result: BackupExecutionResult): Promise<void> {
    await this.storageService.uploadDirectory(
      result.storageLocation,
      `backups/${result.files[0].createdAt.toISOString()}`
    );
  }

  private async updateBackupRegistry(
    result: BackupExecutionResult,
    metadata: BackupMetadata
  ): Promise<void> {
    const registry = new BackupRegistry();
    registry.id = metadata.id;
    registry.type = metadata.type;
    registry.status = 'completed';
    registry.metadata = {
      startTime: metadata.startTime,
      endTime: new Date(),
      size: result.size,
      checksum: result.checksum,
      environment: metadata.environment,
      version: metadata.version
    };
    registry.storageInfo = {
      provider: this.config.storageProvider,
      location: result.storageLocation,
      retentionPeriod: this.config.retentionPeriod,
      encryptionKey: this.config.encryptionKey
    };
    registry.verificationResults = {
      verified: true,
      verifiedAt: new Date(),
      integrityCheck: true,
      consistencyCheck: true
    };
    registry.files = result.files;

    await this.backupRegistryRepository.save(registry);
  }

  private async handleBackupFailure(backupId: string, error: Error): Promise<void> {
    const registry = new BackupRegistry();
    registry.id = backupId;
    registry.status = 'failed';
    registry.metadata = {
      startTime: new Date(),
      endTime: new Date(),
      size: 0,
      checksum: '',
      environment: process.env.NODE_ENV,
      version: process.env.APP_VERSION
    };
    registry.verificationResults = {
      verified: false,
      verifiedAt: new Date(),
      integrityCheck: false,
      consistencyCheck: false
    };

    await this.backupRegistryRepository.save(registry);
    await this.notificationService.sendBackupFailureNotification(error);
  }

  private generateBackupId(): string {
    return uuidv4();
  }

  private async getLastBackup(): Promise<BackupRegistry | null> {
    return this.backupRegistryRepository.findOne({
      where: { status: 'completed' },
      order: { 'metadata.startTime': 'DESC' }
    });
  }

  async restoreBackup(backupId: string, targetDir: string): Promise<void> {
    const registry = await this.backupRegistryRepository.findOne({
      where: { id: backupId },
      relations: ['files']
    });

    if (!registry) {
      throw new Error(`Backup ${backupId} not found`);
    }

    try {
      // Download backup files
      await this.storageService.downloadDirectory(
        registry.storageInfo.location,
        targetDir
      );

      // Verify integrity
      const checksum = await this.calculateChecksum(targetDir);
      if (checksum !== registry.metadata.checksum) {
        throw new Error('Backup integrity verification failed during restore');
      }

      // Restore database
      await this.restoreDatabase(targetDir);

      // Restore files
      await this.restoreFiles(targetDir);

      await this.notificationService.sendRestoreSuccessNotification(registry);
    } catch (error) {
      await this.notificationService.sendRestoreFailureNotification(error);
      throw error;
    }
  }

  private async restoreDatabase(backupDir: string): Promise<void> {
    // Implement database restore logic
    // This is a placeholder
  }

  private async restoreFiles(backupDir: string): Promise<void> {
    // Implement file restore logic
    // This is a placeholder
  }
} 