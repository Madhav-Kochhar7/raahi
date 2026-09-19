require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/auth');
const rideRoutes = require('./src/routes/rides');
const passRoutes = require('./src/routes/passes');
const { generateTomorrowTrips, confirmTrip, dispatchTrip, handleNoShow, completeScheduledTrip } = require('./src/jobs/scheduledTrips');
const openaiRoutes = require('./src/routes/openai');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

// Basic socket connection for demo purposes
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join a room based on ride ID
    socket.on('join_ride', (rideId) => {
        socket.join(`ride_${rideId}`);
        console.log(`Socket ${socket.id} joined ride ${rideId}`);
    });

    // Simulate Rider GPS update
    socket.on('rider_location', (data) => {
        // data: { rideId, lat, lng }
        io.to(`ride_${data.rideId}`).emit('location_update', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGINS ? process.env.FRONTEND_ORIGINS.split(',') : '*' }));
app.use(express.json());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});
app.use('/api/', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/passes', passRoutes);
app.use('/api/demand', require('./src/routes/demand'));
app.use('/api/matching', require('./src/routes/matching'));
app.use('/api/admin/openai', openaiRoutes);

// Demo Routes for testing jobs
app.post('/api/admin/demo/jump-clock', async (req, res) => {
    try {
        await generateTomorrowTrips();
        res.json({ success: true, message: 'Clock jumped and tomorrow trips generated' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/demo/dispatch-trip/:id', async (req, res) => {
    try {
        const result = await dispatchTrip(req.params.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/demo/no-show-trip/:id', async (req, res) => {
    try {
        const result = await handleNoShow(req.params.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/', (req, res) => {
  res.send('RAAHI Backend API is running');
});

// Central error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(PORT, () => {
  console.log(`Backend server with Socket.IO listening at http://localhost:${PORT}`);
});
