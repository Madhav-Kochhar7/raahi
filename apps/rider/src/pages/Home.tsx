import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, MapView, Button, Card, Badge } from 'shared';
import { Power, Flame, CalendarDays, UserCircle, Map as MapIcon } from 'lucide-react';

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
                if (Math.random() > 0.8 && !incomingRide) {
                    setIncomingRide({
                        id: 1, 
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
            try {
                await api.acceptRide(incomingRide.id);
            } catch(e) { console.warn("API accept failed, simulating acceptance for demo", e) }
            navigate(`/active/${incomingRide.id}`, { state: { ride: incomingRide } });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col h-screen relative bg-bg-app overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-6 z-20 flex justify-between items-center bg-gradient-to-b from-bg-app/80 to-transparent">
                <div className="w-10 h-10 bg-surface-elevated/90 backdrop-blur rounded-full flex items-center justify-center border border-border-subtle shadow-lg">
                    <UserCircle size={20} className="text-text-primary" />
                </div>
                
                <div 
                    onClick={() => setIsOnline(!isOnline)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase text-xs tracking-wider transition-all cursor-pointer shadow-xl border ${isOnline ? 'bg-primary text-bg-app border-primary glow-primary' : 'bg-surface-elevated text-text-muted border-border-subtle'}`}
                >
                    <Power size={16} className={isOnline ? '' : 'text-text-muted'} />
                    {isOnline ? 'Online' : 'Go Online'}
                </div>

                <div 
                    onClick={() => navigate('/schedule')}
                    className="w-10 h-10 bg-surface-elevated/90 backdrop-blur rounded-full flex items-center justify-center border border-border-subtle shadow-lg cursor-pointer hover:bg-surface transition-colors"
                >
                    <CalendarDays size={18} className="text-text-primary" />
                </div>
            </div>

            {/* Map Area */}
            <div className="absolute inset-0 z-0">
                <MapView 
                    lat={30.48} lng={76.59} 
                    className="w-full h-full rounded-none border-none"
                    markers={hotspots.map((_h: any) => ({ lat: 30.48 + (Math.random()*0.02 - 0.01), lng: 76.59 + (Math.random()*0.02 - 0.01) }))}
                />
                
                {/* Hotspot overlay */}
                {isOnline && hotspots.length > 0 && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 w-auto whitespace-nowrap">
                        <div className="bg-surface-elevated/90 backdrop-blur-md border border-border-subtle rounded-full p-1.5 flex items-center gap-2 shadow-lg pr-4">
                            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                                <Flame size={16} />
                            </div>
                            <span className="font-bold text-xs uppercase tracking-wider text-text-primary mr-2">Hotspots</span>
                            <div className="flex gap-1.5">
                                {hotspots.slice(0,2).map((h, i) => (
                                    <Badge key={i} variant={h.demand_level === 'HIGH' ? 'secondary' : 'primary'} className="scale-90 origin-left">
                                        Z{h.zone_id}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Incoming Ride Overlay */}
            {incomingRide && (
                <div className="absolute inset-x-0 bottom-0 z-30 bg-bg-app/50 backdrop-blur-sm h-full flex flex-col justify-end">
                    <Card className="rounded-t-[32px] rounded-b-none border-none shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-6 pt-8 animate-in slide-in-from-bottom-full duration-300">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary glow-primary animate-pulse">
                                <MapIcon size={32} />
                            </div>
                            <h3 className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2">New Ride Request</h3>
                            <div className="text-5xl font-light text-text-primary tracking-tight">₹{Number(incomingRide.total_fare).toFixed(2)}</div>
                            <div className="text-text-muted text-sm font-medium mt-2">{incomingRide.distance_km} km • 8 min away</div>
                        </div>
                        
                        <div className="bg-surface-elevated rounded-2xl p-4 border border-border-subtle mb-6">
                            <div className="flex items-start gap-4 mb-4 relative">
                                <div className="absolute left-[7px] top-5 bottom-0 w-0.5 bg-border-subtle -z-10"></div>
                                <div className="w-4 h-4 rounded-full bg-primary flex-shrink-0 mt-0.5 glow-primary" />
                                <div>
                                    <div className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Pickup</div>
                                    <div className="text-sm font-bold">{incomingRide.pickup_address}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-4 h-4 rounded-full bg-secondary flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Dropoff</div>
                                    <div className="text-sm font-bold">{incomingRide.drop_address}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-4 pb-4">
                            <Button variant="secondary" className="flex-1 py-4 text-lg" onClick={() => setIncomingRide(null)}>Decline</Button>
                            <Button className="flex-1 py-4 text-lg" onClick={handleAccept}>Accept</Button>
                        </div>
                    </Card>
                </div>
            )}
            
            {/* Offline overlay */}
            {!isOnline && (
                <div className="absolute inset-0 bg-bg-app/80 backdrop-blur-md z-10 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-surface-elevated flex items-center justify-center mx-auto mb-6 border border-border-subtle">
                            <Power size={32} className="text-text-muted" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-2">You are Offline</h2>
                        <p className="text-text-muted text-sm font-medium">Tap "Go Online" to receive ride requests</p>
                    </div>
                </div>
            )}
        </div>
    );
};
