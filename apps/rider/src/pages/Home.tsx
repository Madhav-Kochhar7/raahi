import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, MapView, Button, Card, Badge } from 'shared';
import { Power, Flame } from 'lucide-react';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(false);
    const [hotspots, setHotspots] = useState<any[]>([]);
    
    // Simulated ride request
    const [incomingRide, setIncomingRide] = useState<any>(null);

    useEffect(() => {
        // Fetch hotspots
        api.getHotspots().then(res => setHotspots(res.hotspots || res)).catch(console.error);
        
        // Simulating a websocket/polling for new ride requests when online
        let interval: any;
        if (isOnline) {
            interval = setInterval(() => {
                // Mock pinging a ride request
                // In a real app we'd poll or use WS
                // For demo, we just randomly pop up a ride request
                if (Math.random() > 0.8 && !incomingRide) {
                    setIncomingRide({
                        id: 1, // Mock ride ID (assume 1 was created by script)
                        pickup_address: "Model Town Gate",
                        drop_address: "College Main Gate",
                        total_fare: 65.00,
                        distance_km: 3.5,
                        pickup_lat: 30.4805,
                        pickup_lng: 76.5885
                    });
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isOnline, incomingRide]);

    const handleAccept = async () => {
        try {
            // Need a valid ride ID in DB, we assume ID 1 exists or fails gracefully
            // Let's navigate to active ride directly for UI demo purposes if API fails
            try {
                await api.acceptRide(incomingRide.id);
            } catch(e) { console.warn("API accept failed, simulating acceptance for demo", e) }
            navigate(`/active/${incomingRide.id}`, { state: { ride: incomingRide } });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col h-screen relative">
            {/* Header */}
            <div className="p-4 bg-[var(--dark-panel)] border-b border-gray-800 flex justify-between items-center z-10">
                <div className="font-bold text-[var(--neon-pink)] tracking-widest flex items-center gap-4">
                    RAAHI RIDER
                    <button className="text-[var(--text-light)] text-xs uppercase hover:text-white" onClick={() => navigate('/schedule')}>Schedule</button>
                </div>
                <button 
                    onClick={() => setIsOnline(!isOnline)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold uppercase text-xs tracking-wider transition-all ${isOnline ? 'bg-[var(--neon-blue)] text-black shadow-[0_0_15px_var(--neon-blue)]' : 'bg-gray-800 text-gray-400'}`}
                >
                    <Power size={14} />
                    {isOnline ? 'Online' : 'Offline'}
                </button>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative">
                <MapView 
                    lat={30.48} lng={76.59} 
                    className="w-full h-full rounded-none border-none"
                    markers={hotspots.map((_h: any) => ({ lat: 30.48 + (Math.random()*0.02 - 0.01), lng: 76.59 + (Math.random()*0.02 - 0.01) }))}
                />
                
                {/* Hotspot overlay */}
                {isOnline && hotspots.length > 0 && (
                    <div className="absolute top-4 left-4 right-4 z-10">
                        <Card className="bg-black/80 backdrop-blur border border-[var(--neon-pink)] p-3">
                            <div className="flex items-center gap-2 text-[var(--neon-pink)] mb-2">
                                <Flame size={16} />
                                <span className="font-bold text-sm tracking-wider">DEMAND HOTSPOTS</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {hotspots.map((h, i) => (
                                    <Badge key={i} className={h.demand_level === 'HIGH' ? 'bg-pink-900/50 text-pink-400 border-pink-400' : ''}>
                                        Zone {h.zone_id}: {h.demand_level}
                                    </Badge>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Incoming Ride Overlay */}
            {incomingRide && (
                <div className="absolute inset-x-4 bottom-4 z-20">
                    <Card className="border-[var(--neon-blue)] shadow-[0_0_20px_rgba(0,243,255,0.3)] animate-pulse">
                        <div className="text-center mb-4">
                            <h3 className="text-[var(--neon-blue)] font-bold text-lg uppercase tracking-wider mb-1">New Ride Request</h3>
                            <div className="text-3xl font-light">₹{Number(incomingRide.total_fare).toFixed(2)}</div>
                            <div className="text-gray-400 text-sm">{incomingRide.distance_km} km</div>
                        </div>
                        
                        <div className="flex flex-col gap-2 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[var(--neon-pink)]" />
                                <div className="text-sm">{incomingRide.pickup_address}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[var(--neon-blue)]" />
                                <div className="text-sm">{incomingRide.drop_address}</div>
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                            <Button variant="secondary" className="flex-1" onClick={() => setIncomingRide(null)}>Decline</Button>
                            <Button className="flex-1" onClick={handleAccept}>Accept</Button>
                        </div>
                    </Card>
                </div>
            )}
            
            {/* Offline overlay */}
            {!isOnline && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-center">
                        <Power size={48} className="mx-auto text-gray-500 mb-4" />
                        <h2 className="text-xl font-bold tracking-widest text-gray-300">YOU ARE OFFLINE</h2>
                        <p className="text-gray-500 text-sm mt-2">Go online to receive ride requests</p>
                    </div>
                </div>
            )}
        </div>
    );
};
