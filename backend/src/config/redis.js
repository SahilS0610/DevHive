const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Redis Client Connected'));

// Test the connection
async function testConnection() {
  try {
    await redisClient.connect();
    await redisClient.set('test', 'Redis is working!');
    const value = await redisClient.get('test');
    console.log('Redis test value:', value);
    await redisClient.del('test');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  } finally {
    await redisClient.quit();
  }
}

module.exports = {
  redisClient,
  testConnection
}; 