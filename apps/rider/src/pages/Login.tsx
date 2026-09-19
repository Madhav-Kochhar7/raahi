import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Button, Card } from 'shared';
import { MapPin } from 'lucide-react';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('rider@demo.com');
    const [password, setPassword] = useState('Demo@1234');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.login({ email, password, role: 'rider' });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <div className="text-[var(--neon-pink)] mb-8 flex flex-col items-center">
                <MapPin size={48} />
                <h1 className="text-3xl font-bold mt-2 tracking-widest uppercase">RAAHI</h1>
                <span className="text-[var(--neon-blue)] tracking-widest text-sm">RIDER PORTAL</span>
            </div>
            
            <Card className="w-full">
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    {error && <div className="text-red-500 text-sm font-bold">{error}</div>}
                    <div>
                        <label className="text-xs text-[var(--text-light)] uppercase tracking-wide">Email</label>
                        <input 
                            type="email" 
                            className="w-full bg-[#11151c] border border-gray-800 rounded p-3 mt-1 text-white focus:border-[var(--neon-blue)] outline-none" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-[var(--text-light)] uppercase tracking-wide">Password</label>
                        <input 
                            type="password" 
                            className="w-full bg-[#11151c] border border-gray-800 rounded p-3 mt-1 text-white focus:border-[var(--neon-blue)] outline-none" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" fullWidth className="mt-4">Login as Rider</Button>
                </form>
            </Card>
        </div>
    );
};
