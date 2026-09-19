require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  const passes = await pool.query('SELECT * FROM passes');
  console.log("Passes:", passes.rows);
  const trips = await pool.query('SELECT * FROM scheduled_trips');
  console.log("Trips:", trips.rows);
  process.exit(0);
}
test();
