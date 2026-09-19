require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = fs.readFileSync('./database/migrations/001_init.sql', 'utf8');

pool.query(sql)
  .then(() => {
    console.log('Migration successful');
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
