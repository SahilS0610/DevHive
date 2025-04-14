const { testConnection } = require('./config/database');

async function main() {
  console.log('Testing database connection...');
  const success = await testConnection();
  
  if (success) {
    console.log('✅ Database test completed successfully!');
  } else {
    console.log('❌ Database test failed. Please check your configuration.');
  }
  
  process.exit(success ? 0 : 1);
}

main(); 