import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { PassDashboard } from './pages/PassDashboard';
import { Charts } from './pages/Charts';
import { Activity, Ticket, MapPin } from 'lucide-react';

const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    
    return (
        <div className="flex h-screen bg-bg-app text-text-primary overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-surface-elevated border-r border-border-subtle flex flex-col">
                <div className="p-6 border-b border-border-subtle flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary glow-primary">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold tracking-tight text-xl text-text-primary">RAAHI</h1>
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Admin Portal</span>
                    </div>
                </div>
                
                <div className="flex-1 p-4 flex flex-col gap-2">
                    <Link to="/passes" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold uppercase tracking-wider text-xs ${location.pathname === '/passes' ? 'bg-primary text-bg-app shadow-[0_0_15px_rgba(198,255,0,0.3)]' : 'text-text-muted hover:bg-surface hover:text-text-primary'}`}>
                        <Ticket size={18} /> Pass Engine
                    </Link>
                    <Link to="/charts" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold uppercase tracking-wider text-xs ${location.pathname === '/charts' ? 'bg-primary text-bg-app shadow-[0_0_15px_rgba(198,255,0,0.3)]' : 'text-text-muted hover:bg-surface hover:text-text-primary'}`}>
                        <Activity size={18} /> ML Demand
                    </Link>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

function App() {
    return (
        <div className="min-h-screen bg-bg-app text-text-primary selection:bg-primary/30 selection:text-primary">
            <BrowserRouter>
                <SidebarLayout>
                    <Routes>
                        <Route path="/" element={<Navigate to="/passes" />} />
                        <Route path="/passes" element={<PassDashboard />} />
                        <Route path="/charts" element={<Charts />} />
                    </Routes>
                </SidebarLayout>
            </BrowserRouter>
        </div>
    );
}

export default App;
