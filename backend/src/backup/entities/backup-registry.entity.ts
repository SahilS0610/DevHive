import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BackupFile } from './backup-file.entity';

@Entity('backup_registry')
export class BackupRegistry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['full', 'incremental'],
    default: 'full'
  })
  type: 'full' | 'incremental';

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  })
  status: 'pending' | 'completed' | 'failed';

  @Column('jsonb')
  metadata: {
    startTime: Date;
    endTime: Date;
    size: number;
    checksum: string;
    environment: string;
    version: string;
  };

  @Column('jsonb')
  storageInfo: {
    provider: 'aws' | 'gcp' | 'azure';
    location: string;
    retentionPeriod: number;
    encryptionKey?: string;
  };

  @Column('jsonb')
  verificationResults: {
    verified: boolean;
    verifiedAt: Date;
    integrityCheck: boolean;
    consistencyCheck: boolean;
  };

  @OneToMany(() => BackupFile, file => file.registry)
  files: BackupFile[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 