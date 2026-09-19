import React, { useState } from 'react';
import { Card, Button } from 'shared';
import { Play, Activity, Clock } from 'lucide-react';
import axios from 'axios';

// We bypass the api client wrapper for raw demo control routes if needed,
// but let's just use axios directly for the admin demo endpoints.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const PassDashboard: React.FC = () => {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const jumpClock = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/admin/demo/jump-clock`);
            setStatus(res.data.message);
        } catch(e: any) {
            setStatus('Error: ' + e.message);
        }
        setLoading(false);
    };

    const dispatchTrip = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/admin/demo/dispatch-trip/1`); // Hardcoded trip ID 1 for demo
            setStatus('Trip dispatched! Ride ID: ' + res.data.rideId);
        } catch(e: any) {
            setStatus('Error: ' + e.message);
        }
        setLoading(false);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold tracking-widest text-[var(--neon-blue)] mb-8 uppercase flex items-center gap-3">
                <Activity size={32} />
                Admin Demo Control (Passes & Schedules)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-[var(--neon-pink)]">
                    <h2 className="text-xl font-bold mb-4 uppercase text-[var(--neon-pink)] flex items-center gap-2">
                        <Clock size={20} />
                        Scheduled Trip Engine
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Simulate the nightly cron job (runs at 20:00) that generates all trips for active passes.
                    </p>
                    <Button onClick={jumpClock} disabled={loading} className="flex items-center justify-center gap-2">
                        <Play size={16} /> Fast-Forward Clock to 20:00
                    </Button>
                </Card>

                <Card className="border-[var(--neon-blue)]">
                    <h2 className="text-xl font-bold mb-4 uppercase text-[var(--neon-blue)] flex items-center gap-2">
                        <Activity size={20} />
                        Trip Dispatcher
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Force-dispatch the next scheduled trip. In reality, this runs 5 minutes before the pickup slot.
                    </p>
                    <Button onClick={dispatchTrip} disabled={loading} variant="secondary" className="flex items-center justify-center gap-2 w-full">
                        <Play size={16} /> Dispatch Trip #1
                    </Button>
                </Card>
            </div>

            {status && (
                <div className="mt-8 p-4 bg-black/50 border border-green-500 text-green-400 rounded-lg font-mono text-sm tracking-wider">
                    {'>'} {status}
                </div>
            )}
        </div>
    );
};
