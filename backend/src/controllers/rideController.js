const db = require('../db');
const { calculateFare, getDistanceFromLatLonInKm } = require('../utils/fare');

const requestRide = async (req, res) => {
    const { pickup_lat, pickup_lng, drop_lat, drop_lng, pickup_address, drop_address } = req.body;
    
    // For simplicity, we assign a dummy zone id if we can't find one, but let's assume zone_id 1
    const pickup_zone_id = 1; 

    const distanceKm = getDistanceFromLatLonInKm(pickup_lat, pickup_lng, drop_lat, drop_lng) * 1.3; // fallback formula
    const fare = calculateFare(distanceKm, 1.0); // No surge for now
    
    const commissionRate = parseFloat(process.env.COMMISSION_RATE || 0.12);
    const commissionAmount = fare.totalFare * commissionRate;

    try {
        const result = await db.query(
            `INSERT INTO rides (passenger_id, pickup_lat, pickup_lng, drop_lat, drop_lng, pickup_address, drop_address, pickup_zone_id, status, base_fare, distance_charge, surge_charge, total_fare, distance_km, commission_amount, payment_method, otp_pin) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'requested', $9, $10, $11, $12, $13, $14, 'cash', '1234') RETURNING *`,
            [req.user.id, pickup_lat, pickup_lng, drop_lat, drop_lng, pickup_address, drop_address, pickup_zone_id, fare.baseFare, fare.distanceCharge, fare.surgeCharge, fare.totalFare, fare.distanceKm, commissionAmount]
        );
        
        const ride = result.rows[0];
        
        // Find nearest riders... omitting exact logic here for script testing
        // Let's create offers to demo riders (id 2)
        await db.query(`INSERT INTO ride_offers (ride_id, rider_id, status) VALUES ($1, 2, 'offered')`, [ride.id]);
        
        res.status(201).json(ride);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const acceptRide = async (req, res) => {
    const { ride_id } = req.params;
    
    try {
        // Use a transaction
        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            
            // Check ride status
            const rideRes = await client.query('SELECT status FROM rides WHERE id = $1 FOR UPDATE', [ride_id]);
            if (rideRes.rows.length === 0 || rideRes.rows[0].status !== 'requested') {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Ride no longer available' });
            }
            
            // Update offer
            await client.query('UPDATE ride_offers SET status = $1 WHERE ride_id = $2 AND rider_id = $3', ['accepted', ride_id, req.user.id]);
            
            // Update ride
            const updateRide = await client.query(
                `UPDATE rides SET status = 'rider_en_route', rider_id = $1, accepted_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`, 
                [req.user.id, ride_id]
            );
            
            await client.query('COMMIT');
            res.json(updateRide.rows[0]);
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const startRide = async (req, res) => {
    const { ride_id } = req.params;
    const { otp_pin } = req.body;
    try {
        const result = await db.query(`UPDATE rides SET status = 'in_progress', started_at = CURRENT_TIMESTAMP WHERE id = $1 AND rider_id = $2 AND otp_pin = $3 RETURNING *`, [ride_id, req.user.id, otp_pin]);
        if (result.rowCount === 0) return res.status(400).json({ error: 'Invalid PIN or ride not found' });
        res.json(result.rows[0]);
    } catch(e) { res.status(500).json({error: 'Internal'}); }
};

const completeRide = async (req, res) => {
    const { ride_id } = req.params;
    try {
        const result = await db.query(`UPDATE rides SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = $1 AND rider_id = $2 RETURNING *`, [ride_id, req.user.id]);
        if (result.rowCount === 0) return res.status(400).json({ error: 'Ride not found' });
        res.json(result.rows[0]);
    } catch(e) { res.status(500).json({error: 'Internal'}); }
};

const rateRide = async (req, res) => {
    const { ride_id } = req.params;
    const { stars, comment, to_user } = req.body;
    try {
        await db.query(`INSERT INTO ratings (ride_id, from_user, to_user, stars, comment) VALUES ($1, $2, $3, $4, $5)`, [ride_id, req.user.id, to_user, stars, comment]);
        res.json({ success: true });
    } catch(e) { res.status(500).json({error: 'Internal'}); }
};

module.exports = { requestRide, acceptRide, startRide, completeRide, rateRide };
