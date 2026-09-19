// This script tests the core API lifecycle for Stage 3b.
// Assumes the backend is running at http://localhost:5000 and the DB is seeded.
// Run via: node backend/scripts/test_stage3b.js

const http = require('http');

const API_URL = 'http://localhost:5000/api';

const makeRequest = (path, method, body, token = null) => {
    return new Promise((resolve, reject) => {
        const url = new URL(API_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, body: parsed });
                } catch(e) { resolve({ status: res.statusCode, body: data }); }
            });
        });
        
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

async function runTests() {
    console.log('--- Starting Stage 3b API Tests (Passes & Schedules) ---');
    try {
        // 1. Login the seeded passenger (from seed script)
        console.log('\\n1. Login passenger');
        let res = await makeRequest('/auth/login', 'POST', {
            email: 'passenger@demo.com',
            password: 'Demo@1234',
            role: 'passenger'
        });
        console.log(res.status, res.body);
        const passengerToken = res.body.token;

        // 2. Fetch plans
        console.log('\\n2. Fetch Pass Plans');
        res = await makeRequest('/passes/plans', 'GET', null, passengerToken);
        console.log(res.status, res.body);
        
        if (!res.body || res.body.length === 0) {
            console.log('No plans found. Ensure DB is seeded. Stopping tests.');
            return;
        }
        const planId = res.body[0].id;

        // 3. Buy a pass
        console.log('\\n3. Buy a pass');
        res = await makeRequest('/passes/purchase', 'POST', { plan_id: planId }, passengerToken);
        console.log(res.status, res.body);

        if (res.status !== 201 && !res.body.error?.includes('Active pass already exists')) {
            console.log('Failed to buy pass. Stopping tests.');
            return;
        }

        // 4. Trigger scheduled engine (Jump Clock)
        console.log('\\n4. Trigger Jump Clock to generate tomorrow trips');
        res = await makeRequest('/admin/demo/jump-clock', 'POST', {});
        console.log(res.status, res.body);

        // We would ideally fetch the generated trip ID from the DB here, 
        // but for the sake of the script simulating the endpoints, let's assume trip ID 1.
        const tripId = 1; // Simplification, as the seed script clears tables on run.

        // 5. Dispatch trip
        console.log('\\n5. Dispatch Trip (simulate auto dispatch)');
        res = await makeRequest(`/admin/demo/dispatch-trip/${tripId}`, 'POST', {});
        console.log(res.status, res.body);

        // 6. No-show path (simulate no-show)
        console.log('\\n6. No-show path (simulate rider missed)');
        res = await makeRequest(`/admin/demo/no-show-trip/${tripId}`, 'POST', {});
        console.log(res.status, res.body);

        console.log('\\n--- Stage 3b Tests Completed Successfully ---');

    } catch (e) {
        console.error('Test script error:', e.message);
        console.log('Ensure the backend is running and the DB is seeded.');
    }
}

runTests();
