require('dotenv').config({ path: '../.env' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to DB');

        // Run schema migration
        const migrationPath = path.join(__dirname, '../../database/migrations/001_init.sql');
        const schema = fs.readFileSync(migrationPath, 'utf8');
        console.log('Running schema migration...');
        await client.query(schema);
        console.log('Schema migration successful.');

        if (process.env.DEMO_MODE === 'true') {
            console.log('DEMO_MODE is true. Seeding database...');
            
            // Generate password hash
            const passHash = await bcrypt.hash('Demo@1234', 10);
            
            // Users
            const users = [
                `('passenger', 'Passenger User', 'passenger@demo.com', '9876543210', '${passHash}', 'female', true)`,
                `('rider', 'Rahul', 'rider@demo.com', '9876543211', '${passHash}', 'male', false)`,
                ...Array.from({ length: 7 }, (_, i) => 
                    `('rider', 'Rider ${i + 2}', 'rider${i + 2}@demo.com', '987654321${i + 2}', '${passHash}', 'male', false)`
                ),
                `('admin', 'Admin User', 'admin@demo.com', '9876543220', '${passHash}', 'none', false)`
            ];

            await client.query(`
                INSERT INTO users (role, name, email, phone, password_hash, gender, safety_mode_default)
                VALUES ${users.join(', ')}
                ON CONFLICT (email) DO NOTHING;
            `);

            // Rider Profiles
            const riderProfiles = [];
            // Verified rider (user id 2)
            riderProfiles.push(`(2, 'PB 11 AB 1234', 'Hero Splendor', 'LIC123456', 'verified', true, true, true, true, 30.484, 76.594, 4.8, 45)`);
            
            // Simulated riders (id 3 to 9)
            for (let i = 3; i <= 8; i++) {
                const isVerified = (i !== 5); // Make one unverified for demo
                const status = isVerified ? 'verified' : 'pending';
                riderProfiles.push(`(${i}, 'PB 11 XY ${1000 + i}', 'Honda Activa', 'LIC1234${i}', '${status}', ${isVerified}, ${isVerified}, ${isVerified}, true, 30.484, 76.594, 4.5, 20)`);
            }
            
            await client.query(`
                INSERT INTO rider_profiles (user_id, vehicle_number, vehicle_model, licence_number, verification_status, identity_verified, licence_verified, vehicle_verified, is_online, current_lat, current_lng, rating_avg, rating_count)
                VALUES ${riderProfiles.join(', ')}
                ON CONFLICT (user_id) DO NOTHING;
            `);

            // Zones
            // Rajpura Zones
            const zones = [
                `('Central Bus Stand', 30.4820, 76.5960, 200, 'bus_stand')`,
                `('Railway Station', 30.4780, 76.5990, 200, 'railway')`,
                `('College Road', 30.4900, 76.5850, 300, 'college')`,
                `('Main Market', 30.4850, 76.5920, 150, 'market')`,
                `('Model Town', 30.4800, 76.5880, 250, 'residential')`,
                `('Civil Hospital', 30.4860, 76.5980, 150, 'hospital')`,
                `('Industrial Area', 30.4950, 76.6050, 400, 'industrial')`,
                `('Residential Area', 30.4750, 76.5800, 300, 'residential')`
            ];
            await client.query(`
                INSERT INTO zones (name, lat, lng, radius_m, type)
                VALUES ${zones.join(', ')}
                ON CONFLICT DO NOTHING;
            `);

            // Route templates and Plans (For testing Commute Pass)
            await client.query(`
                INSERT INTO route_templates (name, from_zone_id, to_zone_id, from_stop_name, from_lat, from_lng, to_stop_name, to_lat, to_lng, distance_km, duration_min)
                VALUES ('Model Town to College Road', 5, 3, 'Model Town Gate', 30.4805, 76.5885, 'College Main Gate', 30.4905, 76.5855, 3.5, 12)
            `);
            
            await client.query(`
                INSERT INTO pass_plans (route_template_id, name, price, validity_days, trips_included, weekdays, max_skips)
                VALUES (1, 'Student Monthly Saver', 2800, 30, 44, '{1,2,3,4,5}', 4)
            `);

            console.log('Database seeded successfully.');
        }

    } catch (e) {
        console.error('Error executing migration:', e);
    } finally {
        await client.end();
    }
}

main();
