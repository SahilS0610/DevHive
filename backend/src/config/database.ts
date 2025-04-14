import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { Workshop } from '../entities/Workshop';
import { Skill } from '../entities/Skill';
import { UserSkill } from '../entities/UserSkill';
import { ProjectSkill } from '../entities/ProjectSkill';
import { WorkshopSkill } from '../entities/WorkshopSkill';
import { ProjectApplication } from '../entities/ProjectApplication';
import { WorkshopRegistration } from '../entities/WorkshopRegistration';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';

const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'DevHive',
  database: process.env.DB_NAME || 'devhive',
  synchronize: isDevelopment,
  logging: isDevelopment,
  entities: [
    User,
    Project,
    Workshop,
    Skill,
    UserSkill,
    ProjectSkill,
    WorkshopSkill,
    ProjectApplication,
    WorkshopRegistration
  ],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  // Connection Pool Configuration
  poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
  maxQueryExecutionTime: 10000, // 10 seconds
  connectTimeoutMS: 3000,
  // SSL Configuration
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  // Cache Configuration
  cache: {
    duration: 60000, // 1 minute
    type: 'database'
  },
  // Extra Configuration
  extra: {
    // Connection timeout
    connectionTimeoutMillis: 3000,
    // Idle timeout
    idleTimeoutMillis: 60000,
    // Max number of clients
    max: parseInt(process.env.DB_POOL_SIZE || '10'),
    // Min number of clients
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    // Connection retry
    retryWrites: true,
    // Retry attempts
    retryAttempts: 3
  }
};

export const AppDataSource = new DataSource(databaseConfig);

// Connection initialization function with retry logic
export const initializeDatabase = async (retries = 5, delay = 5000) => {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('Database connection established successfully');
      } else {
        console.log('Database connection already established');
      }
      return;
    } catch (error) {
      lastError = error as Error;
      console.error(`Database connection attempt ${i + 1} failed:`, error);
      
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error('All database connection attempts failed');
  console.error('Last error:', lastError);
  process.exit(1);
};

// Graceful shutdown function
export const closeDatabaseConnection = async () => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed gracefully');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}; 