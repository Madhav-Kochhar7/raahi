import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface MapViewProps {
    lat: number;
    lng: number;
    zoom?: number;
    className?: string;
    markers?: Array<{ lat: number; lng: number; title?: string }>;
}

declare var process: any;

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] }
];

export const MapView: React.FC<MapViewProps> = ({ lat, lng, zoom = 14, className = '', markers = [] }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || ''
    });

    if (!isLoaded) {
        return (
            <div className={`relative overflow-hidden rounded-xl border border-[var(--neon-blue)] ${className} flex items-center justify-center`} style={{ minHeight: '300px', backgroundColor: '#11151c' }}>
                <span className="text-[var(--neon-blue)] opacity-50 font-mono text-sm tracking-widest">LOADING MAP...</span>
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden rounded-xl border border-[var(--neon-blue)] ${className}`} style={{ minHeight: '300px' }}>
            {/* @ts-ignore */}
            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%', minHeight: '300px' }}
                center={{ lat, lng }}
                zoom={zoom}
                options={{
                    styles: darkMapStyle,
                    disableDefaultUI: true,
                    zoomControl: true,
                }}
            >
                {/* Center marker for passenger/driver */}
                {/* @ts-ignore */}
                <Marker 
                    position={{ lat, lng }} 
                    icon={{
                        path: 'M -5,0 A 5,5 0 1,1 5,0 A 5,5 0 1,1 -5,0',
                        fillColor: '#C6FF00', // Lime
                        fillOpacity: 1,
                        strokeColor: 'rgba(198, 255, 0, 0.3)', // Lime halo
                        strokeWeight: 6,
                        scale: 1.5
                    }} 
                />

                {/* Additional markers */}
                {markers.map((m, i) => (
                    /* @ts-ignore */
                    <Marker 
                        key={i} 
                        position={{ lat: m.lat, lng: m.lng }} 
                        title={m.title}
                        icon={{
                            path: 'M -4,0 A 4,4 0 1,1 4,0 A 4,4 0 1,1 -4,0',
                            fillColor: '#FF6B3D', // Coral
                            fillOpacity: 1,
                            strokeColor: 'rgba(255, 107, 61, 0.3)',
                            strokeWeight: 4,
                            scale: 1.2
                        }}
                    />
                ))}
            </GoogleMap>
        </div>
    );
};
