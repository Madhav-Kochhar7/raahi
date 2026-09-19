import React, { useState } from 'react';
import { Card } from 'shared';
import { ShieldAlert, Mic, AlertTriangle, ArrowLeft } from 'lucide-react';
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
        <div className="flex flex-col min-h-screen p-6 relative bg-bg-app">
            <button className="text-primary mb-6 flex items-center gap-2 hover:opacity-80 transition-opacity font-bold tracking-widest text-sm uppercase" onClick={() => navigate('/')}>
                <ArrowLeft size={16}/> Back
            </button>

            <h1 className="text-3xl font-bold tracking-tight mb-8 flex items-center gap-3">
                <ShieldAlert className="text-secondary" size={32} /> Safety Center
            </h1>

            <Card className="mb-8 border-secondary/30 bg-secondary/5">
                <div className="text-center py-8">
                    <button 
                        onClick={handleSOS}
                        className={`w-36 h-36 rounded-full flex flex-col items-center justify-center mx-auto mb-6 transition-all ${sosActive ? 'bg-secondary shadow-[0_0_60px_rgba(255,107,61,0.6)] animate-pulse' : 'bg-secondary shadow-[0_0_30px_rgba(255,107,61,0.3)] hover:scale-105'}`}
                    >
                        <AlertTriangle size={56} className="text-white mb-2" />
                        <span className="text-white font-bold tracking-widest text-lg">SOS</span>
                    </button>
                    <p className="text-sm text-text-muted px-4 leading-relaxed">
                        Press in case of emergency. Instantly shares live location and ride details with police and emergency contacts.
                    </p>
                </div>
            </Card>

            <Card className="border-primary/30">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
                        <Mic size={20} /> Secure Recording
                    </div>
                    <div 
                        className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors flex-shrink-0 ${safetyMode ? 'bg-primary' : 'bg-surface'}`}
                        onClick={() => setSafetyMode(!safetyMode)}
                    >
                        <div className={`w-6 h-6 bg-bg-app rounded-full transition-transform ${safetyMode ? 'translate-x-6' : ''}`} />
                    </div>
                </div>
                <p className="text-text-muted text-sm mb-6 leading-relaxed">
                    When enabled, the app continuously records secure, encrypted audio of your ride and monitors route deviations.
                </p>
                {safetyMode && (
                    <div className="bg-bg-app border border-primary/50 rounded-xl p-4 flex items-center justify-center gap-3 text-primary font-bold text-sm">
                        <div className="w-3 h-3 rounded-full bg-secondary animate-pulse shadow-[0_0_10px_rgba(255,107,61,0.8)]"></div> Recording Active
                    </div>
                )}
            </Card>
        </div>
    );
};
