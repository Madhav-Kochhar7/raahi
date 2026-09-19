
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PassDashboard } from './pages/PassDashboard';
import { Charts } from './pages/Charts';

function App() {
    return (
        <div className="admin-app-container">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/passes" />} />
                    <Route path="/passes" element={<PassDashboard />} />
                    <Route path="/charts" element={<Charts />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
