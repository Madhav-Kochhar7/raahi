import React, { useState } from 'react';
import { Card } from 'shared';
import { ShieldAlert, Mic, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Safety: React.FC = () => {
    const navigate = useNavigate();
    const [safetyMode, setSafetyMode] = useState(false);
    const [sosActive, setSosActive] = useState(false);

    const handleSOS = () => {
        setSosActive(true);
        // Simulate backend call
        alert("CRITICAL: SOS Alert sent to local authorities and RAAHI response team. Location broadcasting activated.");
    };

    return (
        <div className="flex flex-col min-h-screen p-6 relative">
            <button className="text-[var(--neon-blue)] mb-6" onClick={() => navigate('/')}>
                Back to Map
            </button>

            <h1 className="text-2xl font-bold tracking-widest text-white mb-6 uppercase flex items-center gap-3">
                <ShieldAlert className="text-red-500"/> Safety Center
            </h1>

            <Card className="mb-8 border-red-500/50 bg-red-900/10">
                <div className="text-center py-6">
                    <button 
                        onClick={handleSOS}
                        className={`w-32 h-32 rounded-full flex flex-col items-center justify-center mx-auto mb-4 transition-all ${sosActive ? 'bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.8)] animate-pulse' : 'bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:bg-red-600 hover:scale-105'}`}
                    >
                        <AlertTriangle size={48} className="text-white mb-2" />
                        <span className="text-white font-bold tracking-widest">SOS</span>
                    </button>
                    <p className="text-sm text-gray-300">
                        Press in case of emergency. Instantly shares live location and ride details with police and emergency contacts.
                    </p>
                </div>
            </Card>

            <Card className="border-[var(--neon-blue)]">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-[var(--neon-blue)] font-bold uppercase tracking-wider">
                        <Mic size={20} /> Safety Mode
                    </div>
                    <div 
                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${safetyMode ? 'bg-[var(--neon-blue)]' : 'bg-gray-700'}`}
                        onClick={() => setSafetyMode(!safetyMode)}
                    >
                        <div className={`w-4 h-4 bg-black rounded-full transition-transform ${safetyMode ? 'translate-x-6' : ''}`} />
                    </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                    When enabled, the app continuously records secure, encrypted audio of your ride and monitors route deviations.
                </p>
                {safetyMode && (
                    <div className="bg-[#11151c] border border-[var(--neon-blue)] rounded p-3 flex items-center justify-center gap-2 text-[var(--neon-blue)] animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div> Recording Active
                    </div>
                )}
            </Card>
        </div>
    );
};
