import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, Button, MapView, BottomTabBar } from 'shared';
import { Star, Home as HomeIcon, Wallet, UserCircle, Phone, MessageSquare, User } from 'lucide-react';

export const ActiveRide: React.FC = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const ride = location.state?.ride || { pickup_address: 'Simulated Pick', drop_address: 'Simulated Drop', total_fare: 50 };
    
    const [ratingMode, setRatingMode] = useState(false);
    const [stars, setStars] = useState(5);
    const [comment, setComment] = useState('');

    const handleRate = async () => {
        try {
            await api.rateRide(Number(id), { stars, comment, to_user: 2 });
            navigate('/');
        } catch (e) {
            console.warn("Rating failed, simulating", e);
            navigate('/');
        }
    };

    if (ratingMode) {
        return (
            <div className="flex flex-col h-screen bg-bg-app">
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary glow-primary">
                            <Star size={32} fill="currentColor" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight mb-2">Ride Completed</h1>
                        <div className="text-4xl font-light text-primary">₹{Number(ride.total_fare).toFixed(2)}</div>
                    </div>
                    
                    <div className="w-full max-w-sm bg-surface-elevated p-6 rounded-3xl border border-border-subtle flex flex-col items-center gap-6 shadow-xl">
                        <h3 className="uppercase tracking-widest text-xs font-bold text-text-muted">Rate your Rider</h3>
                        <div className="flex gap-2 text-primary">
                            {[1,2,3,4,5].map(s => (
                                <Star 
                                    key={s} 
                                    size={36} 
                                    className={`cursor-pointer transition-all hover:scale-110 ${stars >= s ? 'fill-current drop-shadow-[0_0_8px_rgba(198,255,0,0.5)]' : 'opacity-20'}`}
                                    onClick={() => setStars(s)}
                                />
                            ))}
                        </div>
                        <textarea 
                            className="w-full bg-bg-app border border-border-subtle rounded-xl p-4 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-all" 
                            placeholder="Leave a comment (optional)"
                            rows={3}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                        <Button fullWidth onClick={handleRate} className="py-4 text-lg">Submit & Return</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen relative bg-bg-app overflow-hidden">
            <div className="absolute inset-0">
                <MapView lat={30.48} lng={76.59} className="w-full h-full rounded-none border-none" />
                
                {/* Simulated Driver Marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-elevated px-4 py-2 rounded-full border border-border-subtle shadow-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full glow-primary"></div>
                    <span className="text-sm font-bold">Priya M. • 2 min</span>
                </div>
            </div>

            {/* Top PIN Badge */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-surface-elevated/90 backdrop-blur-md px-6 py-3 rounded-full border border-border-subtle shadow-lg flex items-center gap-4 z-20">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">PIN</span>
                <span className="text-xl font-bold tracking-[0.2em] text-primary">1234</span>
            </div>

            {/* Bottom Sheet */}
            <div className="absolute bottom-0 left-0 right-0 bg-bg-app rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 pb-24 pt-2">
                <div className="w-full flex justify-center pb-4">
                    <div className="w-12 h-1 bg-border-subtle rounded-full"></div>
                </div>

                <div className="px-6 pb-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-surface-elevated rounded-full flex items-center justify-center border border-border-subtle">
                                <User size={24} className="text-text-muted" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Priya M.</h2>
                                <div className="text-sm font-medium text-primary flex items-center gap-1">
                                    <Star size={14} fill="currentColor"/> 4.8
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold">₹{Number(ride.total_fare).toFixed(2)}</div>
                            <div className="text-xs text-text-muted font-bold uppercase tracking-wider">Cash</div>
                        </div>
                    </div>

                    <div className="flex gap-3 mb-6">
                        <Button variant="secondary" className="flex-1 py-4 flex gap-2 justify-center rounded-2xl">
                            <MessageSquare size={20} /> Message
                        </Button>
                        <Button variant="secondary" className="flex-1 py-4 flex gap-2 justify-center rounded-2xl">
                            <Phone size={20} /> Call
                        </Button>
                    </div>

                    <Button variant="ghost" fullWidth onClick={() => setRatingMode(true)} className="text-xs uppercase tracking-widest font-bold">
                        Demo: Skip to Completion
                    </Button>
                </div>
            </div>

            {/* Bottom Navigation */}
            <BottomTabBar 
                activeTab="home"
                onTabChange={(id) => navigate(id === 'home' ? '/' : `/${id}`)}
                tabs={[
                    { id: 'home', label: 'Home', icon: <HomeIcon size={22} /> },
                    { id: 'passes', label: 'Passes', icon: <Star size={22} /> },
                    { id: 'wallet', label: 'Wallet', icon: <Wallet size={22} /> },
                    { id: 'profile', label: 'You', icon: <UserCircle size={22} /> },
                ]}
            />
        </div>
    );
};
