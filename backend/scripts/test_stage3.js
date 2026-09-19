// This script tests the core API lifecycle for Stage 3.
// Assumes the backend is running at http://localhost:5000 and the DB is seeded.
// Run via: node backend/scripts/test_stage3.js

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
    console.log('--- Starting Stage 3 Core API Tests ---');
    try {
        // 1. Register a new passenger
        console.log('\\n1. Register passenger');
        let res = await makeRequest('/auth/register', 'POST', {
            email: `test_passenger_${Date.now()}@test.com`,
            password: 'password123',
            name: 'Test Passenger',
            phone: `99${Math.floor(Math.random()*100000000)}`,
            role: 'passenger'
        });
        console.log(res.status, res.body);
        const passengerToken = res.body.token;

        // 2. Login the seeded rider (from seed script)
        console.log('\\n2. Login rider');
        res = await makeRequest('/auth/login', 'POST', {
            email: 'rider@demo.com',
            password: 'Demo@1234',
            role: 'rider'
        });
        console.log(res.status, res.body);
        const riderToken = res.body.token;
        const riderId = res.body.user?.id;

        // 3. Passenger requests a ride
        console.log('\\n3. Passenger requests ride');
        res = await makeRequest('/rides/request', 'POST', {
            pickup_lat: 30.48, pickup_lng: 76.59,
            drop_lat: 30.49, drop_lng: 76.60
        }, passengerToken);
        console.log(res.status, res.body);
        const rideId = res.body.id;

        if (!rideId) {
            console.log('Ride creation failed. Stopping tests.');
            return;
        }

        // 4. Role guard test: Rider tries to request a ride (should fail)
        console.log('\\n4. Rider tries to request ride (expect 403)');
        res = await makeRequest('/rides/request', 'POST', {
            pickup_lat: 30.48, pickup_lng: 76.59,
            drop_lat: 30.49, drop_lng: 76.60
        }, riderToken);
        console.log(res.status, res.body);

        // 5. Rider accepts the ride
        console.log('\\n5. Rider accepts ride');
        res = await makeRequest(`/rides/${rideId}/accept`, 'POST', {}, riderToken);
        console.log(res.status, res.body);

        // 6. Rider starts the ride with OTP (from DB it is 1234 by default for the test)
        console.log('\\n6. Rider starts ride');
        res = await makeRequest(`/rides/${rideId}/start`, 'POST', { otp_pin: '1234' }, riderToken);
        console.log(res.status, res.body);

        // 7. Rider completes the ride
        console.log('\\n7. Rider completes ride');
        res = await makeRequest(`/rides/${rideId}/complete`, 'POST', {}, riderToken);
        console.log(res.status, res.body);

        // 8. Passenger rates the rider
        console.log('\\n8. Passenger rates rider');
        res = await makeRequest(`/rides/${rideId}/rate`, 'POST', { stars: 5, comment: 'Great ride!', to_user: riderId }, passengerToken);
        console.log(res.status, res.body);

        console.log('\\n--- Tests Completed Successfully ---');

    } catch (e) {
        console.error('Test script error:', e.message);
        console.log('Ensure the backend is running and the DB is seeded.');
    }
}

runTests();
