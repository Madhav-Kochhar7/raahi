import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from 'shared';
import { ArrowLeft, Clock, CalendarDays, MapPin } from 'lucide-react';

export const Schedule: React.FC = () => {
    const navigate = useNavigate();
    
    // In a real app we'd fetch from an API like /api/rides/schedule
    // Since we didn't define a dedicated endpoint for rider schedule in Stage 3, we mock it for the UI demo.
    const [scheduledTrips] = useState([
        {
            id: 1,
            time: "07:45 AM",
            date: "Tomorrow",
            passenger: "Test Passenger",
            pickup: "Model Town Gate",
            drop: "College Main Gate",
            status: "Assigned"
        },
        {
            id: 2,
            time: "17:15 PM",
            date: "Tomorrow",
            passenger: "Test Passenger",
            pickup: "College Main Gate",
            drop: "Model Town Gate",
            status: "Assigned"
        }
    ]);

    return (
        <div className="flex flex-col min-h-screen p-6 relative bg-[var(--dark-bg)]">
            <button className="text-[var(--neon-pink)] mb-6 flex items-center gap-2" onClick={() => navigate('/')}>
                <ArrowLeft size={16}/> Back to Map
            </button>
            
            <h1 className="text-2xl font-bold tracking-widest text-white mb-6 uppercase flex items-center gap-3">
                <CalendarDays className="text-[var(--neon-pink)]"/> My Schedule
            </h1>

            <p className="text-gray-400 text-sm mb-6">Upcoming rides automatically assigned to you via RAAHI ML matching.</p>

            <div className="flex flex-col gap-4">
                {scheduledTrips.map(trip => (
                    <Card key={trip.id} className="border-[var(--neon-blue)] bg-black/50 hover:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 text-[var(--neon-blue)]">
                                <Clock size={16} />
                                <span className="font-bold text-lg">{trip.time}</span>
                                <span className="text-xs text-gray-400">({trip.date})</span>
                            </div>
                            <Badge>{trip.status}</Badge>
                        </div>

                        <div className="flex flex-col gap-3 mb-4">
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin size={14} className="text-[var(--neon-pink)]" />
                                <span>{trip.pickup}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin size={14} className="text-[var(--neon-blue)]" />
                                <span>{trip.drop}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-gray-800 pt-3">
                            <span className="text-sm text-gray-400 uppercase tracking-widest">{trip.passenger}</span>
                            <Button variant="secondary" className="py-1 px-3 text-xs">Confirm</Button>
                        </div>
                    </Card>
                ))}
                
                {scheduledTrips.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        No upcoming scheduled trips.
                    </div>
                )}
            </div>
        </div>
    );
};
