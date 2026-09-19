import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { ActiveRide } from './pages/ActiveRide';
import { Schedule } from './pages/Schedule';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const token = localStorage.getItem('raahi_token');
    return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
    return (
        <div className="min-h-screen bg-bg-app text-text-primary selection:bg-primary/30 selection:text-primary">
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/active/:id" element={<PrivateRoute><ActiveRide /></PrivateRoute>} />
                    <Route path="/schedule" element={<PrivateRoute><Schedule /></PrivateRoute>} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
