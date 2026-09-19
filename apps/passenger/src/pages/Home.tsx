import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, MapView, LocationInput, ListRow, BottomTabBar, Button } from 'shared';
import { Star, User, History, Home as HomeIcon, Map as MapIcon, Wallet, UserCircle } from 'lucide-react';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const [pickup, setPickup] = useState('');
    const [drop, setDrop] = useState('');
    const [status, setStatus] = useState<'idle' | 'searching'>('idle');

    const handleRequest = async () => {
        if (!pickup || !drop) return;
        setStatus('searching');
        try {
            const ride = await api.requestRide({
                pickup_lat: 30.48, pickup_lng: 76.59,
                drop_lat: 30.49, drop_lng: 76.60,
                pickup_address: pickup,
                drop_address: drop
            });
            setTimeout(() => {
                navigate(`/active/${ride.id || 1}`, { state: { ride } });
            }, 3000);
        } catch (err) {
            console.error(err);
            setStatus('idle');
        }
    };

    return (
        <div className="flex flex-col h-screen relative bg-bg-app overflow-hidden">
            {/* Map Area */}
            <div className="absolute inset-0">
                <MapView lat={30.48} lng={76.59} className="w-full h-full rounded-none border-none" />
                
                {/* Simulated Driver Marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] bg-surface-elevated px-4 py-2 rounded-full border border-border-subtle shadow-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full glow-primary"></div>
                    <span className="text-sm font-bold">Priya M. • 4 min • <Star size={12} className="inline text-primary" fill="currentColor"/> 4.8</span>
                </div>

                {status === 'searching' && (
                    <div className="absolute inset-0 bg-bg-app/80 backdrop-blur-md z-10 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-t-primary border-r-transparent border-b-secondary border-l-transparent animate-spin mb-4" />
                        <h2 className="text-primary font-bold tracking-widest uppercase">Finding Rider...</h2>
                    </div>
                )}
            </div>

            {/* Bottom Sheet */}
            <div className="absolute bottom-0 left-0 right-0 bg-bg-app rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 pb-28 pt-2">
                {/* Drag Handle */}
                <div className="w-full flex justify-center pb-4">
                    <div className="w-12 h-1 bg-border-subtle rounded-full"></div>
                </div>

                <div className="px-6 pb-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Where to?</h1>
                            <p className="text-sm text-text-muted mt-1">4 riders nearby</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-primary hover:bg-surface transition-colors">
                                <Star size={18} fill="currentColor" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-text-primary hover:bg-surface transition-colors">
                                <User size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mb-6">
                        <LocationInput 
                            variant="pickup" 
                            placeholder="Pickup location"
                            value={pickup}
                            onChange={(e) => setPickup(e.target.value)}
                        />
                        <LocationInput 
                            variant="destination" 
                            placeholder="Destination"
                            value={drop}
                            onChange={(e) => setDrop(e.target.value)}
                        />
                    </div>

                    {pickup && drop && (
                        <div className="mb-6">
                            <Button fullWidth onClick={handleRequest}>Request Ride</Button>
                        </div>
                    )}

                    <div className="mb-2">
                        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">Recent</h3>
                        <div className="flex flex-col gap-2">
                            <ListRow 
                                icon={<History size={20} />} 
                                title="Central Station" 
                                subtitle="1.2 km away" 
                                onClick={() => { setPickup('Current Location'); setDrop('Central Station'); }}
                            />
                            <ListRow 
                                icon={<History size={20} />} 
                                title="Tech Park Gate 2" 
                                subtitle="3.4 km away" 
                                onClick={() => { setPickup('Current Location'); setDrop('Tech Park Gate 2'); }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <BottomTabBar 
                activeTab="profile"
                onTabChange={(id) => navigate(id === 'profile' ? '/chat' : '/')}
                tabs={[
                    { id: 'home', label: 'Home', icon: <HomeIcon size={22} /> },
                    { id: 'rides', label: 'Rides', icon: <MapIcon size={22} /> },
                    { id: 'wallet', label: 'Wallet', icon: <Wallet size={22} /> },
                    { id: 'profile', label: 'You', icon: <UserCircle size={22} /> },
                ]}
            />
        </div>
    );
};
