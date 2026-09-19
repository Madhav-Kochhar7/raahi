const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { runMatching } = require('../controllers/matchingController');

const router = express.Router();

// Run batch matching
router.post('/run', requireAuth, requireRole(['admin']), runMatching);

module.exports = router;
