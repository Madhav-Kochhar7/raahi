import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Card, Button, Badge } from 'shared';
import { ArrowLeft, CheckCircle2, ShieldCheck, Ticket } from 'lucide-react';

export const Passes: React.FC = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<any[]>([]);
    const [myPasses, setMyPasses] = useState<any[]>([]);
    const [isRegularRiderEnabled, setIsRegularRiderEnabled] = useState(true);

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
        <div className="flex flex-col min-h-screen p-6 relative bg-bg-app">
            <button className="text-primary mb-6 flex items-center gap-2 hover:opacity-80 transition-opacity font-bold tracking-widest text-sm uppercase" onClick={() => navigate('/')}>
                <ArrowLeft size={16}/> Back
            </button>
            
            <h1 className="text-3xl font-bold tracking-tight mb-8">Commute Passes</h1>

            <Card className="mb-8 border-primary/30 flex items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <ShieldCheck size={20} />
                        <span className="font-bold tracking-widest text-xs uppercase">Regular Rider Trust</span>
                    </div>
                    <p className="text-sm text-text-muted mt-1 leading-snug">Auto-assign verified riders for your commute.</p>
                </div>
                <div 
                    className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors flex-shrink-0 ${isRegularRiderEnabled ? 'bg-primary' : 'bg-surface'}`}
                    onClick={() => setIsRegularRiderEnabled(!isRegularRiderEnabled)}
                >
                    <div className={`w-6 h-6 bg-bg-app rounded-full transition-transform ${isRegularRiderEnabled ? 'translate-x-6' : ''}`} />
                </div>
            </Card>

            {myPasses.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">My Active Passes</h2>
                    {myPasses.map(pass => (
                        <Card key={pass.id} className="mb-4 bg-primary/5 border-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-1 text-primary">
                                        <Ticket size={20}/>
                                        <div className="font-bold text-lg">Active Route Pass</div>
                                    </div>
                                    <div className="text-sm text-text-muted font-medium">Valid until {new Date(pass.end_date).toLocaleDateString()}</div>
                                </div>
                                <Badge variant="primary" className="text-sm px-3 py-1.5">{pass.trips_remaining} Trips Left</Badge>
                            </div>
                            
                            <div className="bg-bg-app/50 p-4 rounded-xl border border-border-subtle flex justify-between items-center relative z-10 backdrop-blur-sm">
                                <div>
                                    <div className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1.5">Tomorrow's Trip</div>
                                    <div className="text-sm font-bold flex items-center gap-2 text-text-primary">
                                        <CheckCircle2 size={16} className="text-primary" />
                                        Scheduled (Demo Rider)
                                    </div>
                                </div>
                                <Button variant="secondary" className="px-4 py-2 text-xs h-auto">View</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Available Plans</h2>
            <div className="flex flex-col gap-4">
                {plans.map(plan => (
                    <Card key={plan.id} className="hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-lg text-text-primary">{plan.route_name}</h3>
                                <div className="text-sm text-text-muted mt-1 font-medium">{plan.trips_included} trips • {plan.validity_days} days</div>
                            </div>
                            <div className="text-2xl font-light text-primary tracking-tight">₹{plan.price}</div>
                        </div>
                        <Button fullWidth onClick={() => handlePurchase(plan.id)} className="mt-4">Purchase Pass</Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};
