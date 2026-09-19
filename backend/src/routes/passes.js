const express = require('express');
const { z } = require('zod');
const { validateBody } = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const { getPlans, purchasePass, getMyPasses, pausePass, cancelPass } = require('../controllers/passController');

const router = express.Router();

const purchaseSchema = z.object({
    plan_id: z.number()
});

router.get('/plans', getPlans);
router.get('/mine', requireAuth, requireRole(['passenger']), getMyPasses);
router.post('/purchase', requireAuth, requireRole(['passenger']), validateBody(purchaseSchema), purchasePass);
router.post('/:id/pause', requireAuth, requireRole(['passenger']), pausePass);
router.post('/:id/cancel', requireAuth, requireRole(['passenger']), cancelPass);

module.exports = router;
