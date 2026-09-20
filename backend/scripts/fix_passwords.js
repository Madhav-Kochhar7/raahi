require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  const hash = await bcrypt.hash('password123', 10);
  await pool.query('UPDATE users SET password_hash = $1', [hash]);
  console.log('Passwords fixed!');
  process.exit(0);
}
fix();
