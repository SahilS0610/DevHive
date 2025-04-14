import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { BackupRegistry } from './backup-registry.entity';

@Entity('backup_files')
export class BackupFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column('bigint')
  size: number;

  @Column({
    type: 'enum',
    enum: ['database', 'file'],
    default: 'file'
  })
  type: 'database' | 'file';

  @Column('jsonb', { nullable: true })
  metadata: {
    compression: string;
    encryption: string;
    checksum: string;
  };

  @ManyToOne(() => BackupRegistry, registry => registry.files)
  registry: BackupRegistry;

  @CreateDateColumn()
  createdAt: Date;
} 