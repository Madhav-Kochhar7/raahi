import React, { useState } from 'react';
import { Card, Button } from 'shared';
import { Play, Activity, Clock, Terminal } from 'lucide-react';
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
            const res = await axios.post(`${API_URL}/api/admin/demo/jump-clock`);
            setStatus(res.data.message);
        } catch(e: any) {
            setStatus('Error: ' + e.message);
        }
        setLoading(false);
    };

    const dispatchTrip = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/admin/demo/dispatch-trip/1`);
            setStatus(`Dispatch result: ${JSON.stringify(res.data)}`);
        } catch(e: any) {
            setStatus('Error: ' + e.message);
        }
        setLoading(false);
    };

    return (
        <div className="p-10 max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Control Center</h1>
            <p className="text-text-muted mb-10 font-medium">Manage simulation events and background tasks.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-secondary/30 hover:border-secondary/60 transition-colors">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-6 shadow-[0_0_20px_rgba(255,107,61,0.2)]">
                        <Clock size={24} />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Scheduled Trip Engine</h2>
                    <p className="text-text-muted text-sm mb-8 leading-relaxed h-10">
                        Simulate the nightly cron job (runs at 20:00) that generates all trips for active passes.
                    </p>
                    <Button onClick={jumpClock} disabled={loading} variant="secondary" fullWidth className="flex items-center justify-center gap-2">
                        <Play size={16} /> Fast-Forward Clock to 20:00
                    </Button>
                </Card>

                <Card className="border-primary/30 hover:border-primary/60 transition-colors">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 glow-primary">
                        <Activity size={24} />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Trip Dispatcher</h2>
                    <p className="text-text-muted text-sm mb-8 leading-relaxed h-10">
                        Force-dispatch the next scheduled trip. In reality, this runs 5 minutes before the pickup slot.
                    </p>
                    <Button onClick={dispatchTrip} disabled={loading} fullWidth className="flex items-center justify-center gap-2">
                        <Play size={16} /> Dispatch Trip #1
                    </Button>
                </Card>
            </div>

            {status && (
                <div className="mt-10 p-6 bg-surface-elevated border border-primary/30 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
                    <div className="flex items-center gap-3 mb-4 text-primary">
                        <Terminal size={18} />
                        <span className="font-bold text-xs uppercase tracking-widest">System Output</span>
                    </div>
                    <div className="font-mono text-sm text-text-primary break-all">
                        {status}
                    </div>
                </div>
            )}
        </div>
    );
};
