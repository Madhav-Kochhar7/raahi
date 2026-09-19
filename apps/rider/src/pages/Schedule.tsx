import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from 'shared';
import { ArrowLeft, Clock, CalendarDays, MapPin } from 'lucide-react';

export const Schedule: React.FC = () => {
    const navigate = useNavigate();
    
    // In a real app we'd fetch from an API like /api/rides/schedule
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
        <div className="flex flex-col min-h-screen p-6 relative bg-bg-app">
            <button className="text-primary mb-6 flex items-center gap-2 hover:opacity-80 transition-opacity font-bold tracking-widest text-sm uppercase" onClick={() => navigate('/')}>
                <ArrowLeft size={16}/> Back
            </button>
            
            <h1 className="text-3xl font-bold tracking-tight mb-4 flex items-center gap-3">
                <CalendarDays className="text-primary"/> My Schedule
            </h1>

            <p className="text-text-muted text-sm mb-8 leading-snug">Upcoming rides automatically assigned to you via RAAHI matching.</p>

            <div className="flex flex-col gap-4">
                {scheduledTrips.map(trip => (
                    <Card key={trip.id} className="border-border-subtle hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-2 text-primary">
                                <Clock size={20} />
                                <span className="font-bold text-xl">{trip.time}</span>
                                <span className="text-sm text-text-muted font-medium ml-1">({trip.date})</span>
                            </div>
                            <Badge variant="primary">{trip.status}</Badge>
                        </div>

                        <div className="bg-surface rounded-xl p-4 mb-4">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-sm font-bold">
                                    <MapPin size={16} className="text-secondary" />
                                    <span>{trip.pickup}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold">
                                    <MapPin size={16} className="text-primary" />
                                    <span>{trip.drop}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-border-subtle pt-4 mt-2">
                            <span className="text-xs text-text-muted uppercase tracking-wider font-bold">Pass: {trip.passenger}</span>
                            <Button variant="secondary" className="py-2 px-4 text-xs h-auto">Confirm</Button>
                        </div>
                    </Card>
                ))}
                
                {scheduledTrips.length === 0 && (
                    <div className="text-center text-text-muted py-12 flex flex-col items-center">
                        <CalendarDays size={48} className="opacity-20 mb-4" />
                        <span className="font-medium">No upcoming scheduled trips.</span>
                    </div>
                )}
            </div>
        </div>
    );
};
