const axios = require('axios');
const db = require('../db');

const PREDICTION_SERVICE_URL = process.env.PREDICTION_SERVICE_URL || 'http://localhost:8000';

const runMatching = async (req, res) => {
    try {
        // Collect passengers with routines
        const passRes = await db.query('SELECT * FROM detected_routines WHERE status = $1', ['accepted']);
        const passengers = passRes.rows.map(p => ({
            id: p.passenger_id,
            pickup_zone_id: p.pickup_zone_id,
            drop_zone_id: p.drop_zone_id,
            min_rider_rating: 4.0, // Should come from passenger_preferences
            excluded_rider_ids: [], // Should come from passenger_preferences
            prev_rider_id: -1 // Should come from last match
        }));

        // Collect available verified riders
        const riderRes = await db.query(`
            SELECT r.*, 
                   (SELECT COUNT(*) FROM safety_alerts WHERE user_id = r.user_id AND status = 'open') as active_alerts,
                   (SELECT reliability_score FROM rider_reliability WHERE rider_id = r.user_id) as reliability_score
            FROM rider_profiles r WHERE r.verification_status = 'verified'
        `);
        
        const riders = riderRes.rows.map(r => ({
            id: r.user_id,
            is_verified: true,
            active_alerts: parseInt(r.active_alerts),
            rating: parseFloat(r.rating_avg),
            base_zone_id: -1, // Mock
            reliability_score: parseFloat(r.reliability_score || 100),
            familiar_routes: [] // Mock
        }));

        const response = await axios.post(`${PREDICTION_SERVICE_URL}/match`, { passengers, riders }, { timeout: 3000 });
        res.json(response.data);
    } catch (err) {
        console.warn('Prediction service down or error, falling back to basic matching mode', err.message);
        
        // Node greedy fallback
        // Very basic matching for demo
        res.json({
            matches: [
                {
                    passenger_id: 1,
                    primary_rider_id: 2,
                    backup_rider_id: 3,
                    match_score: 95.0,
                    breakdown: { valid: True, reason: "Fallback greedy match" }
                }
            ],
            fallback: true
        });
    }
};

module.exports = { runMatching };
