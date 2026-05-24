// Test PostgreSQL database connection
// Run with: node test-postgres.js

const { Pool } = require('pg');

// Test connection string (update this for your environment)
const testConnectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/milo_db';

async function testPostgresConnection() {
  console.log('Testing PostgreSQL connection...');
  console.log('Connection string:', testConnectionString.replace(/:[^:]*@/, ':****@'));
  
  const pool = new Pool({
    connectionString: testConnectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL successfully');
    
    // Test query
    const result = await client.query('SELECT version()');
    console.log('✓ PostgreSQL version:', result.rows[0].version.split(',')[0]);
    
    // Test creating tables
    console.log('\nTesting table creation...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created test_users table');
    
    // Insert test data
    await client.query(
      'INSERT INTO test_users (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
      ['test-id-1', 'Test User']
    );
    console.log('✓ Inserted test data');
    
    // Query test data
    const usersResult = await client.query('SELECT * FROM test_users');
    console.log('✓ Retrieved test data:', usersResult.rows.length, 'rows');
    
    // Clean up
    await client.query('DROP TABLE IF EXISTS test_users');
    console.log('✓ Cleaned up test table');
    
    client.release();
    console.log('\n✅ All PostgreSQL tests passed!');
    
  } catch (error) {
    console.error('❌ PostgreSQL test failed:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check your DATABASE_URL environment variable');
    console.error('3. Verify database credentials');
    console.error('4. Ensure database "milo_db" exists (or create it)');
    console.error('\nTo create database:');
    console.error('  createdb milo_db');
    console.error('\nOr connect to existing database:');
    console.error('  Update DATABASE_URL in .env.local');
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run test
testPostgresConnection().catch(console.error);