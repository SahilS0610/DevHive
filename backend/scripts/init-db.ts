import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import path from 'path';

config();

async function createDatabase() {
  // First, connect to the default postgres database
  const connection = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'DevHive',
    database: 'postgres', // Connect to default database
  });

  try {
    await connection.initialize();
    console.log('Connected to PostgreSQL server');

    // Check if database exists
    const result = await connection.query(
      `SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`
    );

    if (result.length === 0) {
      // Create database if it doesn't exist
      await connection.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Database '${process.env.DB_NAME}' created successfully`);
    } else {
      console.log(`Database '${process.env.DB_NAME}' already exists`);
    }

    // Close the connection to the default database
    await connection.destroy();

    // Now connect to the newly created database
    const appConnection = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'DevHive',
      database: process.env.DB_NAME || 'devhive',
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      entities: [path.join(__dirname, '../src/entities/**/*.ts')],
      migrations: [path.join(__dirname, '../src/migrations/**/*.ts')],
    });

    await appConnection.initialize();
    console.log(`Connected to database '${process.env.DB_NAME}'`);
    await appConnection.destroy();

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  }
}

createDatabase(); 