import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import ResetPassword from './pages/ResetPassword';

const ProtectedRoute = ({ children, role }) => {
    const { isAuthenticated, user, loading } = useAuthStore();
    
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    
    if (!isAuthenticated) return <Navigate to="/login" />;
    
    // Doctor first login check
    if (user?.role === 'Doctor' && user?.isFirstLogin && window.location.pathname !== '/reset-password') {
        return <Navigate to="/reset-password" />;
    }

    if (role && user?.role !== role) {
        return <Navigate to="/" />; // Redirect to home or their respective dashboard
    }

    return children;
};

function App() {
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <Router>
            <div className="min-h-screen bg-slate-50 text-slate-800">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    
                    <Route path="/admin" element={
                        <ProtectedRoute role="Admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/doctor" element={
                        <ProtectedRoute role="Doctor">
                            <DoctorDashboard />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/patient" element={
                        <ProtectedRoute role="Patient">
                            <PatientDashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
