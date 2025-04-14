import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiDocumentation } from '../types/documentation.types';
import { DocumentationEntity } from '../entities/documentation.entity';

@Injectable()
export class DocsRepository {
  constructor(
    @InjectRepository(DocumentationEntity)
    private readonly repository: Repository<DocumentationEntity>,
  ) {}

  async save(documentation: ApiDocumentation): Promise<void> {
    const entity = this.repository.create({
      version: documentation.version,
      content: documentation,
      lastUpdated: documentation.lastUpdated,
    });
    await this.repository.save(entity);
  }

  async getLatest(): Promise<ApiDocumentation | null> {
    const entity = await this.repository.findOne({
      order: { lastUpdated: 'DESC' },
    });
    return entity?.content || null;
  }

  async getByVersion(version: string): Promise<ApiDocumentation | null> {
    const entity = await this.repository.findOne({
      where: { version },
    });
    return entity?.content || null;
  }

  async getAllVersions(): Promise<string[]> {
    const entities = await this.repository.find({
      select: ['version'],
      order: { lastUpdated: 'DESC' },
    });
    return entities.map(entity => entity.version);
  }
} 