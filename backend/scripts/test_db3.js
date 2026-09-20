require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const res = await pool.query('SELECT id, email, role, password_hash FROM users');
    console.log("USERS:", res.rows);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
check();
