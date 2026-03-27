const pool = require('./db');

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully!');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Test query result:', rows);
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();