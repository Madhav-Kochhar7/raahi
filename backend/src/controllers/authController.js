const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const login = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email, role]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email, password, or role' });
        }
        
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        
        if (!match) {
            return res.status(401).json({ error: 'Invalid email, password, or role' });
        }
        
        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        // Return minimal user info
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const register = async (req, res) => {
    const { email, password, name, phone, role } = req.body;
    try {
        const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        
        const hash = await bcrypt.hash(password, 10);
        
        const result = await db.query(
            'INSERT INTO users (role, name, email, phone, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, role, name, email',
            [role, name, email, phone, hash]
        );
        const user = result.rows[0];
        
        // If rider, create an empty rider profile
        if (role === 'rider') {
            await db.query('INSERT INTO rider_profiles (user_id) VALUES ($1)', [user.id]);
        }
        
        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.status(201).json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { login, register };
