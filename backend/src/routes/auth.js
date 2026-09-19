const express = require('express');
const { z } = require('zod');
const { validateBody } = require('../middleware/validate');
const { login, register } = require('../controllers/authController');

const router = express.Router();

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['passenger', 'rider', 'admin'])
});

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    phone: z.string().min(10),
    role: z.enum(['passenger', 'rider', 'admin'])
});

router.post('/login', validateBody(loginSchema), login);
router.post('/register', validateBody(registerSchema), register);

module.exports = router;
