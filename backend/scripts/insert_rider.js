require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query("UPDATE users SET email = 'rider@demo.com' WHERE email = 'rider2@demo.com'");
    console.log("Rider email updated!");
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
