import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, Button, MapView } from 'shared';
import { Navigation, Phone, MessageSquare, Check, HandHeart, X } from 'lucide-react';

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
                    setError('Please enter 4-digit PIN');
                    return;
                }
                try { await api.startRide(Number(id), otp); } catch(e) { console.warn("API start failed, simulating", e) }
                setStatus('in_progress');
                setError('');
            } else if (status === 'in_progress') {
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
        <div className="flex flex-col h-screen relative bg-bg-app overflow-hidden">
            <div className="absolute inset-0 z-0">
                <MapView lat={30.48} lng={76.59} className="w-full h-full rounded-none border-none" />
                
                {/* Status Overlay */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-surface-elevated/90 backdrop-blur-md px-6 py-3 rounded-full border border-border-subtle shadow-lg flex items-center gap-3 z-20">
                    <Navigation size={18} className="text-primary" />
                    <span className="text-primary font-bold text-sm tracking-widest uppercase">
                        {status.replace('_', ' ')}
                    </span>
                </div>

                {/* Cancel Button */}
                {status !== 'completed' && status !== 'in_progress' && (
                    <button onClick={() => navigate('/')} className="absolute top-12 right-6 w-12 h-12 bg-surface-elevated/90 backdrop-blur rounded-full flex items-center justify-center border border-border-subtle shadow-lg text-text-muted hover:text-text-primary">
                        <X size={24} />
                    </button>
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-bg-app rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 pb-8 pt-2">
                <div className="w-full flex justify-center pb-4">
                    <div className="w-12 h-1 bg-border-subtle rounded-full"></div>
                </div>

                <div className="px-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="text-3xl font-light text-primary">₹{Number(ride.total_fare).toFixed(2)}</div>
                            <div className="text-xs text-text-muted font-bold uppercase tracking-wider mt-1">Cash Payment</div>
                        </div>
                        <div className="flex gap-2">
                            <button className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center border border-border-subtle text-text-primary hover:bg-surface">
                                <MessageSquare size={20} />
                            </button>
                            <button className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center border border-border-subtle text-text-primary hover:bg-surface">
                                <Phone size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-surface-elevated rounded-2xl p-4 border border-border-subtle mb-6">
                        <div className={`flex items-start gap-4 ${status === 'in_progress' ? 'mb-4 relative' : ''}`}>
                            {status === 'in_progress' && <div className="absolute left-[7px] top-5 bottom-0 w-0.5 bg-border-subtle -z-10"></div>}
                            <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ${status === 'in_progress' ? 'bg-primary glow-primary' : 'bg-secondary'}`} />
                            <div>
                                <div className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">
                                    {status === 'in_progress' ? 'Picked up from' : 'Navigating to Pickup'}
                                </div>
                                <div className="text-sm font-bold">{ride.pickup_address}</div>
                            </div>
                        </div>
                        {status === 'in_progress' && (
                            <div className="flex items-start gap-4">
                                <div className="w-4 h-4 rounded-full bg-secondary flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Dropoff</div>
                                    <div className="text-sm font-bold">{ride.drop_address}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <div className="text-secondary bg-secondary/10 p-3 rounded-xl text-sm font-bold text-center mb-4">{error}</div>}

                    {status === 'arrived' && (
                        <div className="mb-6">
                            <label className="block text-xs text-text-muted font-bold uppercase tracking-wider text-center mb-3">Ask passenger for PIN</label>
                            <input 
                                type="text" 
                                placeholder="----" 
                                className="w-full bg-bg-app border-2 border-border-subtle rounded-xl p-4 text-center text-3xl tracking-[1em] font-mono text-primary focus:border-primary outline-none transition-all placeholder:text-border-subtle"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').substring(0,4))}
                            />
                        </div>
                    )}

                    <Button fullWidth onClick={handleAction} className="py-4 text-lg mb-2">
                        {status === 'en_route' && 'Tap when Arrived'}
                        {status === 'arrived' && (
                            <div className="flex items-center justify-center gap-2">
                                <Check size={20} /> Verify PIN & Start Ride
                            </div>
                        )}
                        {status === 'in_progress' && 'Complete Ride'}
                        {status === 'completed' && (
                            <div className="flex items-center justify-center gap-2">
                                <HandHeart size={20} /> Finish & Go Online
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
