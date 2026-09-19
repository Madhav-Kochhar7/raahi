import React, { useEffect, useState } from 'react';
import { Card, Button } from 'shared';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, BrainCircuit, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Charts: React.FC = () => {
    const [metrics, setMetrics] = useState<any[]>([]);
    const [explanation, setExplanation] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch real ML metrics from backend
        axios.get(`${API_URL}/demand/metrics`)
            .then(res => setMetrics(res.data.metrics || []))
            .catch(console.error);
    }, []);

    const explainDemand = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/admin/openai/explain-demand`, { metrics });
            setExplanation(res.data.explanation);
        } catch (e: any) {
            setExplanation("Simulated Explanation: The demand is heavily skewed towards zones 1 and 4 during the morning college rush. The model correctly predicts a spike at 8 AM. To optimize, dispatch 30% more idle drivers to Zone 1 between 7:30 AM and 8:30 AM.");
        }
        setLoading(false);
    };

    return (
        <div className="p-10 max-w-7xl mx-auto flex flex-col h-full min-h-screen">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">ML Demand Forecasting</h1>
                    <p className="text-text-muted font-medium">Predictive analytics powered by RAAHI ML.</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/30 flex items-center gap-2 font-bold text-sm tracking-wider uppercase glow-primary">
                    <Activity size={16} /> Live Data
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 pb-10">
                <Card className="flex flex-col border-border-subtle hover:border-primary/30 transition-colors h-[600px]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Activity size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Predicted Demand by Zone</h2>
                    </div>
                    
                    <div className="flex-1 w-full min-h-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics} margin={{ top: 20, right: 20, bottom: 40, left: 0 }}>
                                <XAxis dataKey="zone_id" stroke="#4A5568" tick={{ fill: '#A0AEC0' }} dy={10} />
                                <YAxis stroke="#4A5568" tick={{ fill: '#A0AEC0' }} dx={-10} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0B0F17', border: '1px solid #1E293B', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                    itemStyle={{ color: '#C6FF00' }}
                                    labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
                                />
                                <Bar dataKey="predicted_demand" fill="var(--color-primary)" name="Predicted Rides" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                
                <Card className="flex flex-col border-border-subtle hover:border-secondary/30 transition-colors h-[600px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-secondary/10 transition-colors"></div>
                    
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shadow-[0_0_15px_rgba(255,107,61,0.2)]">
                                <BrainCircuit size={20} />
                            </div>
                            <h2 className="text-xl font-bold">AI Analysis</h2>
                        </div>
                        <Button onClick={explainDemand} disabled={loading} variant="secondary" className="text-xs px-4 py-2 h-auto flex items-center gap-2 bg-secondary/10 hover:bg-secondary/20 border-secondary/30">
                            <Sparkles size={14} /> Analyze
                        </Button>
                    </div>
                    
                    <div className="flex-1 bg-bg-app border border-border-subtle rounded-2xl p-6 overflow-y-auto relative z-10">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-secondary">
                                <div className="w-12 h-12 rounded-full border-2 border-secondary border-t-transparent animate-spin"></div>
                                <div className="font-bold text-sm tracking-widest uppercase animate-pulse">Analyzing model weights...</div>
                            </div>
                        ) : explanation ? (
                            <div className="text-text-primary leading-relaxed font-medium">
                                {explanation}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center gap-4 text-text-muted">
                                <BrainCircuit size={48} className="opacity-20" />
                                <span className="max-w-xs font-medium">Click "Analyze" to generate an AI explanation of current demand patterns and actionable insights.</span>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};
