import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, Button, MapView } from 'shared';
import { Star } from 'lucide-react';

export const ActiveRide: React.FC = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const ride = location.state?.ride || { pickup_address: 'Simulated Pick', drop_address: 'Simulated Drop', total_fare: 50 };
    
    // In a real app we'd poll or use WS for status. 
    // Here we provide a button to manually advance to rate screen for demo completion.
    const [ratingMode, setRatingMode] = useState(false);
    const [stars, setStars] = useState(5);
    const [comment, setComment] = useState('');

    const handleRate = async () => {
        try {
            await api.rateRide(Number(id), { stars, comment, to_user: 2 }); // Hardcoded rider ID 2 for demo
            navigate('/');
        } catch (e) {
            console.warn("Rating failed, simulating", e);
            navigate('/');
        }
    };

    if (ratingMode) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[var(--neon-blue)] tracking-widest uppercase mb-2">Ride Completed</h1>
                    <div className="text-3xl font-light">₹{ride.total_fare.toFixed(2)}</div>
                </div>
                
                <div className="w-full bg-[var(--dark-panel)] p-6 rounded-xl border border-gray-800 flex flex-col items-center gap-6">
                    <h3 className="uppercase tracking-widest text-sm text-gray-400">Rate your Rider</h3>
                    <div className="flex gap-2 text-[var(--neon-pink)]">
                        {[1,2,3,4,5].map(s => (
                            <Star 
                                key={s} 
                                size={32} 
                                className={`cursor-pointer ${stars >= s ? 'fill-current' : 'opacity-30'}`}
                                onClick={() => setStars(s)}
                            />
                        ))}
                    </div>
                    <textarea 
                        className="w-full bg-[#11151c] border border-gray-800 rounded p-3 text-white focus:border-[var(--neon-blue)] outline-none resize-none" 
                        placeholder="Leave a comment (optional)"
                        rows={3}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                    />
                    <Button fullWidth onClick={handleRate}>Submit & Return</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen relative">
            <div className="flex-1 relative">
                <MapView lat={30.48} lng={76.59} className="w-full h-full rounded-none border-none" />
                
                <div className="absolute top-4 left-4 right-4 bg-black/80 p-4 rounded-xl border border-[var(--neon-pink)] shadow-[0_0_15px_rgba(255,0,234,0.2)] flex justify-between items-center">
                    <div>
                        <div className="text-xs text-gray-400 uppercase tracking-widest">Share this PIN with Rider</div>
                        <div className="text-3xl font-mono tracking-[0.2em] font-bold text-[var(--neon-pink)] mt-1">1234</div>
                    </div>
                </div>
            </div>

            <div className="bg-[var(--dark-panel)] border-t border-[var(--neon-blue)] rounded-t-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="text-xl font-bold">Rider En Route</div>
                        <div className="text-sm text-[var(--neon-blue)]">Arriving in 3 mins</div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold uppercase text-sm">Demo Rider</div>
                        <div className="text-sm text-gray-300 flex items-center gap-1 justify-end"><Star size={12} className="text-yellow-500 fill-current"/> 4.8</div>
                    </div>
                </div>

                <Button variant="secondary" fullWidth onClick={() => setRatingMode(true)} className="mt-2 text-sm border-gray-700 text-gray-400 shadow-none hover:bg-gray-800">
                    (Demo: Skip to Completion)
                </Button>
            </div>
        </div>
    );
};
