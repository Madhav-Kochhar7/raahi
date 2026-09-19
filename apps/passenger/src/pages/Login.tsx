import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Button, Card } from 'shared';
import { Navigation } from 'lucide-react';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('passenger@demo.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.login({ email, password, role: 'passenger' });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <div className="mb-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary glow-primary">
                    <Navigation size={32} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">RAAHI</h1>
                <span className="text-text-muted text-sm font-medium tracking-widest mt-1 uppercase">Passenger</span>
            </div>
            
            <Card className="w-full max-w-sm">
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    {error && <div className="text-secondary bg-secondary/10 p-3 rounded-xl text-sm font-bold text-center">{error}</div>}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-text-muted font-bold uppercase tracking-wider">Email</label>
                        <input 
                            type="email" 
                            className="w-full bg-bg-app border border-border-subtle rounded-xl p-4 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-text-muted font-bold uppercase tracking-wider">Password</label>
                        <input 
                            type="password" 
                            className="w-full bg-bg-app border border-border-subtle rounded-xl p-4 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" fullWidth className="mt-2 text-lg">Continue</Button>
                </form>
            </Card>
        </div>
    );
};
