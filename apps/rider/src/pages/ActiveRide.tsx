import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, Button, MapView } from 'shared';

export const ActiveRide: React.FC = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const ride = location.state?.ride || { pickup_address: 'Simulated Pick', drop_address: 'Simulated Drop', total_fare: 50 };
    
    const [status, setStatus] = useState<'en_route' | 'arrived' | 'in_progress' | 'completed'>('en_route');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    const handleAction = async () => {
        try {
            if (status === 'en_route') {
                setStatus('arrived');
            } else if (status === 'arrived') {
                if (otp.length !== 4) {
                    setError('Please enter 4-digit OTP');
                    return;
                }
                // Simulate start API
                try { await api.startRide(Number(id), otp); } catch(e) { console.warn("API start failed, simulating", e) }
                setStatus('in_progress');
                setError('');
            } else if (status === 'in_progress') {
                // Simulate complete API
                try { await api.completeRide(Number(id)); } catch(e) { console.warn("API complete failed, simulating", e) }
                setStatus('completed');
            } else if (status === 'completed') {
                navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Action failed');
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="flex-1 relative">
                <MapView lat={30.48} lng={76.59} className="w-full h-full rounded-none border-none" />
                
                {/* Status Overlay */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-full border border-[var(--neon-blue)] text-[var(--neon-blue)] font-bold text-sm tracking-widest uppercase">
                    {status.replace('_', ' ')}
                </div>
            </div>

            <div className="bg-[var(--dark-panel)] border-t border-[var(--neon-blue)] shadow-[0_-5px_20px_rgba(0,243,255,0.2)] rounded-t-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="text-xl font-bold">₹{ride.total_fare.toFixed(2)}</div>
                        <div className="text-sm text-gray-400">Cash Payment</div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-[var(--neon-pink)] uppercase text-sm">Passenger</div>
                        <div className="text-sm text-gray-300">+91 99XXXXXX</div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-[var(--neon-pink)] shadow-[0_0_10px_var(--neon-pink)]" />
                        <div className="text-sm">{ride.pickup_address}</div>
                    </div>
                    {status === 'in_progress' && (
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-[var(--neon-blue)] shadow-[0_0_10px_var(--neon-blue)]" />
                            <div className="text-sm">{ride.drop_address}</div>
                        </div>
                    )}
                </div>

                {error && <div className="text-red-500 text-sm mb-4 font-bold">{error}</div>}

                {status === 'arrived' && (
                    <div className="mb-4">
                        <input 
                            type="text" 
                            placeholder="Enter 4-digit PIN from Passenger" 
                            className="w-full bg-[#11151c] border border-gray-800 rounded p-4 text-center text-xl tracking-[0.5em] font-mono text-white focus:border-[var(--neon-blue)] outline-none"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').substring(0,4))}
                        />
                    </div>
                )}

                <Button fullWidth onClick={handleAction} className="py-4 text-lg">
                    {status === 'en_route' && 'Tap when Arrived'}
                    {status === 'arrived' && 'Start Ride'}
                    {status === 'in_progress' && 'Complete Ride'}
                    {status === 'completed' && 'Back to Map'}
                </Button>
            </div>
        </div>
    );
};
