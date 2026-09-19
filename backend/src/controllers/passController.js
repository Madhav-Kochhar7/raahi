const db = require('../db');

const getPlans = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT p.*, r.name as route_name, r.from_stop_name, r.to_stop_name 
            FROM pass_plans p
            JOIN route_templates r ON p.route_template_id = r.id
            WHERE p.is_active = true
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const purchasePass = async (req, res) => {
    const { plan_id } = req.body;
    try {
        // Fetch plan details
        const planRes = await db.query('SELECT * FROM pass_plans WHERE id = $1', [plan_id]);
        if (planRes.rows.length === 0) return res.status(404).json({ error: 'Plan not found' });
        const plan = planRes.rows[0];

        // Ensure user doesn't already have an active pass for this route
        // (Simplified: just ensure no active pass at all for this prototype)
        const existing = await db.query('SELECT id FROM passes WHERE passenger_id = $1 AND status IN ($2, $3)', [req.user.id, 'active', 'pending']);
        if (existing.rows.length > 0) return res.status(400).json({ error: 'Active pass already exists' });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.validity_days);

        const result = await db.query(`
            INSERT INTO passes (passenger_id, plan_id, status, start_date, end_date, trips_remaining, price_paid)
            VALUES ($1, $2, 'active', $3, $4, $5, $6) RETURNING *
        `, [req.user.id, plan_id, startDate.toISOString(), endDate.toISOString(), plan.trips_included, plan.price]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getMyPasses = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM passes WHERE passenger_id = $1 ORDER BY id DESC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const pausePass = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`UPDATE passes SET status = 'paused' WHERE id = $1 AND passenger_id = $2 AND status = 'active' RETURNING *`, [id, req.user.id]);
        if (result.rowCount === 0) return res.status(400).json({ error: 'Pass not found or not active' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: 'Internal error' }); }
};

const cancelPass = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`UPDATE passes SET status = 'cancelled' WHERE id = $1 AND passenger_id = $2 AND status IN ('active', 'paused') RETURNING *`, [id, req.user.id]);
        if (result.rowCount === 0) return res.status(400).json({ error: 'Pass not found or cannot be cancelled' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: 'Internal error' }); }
};

module.exports = { getPlans, purchasePass, getMyPasses, pausePass, cancelPass };
