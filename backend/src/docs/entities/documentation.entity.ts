import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiDocumentation } from '../types/documentation.types';

@Entity('documentation')
export class DocumentationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  version: string;

  @Column('jsonb')
  content: ApiDocumentation;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;
} 