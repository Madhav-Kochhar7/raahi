const express = require('express');
const { getPredictions, getHotspots, getMetrics } = require('../controllers/demandController');

const router = express.Router();

router.get('/predictions', getPredictions);
router.get('/hotspots', getHotspots);
router.get('/metrics', getMetrics);

module.exports = router;
