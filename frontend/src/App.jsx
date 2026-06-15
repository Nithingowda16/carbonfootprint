import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatbotWidget from './components/ChatbotWidget';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Simulator from './pages/Simulator';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import EducationHub from './pages/EducationHub';
import CommunityChallenges from './pages/CommunityChallenges';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import { api } from './utils/api';

function ProtectedRoute({ user, children }) {
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

export default function App() {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('ecotrack_theme') || 'light');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize Theme
        if (theme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('ecotrack_token');
        if (token) {
            try {
                const profile = await api.getProfile();
                setUser(profile);
            } catch (err) {
                console.warn("Session expired or invalid token");
                api.logout();
            }
        }
        setLoading(false);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('ecotrack_theme', newTheme);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0b0f19]">
                <div className="w-10 h-10 border-4 border-eco-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <Router>
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-200">
                <Navbar user={user} setUser={setUser} theme={theme} toggleTheme={toggleTheme} />
                
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<LandingPage user={user} />} />
                        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />} />
                        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register setUser={setUser} />} />
                        
                        <Route path="/dashboard" element={<ProtectedRoute user={user}><Dashboard user={user} setUser={setUser} /></ProtectedRoute>} />
                        <Route path="/calculator" element={<ProtectedRoute user={user}><Calculator setUser={setUser} /></ProtectedRoute>} />
                        <Route path="/simulator" element={<ProtectedRoute user={user}><Simulator /></ProtectedRoute>} />
                        <Route path="/goals" element={<ProtectedRoute user={user}><Goals setUser={setUser} /></ProtectedRoute>} />
                        <Route path="/reports" element={<ProtectedRoute user={user}><Reports /></ProtectedRoute>} />
                        <Route path="/education" element={<ProtectedRoute user={user}><EducationHub /></ProtectedRoute>} />
                        <Route path="/challenges" element={<ProtectedRoute user={user}><CommunityChallenges setUser={setUser} /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute user={user}><Profile user={user} setUser={setUser} /></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute user={user}><Settings theme={theme} toggleTheme={toggleTheme} /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute user={user}><AdminDashboard user={user} /></ProtectedRoute>} />
                        
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                
                {/* AI Chatbot Assist FAB Widget */}
                <ChatbotWidget user={user} />
                
                <footer className="py-6 text-center border-t border-slate-200 dark:border-slate-900 bg-white/20 dark:bg-slate-950/10 text-[10px] text-slate-400">
                    <p>© 2026 EcoTrack AI Inc. All rights reserved. Let's make every day greener!</p>
                </footer>
            </div>
        </Router>
    );
}
