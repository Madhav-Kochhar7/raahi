import React, { useEffect, useState } from 'react';
import { Card, Button } from 'shared';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, BrainCircuit } from 'lucide-react';
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
        <div className="p-8">
            <h1 className="text-3xl font-bold tracking-widest text-[var(--neon-blue)] mb-8 uppercase flex items-center gap-3">
                <Activity size={32} />
                ML Demand Forecasting
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card className="border-[var(--neon-blue)] h-96">
                    <h2 className="text-lg font-bold mb-4 uppercase text-[var(--neon-blue)]">Predicted Demand by Zone</h2>
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={metrics}>
                            <XAxis dataKey="zone_id" stroke="#8884d8" />
                            <YAxis stroke="#8884d8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2833', border: '1px solid #00f3ff' }}/>
                            <Bar dataKey="predicted_demand" fill="var(--neon-blue)" name="Predicted Rides" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                
                <Card className="border-[var(--neon-pink)] h-96">
                    <h2 className="text-lg font-bold mb-4 uppercase text-[var(--neon-pink)] flex items-center justify-between">
                        <div>
                            <BrainCircuit className="inline mr-2" size={20}/>
                            Demand Explanation
                        </div>
                        <Button onClick={explainDemand} disabled={loading} variant="secondary" className="text-xs px-3 py-1">
                            Ask OpenAI
                        </Button>
                    </h2>
                    
                    <div className="bg-[#11151c] border border-gray-800 rounded p-4 h-[calc(100%-4rem)] overflow-y-auto text-gray-300 leading-relaxed font-mono text-sm">
                        {loading ? (
                            <div className="animate-pulse flex items-center gap-2 text-[var(--neon-pink)]">
                                <BrainCircuit className="animate-spin" size={16} /> Analyzing model weights...
                            </div>
                        ) : explanation ? (
                            explanation
                        ) : (
                            <span className="text-gray-600">Click "Ask OpenAI" to generate an AI explanation of current demand patterns and actionable insights.</span>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};
