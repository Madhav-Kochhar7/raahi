const db = require('../db');

// This logic mimics the nightly cron (T-1 day 20:00) and time-based dispatches.
// For the test/demo, we can trigger this programmatically.
const generateTomorrowTrips = async () => {
    try {
        const client = await db.getClient();
        await client.query('BEGIN');
        
        // Find all active passes
        const passesRes = await client.query('SELECT * FROM passes WHERE status = $1 AND trips_remaining > 0', ['active']);
        
        for (const pass of passesRes.rows) {
            // For demo, we just grab any slot for the pass plan (in reality it matches weekdays)
            const slots = await client.query('SELECT * FROM pass_plan_slots WHERE plan_id = $1', [pass.plan_id]);
            // And any active assignment for this pass
            const assignments = await client.query('SELECT * FROM regular_assignments WHERE pass_id = $1 AND status = $2', [pass.id, 'active']);
            
            let riderId = null;
            let assignmentId = null;
            if (assignments.rows.length > 0) {
                riderId = assignments.rows[0].rider_id;
                assignmentId = assignments.rows[0].id;
            }
            
            for (const slot of slots.rows) {
                // Insert a scheduled trip for tomorrow
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const sDate = tomorrow.toISOString().split('T')[0];
                
                await client.query(`
                    INSERT INTO scheduled_trips (pass_id, assignment_id, service_date, slot_id, status)
                    VALUES ($1, $2, $3, $4, 'scheduled')
                    ON CONFLICT ON CONSTRAINT uq_scheduled_trip DO NOTHING
                `, [pass.id, assignmentId, sDate, slot.id]);
            }
        }
        await client.query('COMMIT');
        client.release();
        return { success: true, message: 'Trips generated' };
    } catch (e) {
        console.error('Error in generateTomorrowTrips:', e);
        throw e;
    }
};

const confirmTrip = async (riderId, tripId) => {
    // Rider confirms they will take the scheduled trip
    const result = await db.query(`UPDATE scheduled_trips SET status = 'rider_confirmed' WHERE id = $1 RETURNING *`, [tripId]);
    return result.rows[0];
};

const dispatchTrip = async (tripId) => {
    // Escalate or dispatch to the rider. Creates the actual ride row.
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const tripRes = await client.query('SELECT * FROM scheduled_trips WHERE id = $1', [tripId]);
        const trip = tripRes.rows[0];
        
        const passRes = await client.query('SELECT * FROM passes WHERE id = $1', [trip.pass_id]);
        const pass = passRes.rows[0];
        
        const assignmentRes = await client.query('SELECT * FROM regular_assignments WHERE id = $1', [trip.assignment_id]);
        const assignment = assignmentRes.rows[0];

        // Create ride pre-assigned
        const rideRes = await client.query(`
            INSERT INTO rides (passenger_id, rider_id, status, base_fare, distance_charge, surge_charge, total_fare, distance_km, commission_amount, payment_method, is_pass_ride, scheduled_trip_id, rider_payout)
            VALUES ($1, $2, 'rider_en_route', 0, 0, 0, 0, 0, 0, 'simulated_pass', true, $3, 50.00) RETURNING id
        `, [pass.passenger_id, assignment ? assignment.rider_id : null, tripId]);
        
        const rideId = rideRes.rows[0].id;
        
        await client.query(`UPDATE scheduled_trips SET status = 'dispatched', ride_id = $1 WHERE id = $2`, [rideId, tripId]);
        await client.query('COMMIT');
        client.release();
        return { success: true, rideId };
    } catch (e) {
        client.release();
        throw e;
    }
};

const handleNoShow = async (tripId) => {
    // No-show path restores credit
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        await client.query(`UPDATE scheduled_trips SET status = 'missed_by_rider' WHERE id = $1`, [tripId]);
        // Refund trip to pass (since it wasn't decremented yet, we just don't decrement, or we add one if we did)
        // Wait, trips are only decremented on completion in our logic.
        await client.query('COMMIT');
        client.release();
        return { success: true };
    } catch (e) {
        client.release();
        throw e;
    }
};

const completeScheduledTrip = async (tripId) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        await client.query(`UPDATE scheduled_trips SET status = 'completed' WHERE id = $1`, [tripId]);
        const tripRes = await client.query('SELECT pass_id FROM scheduled_trips WHERE id = $1', [tripId]);
        await client.query(`UPDATE passes SET trips_remaining = trips_remaining - 1 WHERE id = $1`, [tripRes.rows[0].pass_id]);
        await client.query('COMMIT');
        client.release();
        return { success: true };
    } catch (e) {
        client.release();
        throw e;
    }
};

module.exports = { generateTomorrowTrips, confirmTrip, dispatchTrip, handleNoShow, completeScheduledTrip };
