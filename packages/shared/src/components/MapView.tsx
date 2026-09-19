import React from 'react';

interface MapViewProps {
    lat: number;
    lng: number;
    zoom?: number;
    className?: string;
    markers?: Array<{ lat: number; lng: number; title?: string }>;
}

export const MapView: React.FC<MapViewProps> = ({ lat, lng, zoom = 14, className = '', markers = [] }) => {
    // Basic mock implementation using an iframe for demo. 
    // In production, use @react-google-maps/api.
    // For free/demo purposes, we just embed an OSM or raw map if no API key is provided,
    // or simulate a map canvas with CSS. Let's build a stylized mock map for the sleek look.

    return (
        <div className={`relative overflow-hidden rounded-xl border border-[var(--neon-blue)] ${className}`} style={{ minHeight: '300px', backgroundColor: '#11151c' }}>
            {/* Simulated Map Grid Background */}
            <div className="absolute inset-0 opacity-20" 
                 style={{ 
                     backgroundImage: 'linear-gradient(rgba(0, 243, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.2) 1px, transparent 1px)', 
                     backgroundSize: '20px 20px' 
                 }} />
            
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[var(--neon-blue)] opacity-50 font-mono text-sm tracking-widest">MAP FEED ACTIVE</span>
            </div>
            
            {/* Simulated Center Marker */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--neon-pink)] shadow-[0_0_15px_var(--neon-pink)] z-10" />
            
            {/* Simulated Additional Markers */}
            {markers.map((m, i) => (
                <div key={i} className="absolute w-3 h-3 rounded-full bg-[var(--neon-blue)] shadow-[0_0_10px_var(--neon-blue)]"
                     style={{ 
                         // Very rough translation of lat/lng to percentage for demo effect
                         left: `${50 + (m.lng - lng) * 1000}%`, 
                         top: `${50 - (m.lat - lat) * 1000}%` 
                     }}
                />
            ))}
        </div>
    );
};
