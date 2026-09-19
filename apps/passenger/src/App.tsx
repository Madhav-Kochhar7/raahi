import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { ActiveRide } from './pages/ActiveRide';
import { Passes } from './pages/Passes';
import { Safety } from './pages/Safety';
import { Chat } from './pages/Chat';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const token = localStorage.getItem('raahi_token');
    return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
    return (
        <div className="passenger-app-container">
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/active/:id" element={<PrivateRoute><ActiveRide /></PrivateRoute>} />
                    <Route path="/passes" element={<PrivateRoute><Passes /></PrivateRoute>} />
                    <Route path="/safety" element={<PrivateRoute><Safety /></PrivateRoute>} />
                    <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
