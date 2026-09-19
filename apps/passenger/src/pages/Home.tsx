import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, MapView, Button } from 'shared';
import { Search, MapPin } from 'lucide-react';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const [pickup, setPickup] = useState('Central Bus Stand');
    const [drop, setDrop] = useState('Engineering College');
    const [status, setStatus] = useState<'idle' | 'searching'>('idle');

    const handleRequest = async () => {
        setStatus('searching');
        try {
            // Hardcoded lat/lng for demo matching the script
            const ride = await api.requestRide({
                pickup_lat: 30.48, pickup_lng: 76.59,
                drop_lat: 30.49, drop_lng: 76.60,
                pickup_address: pickup,
                drop_address: drop
            });
            
            // Simulate waiting 3 seconds then pretending rider accepted (in reality rider app accepts)
            setTimeout(() => {
                navigate(`/active/${ride.id || 1}`, { state: { ride } });
            }, 3000);
            
        } catch (err) {
            console.error(err);
            setStatus('idle');
        }
    };

    return (
        <div className="flex flex-col h-screen relative">
            {/* Header */}
            <div className="p-4 bg-[var(--dark-panel)] border-b border-[var(--neon-blue)] z-10 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                <div className="font-bold text-[var(--neon-blue)] tracking-widest flex items-center justify-between">
                    <span>RAAHI</span>
                    <div className="flex gap-4">
                        <button className="text-[var(--text-light)] text-xs uppercase hover:text-[var(--neon-pink)]" onClick={() => navigate('/chat')}>AI Chat</button>
                        <button className="text-[var(--text-light)] text-xs uppercase hover:text-white" onClick={() => navigate('/safety')}>Safety</button>
                        <button className="text-[var(--text-light)] text-xs uppercase hover:text-white" onClick={() => navigate('/passes')}>Passes</button>
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative">
                <MapView lat={30.48} lng={76.59} className="w-full h-full rounded-none border-none" />
                
                {status === 'searching' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-t-[var(--neon-pink)] border-r-transparent border-b-[var(--neon-blue)] border-l-transparent animate-spin mb-4" />
                        <h2 className="text-[var(--neon-blue)] font-bold tracking-widest uppercase">Finding Your Rider...</h2>
                    </div>
                )}
            </div>

            {/* Request Panel */}
            <div className="bg-[var(--dark-panel)] border-t border-[var(--neon-blue)] shadow-[0_-5px_20px_rgba(0,243,255,0.2)] rounded-t-2xl p-6">
                <div className="flex flex-col gap-4 mb-6">
                    <div className="relative">
                        <div className="absolute left-3 top-3 text-[var(--neon-pink)]"><MapPin size={20} /></div>
                        <input 
                            className="w-full bg-[#11151c] border border-gray-800 rounded p-3 pl-10 text-white focus:border-[var(--neon-blue)] outline-none" 
                            value={pickup} onChange={e => setPickup(e.target.value)} placeholder="Pickup Location"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute left-3 top-3 text-[var(--neon-blue)]"><Search size={20} /></div>
                        <input 
                            className="w-full bg-[#11151c] border border-gray-800 rounded p-3 pl-10 text-white focus:border-[var(--neon-blue)] outline-none" 
                            value={drop} onChange={e => setDrop(e.target.value)} placeholder="Where to?"
                        />
                    </div>
                </div>

                <Button fullWidth onClick={handleRequest} className="py-4 text-lg shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                    Request Ride
                </Button>
            </div>
        </div>
    );
};
