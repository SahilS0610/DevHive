const { testConnection } = require('./config/redis');

async function main() {
  console.log('Testing Redis connection...');
  const success = await testConnection();
  
  if (success) {
    console.log('✅ Redis test completed successfully!');
  } else {
    console.log('❌ Redis test failed. Please check your configuration.');
  }
  
  process.exit(success ? 0 : 1);
}

main(); 