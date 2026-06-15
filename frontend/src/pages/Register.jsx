import React, { useState } from 'react';
import { Leaf, Mail, User as UserIcon, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register({ setUser }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const data = await api.register(username, email, password);
            setUser(data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try another username or email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/30 dark:bg-transparent">
            <div className="w-full max-w-md p-8 rounded-2xl glass-card relative overflow-hidden">
                {/* Decorative gradients */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-eco-200/40 rounded-full blur-2xl dark:bg-eco-900/20"></div>
                <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-200/40 rounded-full blur-2xl dark:bg-emerald-900/20"></div>

                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 bg-eco-100 dark:bg-eco-950/50 rounded-2xl mb-2 text-eco-600">
                        <Leaf className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Create an Account</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Start your journey to carbon neutrality today</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="username">
                            Username
                        </label>
                        <div className="relative">
                            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="choose_username"
                                className="w-full bg-white dark:bg-slate-800 border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-eco-500 focus:outline-none dark:border-slate-700 text-slate-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="email">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@domain.com"
                                className="w-full bg-white dark:bg-slate-800 border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-eco-500 focus:outline-none dark:border-slate-700 text-slate-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="minimum 6 characters"
                                className="w-full bg-white dark:bg-slate-800 border rounded-xl pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-eco-500 focus:outline-none dark:border-slate-700 text-slate-700 dark:text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="confirm-password">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                id="confirm-password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="repeat password"
                                className="w-full bg-white dark:bg-slate-800 border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-eco-500 focus:outline-none dark:border-slate-700 text-slate-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl bg-eco-600 hover:bg-eco-700 text-white font-bold text-sm shadow-md shadow-eco-500/15 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Get Started'} <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-eco-600 dark:text-eco-400 font-bold hover:underline">
                            Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
