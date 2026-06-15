import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Sun, Moon, User as UserIcon, LogOut, Settings as SettingsIcon, Shield, Menu, X } from 'lucide-react';
import { api } from '../utils/api';

export default function Navbar({ user, setUser, theme, toggleTheme }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        api.logout();
        setUser(null);
        setDropdownOpen(false);
        setMobileMenuOpen(false);
        navigate('/');
    };

    const isLinkActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 glass-panel border-b px-4 py-3 md:px-8 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-eco-500 rounded" aria-label="EcoTrack AI Home">
                <Leaf className="w-6 h-6 text-eco-500 transform group-hover:rotate-12 transition-transform duration-200" />
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-eco-600 to-emerald-500 bg-clip-text text-transparent">
                    EcoTrack AI
                </span>
            </Link>

            {/* Desktop Navigation Links */}
            {user && (
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/dashboard" className={`text-sm font-medium hover:text-eco-600 transition-colors ${isLinkActive('/dashboard') ? 'text-eco-600 font-bold border-b-2 border-eco-500' : 'text-slate-600 dark:text-slate-300'}`}>Dashboard</Link>
                    <Link to="/calculator" className={`text-sm font-medium hover:text-eco-600 transition-colors ${isLinkActive('/calculator') ? 'text-eco-600 font-bold border-b-2 border-eco-500' : 'text-slate-600 dark:text-slate-300'}`}>Calculator</Link>
                    <Link to="/simulator" className={`text-sm font-medium hover:text-eco-600 transition-colors ${isLinkActive('/simulator') ? 'text-eco-600 font-bold border-b-2 border-eco-500' : 'text-slate-600 dark:text-slate-300'}`}>Simulator</Link>
                    <Link to="/goals" className={`text-sm font-medium hover:text-eco-600 transition-colors ${isLinkActive('/goals') ? 'text-eco-600 font-bold border-b-2 border-eco-500' : 'text-slate-600 dark:text-slate-300'}`}>Goals</Link>
                    <Link to="/challenges" className={`text-sm font-medium hover:text-eco-600 transition-colors ${isLinkActive('/challenges') ? 'text-eco-600 font-bold border-b-2 border-eco-500' : 'text-slate-600 dark:text-slate-300'}`}>Challenges</Link>
                    <Link to="/education" className={`text-sm font-medium hover:text-eco-600 transition-colors ${isLinkActive('/education') ? 'text-eco-600 font-bold border-b-2 border-eco-500' : 'text-slate-600 dark:text-slate-300'}`}>Education</Link>
                </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    aria-label={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
                </button>

                {user ? (
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border transition-all text-slate-700 dark:text-slate-200"
                            aria-expanded={dropdownOpen}
                            aria-haspopup="true"
                        >
                            <div className="w-7 h-7 rounded-full bg-eco-100 dark:bg-eco-900 text-eco-600 dark:text-eco-300 flex items-center justify-center font-bold text-sm">
                                {user.username.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs font-semibold hidden md:inline">{user.username}</span>
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-1 z-50 text-slate-700 dark:text-slate-200 overflow-hidden">
                                <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <UserIcon className="w-4 h-4 text-slate-500" /> My Profile
                                </Link>
                                <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <SettingsIcon className="w-4 h-4 text-slate-500" /> Settings
                                </Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-red-500 dark:text-red-400">
                                        <Shield className="w-4 h-4" /> Admin Dashboard
                                    </Link>
                                )}
                                <hr className="dark:border-slate-800" />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-red-600 dark:text-red-400"
                                >
                                    <LogOut className="w-4 h-4" /> Log Out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="hidden sm:flex items-center gap-2">
                        <Link to="/login" className="px-4 py-1.5 text-sm font-semibold rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors">Sign In</Link>
                        <Link to="/register" className="px-4 py-1.5 text-sm font-semibold rounded-full bg-eco-600 hover:bg-eco-700 text-white shadow-sm transition-colors">Sign Up</Link>
                    </div>
                )}

                {/* Mobile Menu Toggle */}
                {user && (
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 md:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        aria-label="Toggle Navigation Menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                )}
            </div>

            {/* Mobile Navigation Panel */}
            {mobileMenuOpen && user && (
                <div className="absolute top-full left-0 right-0 w-full glass-panel border-b flex flex-col p-4 gap-3 md:hidden z-40 transition-all duration-300">
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">Dashboard</Link>
                    <Link to="/calculator" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">Calculator</Link>
                    <Link to="/simulator" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">Simulator</Link>
                    <Link to="/goals" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">Goals</Link>
                    <Link to="/challenges" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">Challenges</Link>
                    <Link to="/education" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">Education Hub</Link>
                    <hr className="dark:border-slate-800" />
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">Profile</Link>
                    <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">Settings</Link>
                    <button
                        onClick={handleLogout}
                        className="px-3 py-2 text-left rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-medium text-red-600 dark:text-red-400"
                    >
                        Log Out
                    </button>
                </div>
            )}
        </nav>
    );
}
