import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Card, Button, Badge } from 'shared';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export const Passes: React.FC = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<any[]>([]);
    const [myPasses, setMyPasses] = useState<any[]>([]);
    const [isRegularRiderEnabled, setIsRegularRiderEnabled] = useState(true); // Trust toggle

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const p = await api.getPassPlans();
            setPlans(p);
            const m = await api.getMyPasses();
            setMyPasses(m);
        } catch(e) { console.error(e) }
    };

    const handlePurchase = async (id: number) => {
        try {
            await api.purchasePass(id);
            fetchData();
        } catch(e: any) {
            alert(e.response?.data?.error || "Purchase failed");
        }
    };

    return (
        <div className="flex flex-col min-h-screen p-6 relative">
            <button className="text-[var(--neon-blue)] mb-6 flex items-center gap-2" onClick={() => navigate('/')}>
                <ArrowLeft size={16}/> Back
            </button>
            
            <h1 className="text-2xl font-bold tracking-widest text-white mb-6 uppercase">Commute Pass Hub</h1>

            {/* Regular Rider Trust Toggle */}
            <Card className="mb-8 border-[var(--neon-pink)] flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-[var(--neon-pink)] mb-1">
                        <ShieldCheck size={18} />
                        <span className="font-bold tracking-widest text-sm uppercase">Regular Rider Trust</span>
                    </div>
                    <p className="text-xs text-gray-400">Allow RAAHI to auto-assign verified riders for your commute.</p>
                </div>
                <div 
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${isRegularRiderEnabled ? 'bg-[var(--neon-pink)]' : 'bg-gray-700'}`}
                    onClick={() => setIsRegularRiderEnabled(!isRegularRiderEnabled)}
                >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isRegularRiderEnabled ? 'translate-x-6' : ''}`} />
                </div>
            </Card>

            {myPasses.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">My Active Passes</h2>
                    {myPasses.map(pass => (
                        <Card key={pass.id} className="mb-4 bg-black/50 border border-[var(--neon-blue)]">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="font-bold text-[var(--neon-blue)] text-lg">Active Route Pass</div>
                                    <div className="text-sm text-gray-400">Valid until {new Date(pass.end_date).toLocaleDateString()}</div>
                                </div>
                                <Badge>{pass.trips_remaining} Trips Left</Badge>
                            </div>
                            
                            {/* Simulated upcoming trip for demo */}
                            <div className="bg-[#11151c] p-3 rounded-lg border border-gray-800 flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tomorrow's Trip</div>
                                    <div className="text-sm font-bold flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-green-500" />
                                        Scheduled (Demo Rider)
                                    </div>
                                </div>
                                <Button variant="secondary" className="px-3 py-1 text-xs">View</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Available Plans</h2>
            <div className="flex flex-col gap-4">
                {plans.map(plan => (
                    <Card key={plan.id}>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-lg">{plan.route_name}</h3>
                            <div className="text-xl text-[var(--neon-blue)] font-light">₹{plan.price}</div>
                        </div>
                        <div className="text-sm text-gray-400 mb-4">{plan.trips_included} trips • {plan.validity_days} days</div>
                        <Button fullWidth onClick={() => handlePurchase(plan.id)}>Purchase Pass</Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};
