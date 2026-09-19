const express = require('express');
const router = express.Router();

router.post('/explain-demand', (req, res) => {
    // Simulated OpenAI call for demand explanation
    const { metrics } = req.body;
    res.json({
        explanation: "Simulated OpenAI Analysis: Based on the historical demand and current real-time metrics, we observe a 40% higher request density in Zone 4 (College). This correlates with typical class end-times. Recommendation: Deploy 3 idle drivers to Zone 4."
    });
});

router.post('/explain-match', (req, res) => {
    // Simulated OpenAI call for explaining why a rider was matched
    const { rider_id, passenger_id } = req.body;
    res.json({
        explanation: `Simulated OpenAI Analysis: Rider ${rider_id} was matched with Passenger ${passenger_id} because their ML trust score was 92/100, driven by a 5-star rating history, frequent routines in this exact zone, and the passenger's Regular Rider trust toggle being active. This assignment minimized global wait time across the network.`
    });
});

module.exports = router;
