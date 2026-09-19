const express = require('express');
const { z } = require('zod');
const { validateBody } = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const { requestRide, acceptRide, startRide, completeRide, rateRide } = require('../controllers/rideController');

const router = express.Router();

const requestSchema = z.object({
    pickup_lat: z.number(),
    pickup_lng: z.number(),
    drop_lat: z.number(),
    drop_lng: z.number(),
    pickup_address: z.string().optional(),
    drop_address: z.string().optional()
});

const startSchema = z.object({
    otp_pin: z.string()
});

const rateSchema = z.object({
    stars: z.number().min(1).max(5),
    comment: z.string().optional(),
    to_user: z.number()
});

router.post('/request', requireAuth, requireRole(['passenger']), validateBody(requestSchema), requestRide);
router.post('/:ride_id/accept', requireAuth, requireRole(['rider']), acceptRide);
router.post('/:ride_id/start', requireAuth, requireRole(['rider']), validateBody(startSchema), startRide);
router.post('/:ride_id/complete', requireAuth, requireRole(['rider']), completeRide);
router.post('/:ride_id/rate', requireAuth, validateBody(rateSchema), rateRide);

module.exports = router;
