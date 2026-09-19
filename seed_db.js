require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const zones = [
    [1, 'Central Bus Stand'],
    [2, 'Railway Station'],
    [3, 'College Road'],
    [4, 'Main Market'],
    [5, 'Model Town'],
    [6, 'Civil Hospital'],
    [7, 'Industrial Area'],
    [8, 'Residential Area']
  ];
  
  for (let z of zones) {
    await pool.query('INSERT INTO zones (id, name, lat, lng, radius_m) VALUES ($1, $2, 30.48, 76.58, 1000) ON CONFLICT (id) DO NOTHING', [z[0], z[1]]);
  }

  // Insert a test passenger (id=1)
  await pool.query(`INSERT INTO users (id, name, phone, role, email, password_hash) VALUES (1, 'Test Passenger', '9999999991', 'passenger', 'passenger@demo.com', 'password123') ON CONFLICT (id) DO NOTHING`);
  // Insert some test riders (id=2 to 9)
  for (let i = 2; i <= 9; i++) {
    await pool.query(`INSERT INTO users (id, name, phone, role, email, password_hash) VALUES ($1, $2, $3, 'rider', $4, 'password123') ON CONFLICT (id) DO NOTHING`, [i, `Rider ${i}`, `999999999${i}`, `rider${i}@demo.com`]);
    await pool.query(`INSERT INTO rider_profiles (user_id, vehicle_number, vehicle_model) VALUES ($1, $2, 'Auto') ON CONFLICT (user_id) DO NOTHING`, [i, `DL1R${i}`]);
  }
  
  console.log('Seed done');
  process.exit(0);
}

seed();
