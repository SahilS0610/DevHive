import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { CacheConfig } from './cache.config';

interface CacheMetrics {
  hitRate: number;
  memoryUsage: number;
  totalKeys: number;
  evictedKeys: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis;
  private readonly defaultTTL: number = 3600; // 1 hour
  private metrics: CacheMetrics = {
    hitRate: 0,
    memoryUsage: 0,
    totalKeys: 0,
    evictedKeys: 0
  };

  constructor(private config: CacheConfig) {
    this.initializeRedis();
  }

  private initializeRedis() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connection established');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (!cached) {
        this.metrics.hitRate = (this.metrics.hitRate * 0.9); // Decay hit rate
        return null;
      }
      
      this.metrics.hitRate = (this.metrics.hitRate * 0.9) + 0.1; // Update hit rate
      return JSON.parse(cached) as T;
    } catch (error) {
      this.logger.error(`Failed to get cache key ${key}:`, error);
      await this.redis.del(key);
      return null;
    }
  }

  async set(
    key: string,
    value: any,
    options: { ttl?: number; tags?: string[] } = {}
  ): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const ttl = options.ttl || this.defaultTTL;

      await Promise.all([
        this.redis.set(key, serialized, 'EX', ttl),
        ...this.updateCacheTags(key, options.tags)
      ]);

      await this.updateMetrics();
    } catch (error) {
      this.logger.error(`Failed to set cache key ${key}:`, error);
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      const keys = await this.getKeysByTags(tags);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.metrics.evictedKeys += keys.length;
      }
    } catch (error) {
      this.logger.error('Failed to invalidate cache by tags:', error);
    }
  }

  async getCacheMetrics(): Promise<CacheMetrics> {
    try {
      const info = await this.redis.info();
      const lines = info.split('\r\n');
      
      for (const line of lines) {
        if (line.startsWith('used_memory:')) {
          this.metrics.memoryUsage = parseInt(line.split(':')[1]);
        }
        if (line.startsWith('db0:keys=')) {
          this.metrics.totalKeys = parseInt(line.split('=')[1]);
        }
      }

      return this.metrics;
    } catch (error) {
      this.logger.error('Failed to get cache metrics:', error);
      return this.metrics;
    }
  }

  private async updateCacheTags(
    key: string,
    tags: string[] = []
  ): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    for (const tag of tags) {
      pipeline.sadd(`tag:${tag}`, key);
      pipeline.expire(`tag:${tag}`, this.defaultTTL);
    }
    
    await pipeline.exec();
  }

  private async getKeysByTags(tags: string[]): Promise<string[]> {
    const pipeline = this.redis.pipeline();
    const tagKeys = tags.map(tag => `tag:${tag}`);
    
    for (const tagKey of tagKeys) {
      pipeline.smembers(tagKey);
    }
    
    const results = await pipeline.exec();
    const keys = new Set<string>();
    
    results?.forEach(([err, result]) => {
      if (!err && result) {
        (result as string[]).forEach(key => keys.add(key));
      }
    });
    
    return Array.from(keys);
  }

  private async updateMetrics(): Promise<void> {
    try {
      const info = await this.redis.info();
      const lines = info.split('\r\n');
      
      for (const line of lines) {
        if (line.startsWith('used_memory:')) {
          this.metrics.memoryUsage = parseInt(line.split(':')[1]);
        }
        if (line.startsWith('db0:keys=')) {
          this.metrics.totalKeys = parseInt(line.split('=')[1]);
        }
      }
    } catch (error) {
      this.logger.error('Failed to update cache metrics:', error);
    }
  }
} 