require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  const result = await pool.query("SELECT * FROM users WHERE email='passenger@demo.com'");
  console.log("DB User:", result.rows[0]);
  if (result.rows[0]) {
    const match = await bcrypt.compare('password123', result.rows[0].password_hash);
    console.log("Password match:", match);
  }
  process.exit(0);
}
test();
