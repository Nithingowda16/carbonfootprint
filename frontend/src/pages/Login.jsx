import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Leaf, HelpCircle } from 'lucide-react';
import { api } from '../utils/api';

export default function Login({ setUser }) {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotMsg, setForgotMsg] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!loginId || !password) {
            setError('Please enter both login credentials');
            return;
        }
        setLoading(true);
        try {
            const data = await api.login(loginId, password);
            setUser(data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setForgotMsg('');
        if (!forgotEmail) {
            setError('Please enter your email address');
            return;
        }
        setLoading(true);
        try {
            const data = await api.forgotPassword(forgotEmail);
            setForgotMsg(data.message || 'Password reset link sent to your email.');
            if (data.reset_token) {
                // For demonstration, display the reset token
                setForgotMsg(prev => prev + ` (Demo Token: ${data.reset_token})`);
            }
        } catch (err) {
            setError(err.message || 'Request failed. Please try again.');
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
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
                        {forgotMode ? 'Reset Password' : 'Welcome Back'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {forgotMode ? 'Get instructions to access your account' : 'Log in to track your carbon reduction progress'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold">
                        {error}
                    </div>
                )}

                {forgotMsg && (
                    <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold">
                        {forgotMsg}
                    </div>
                )}

                {forgotMode ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="forgot-email">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="forgot-email"
                                    type="email"
                                    required
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    placeholder="yourname@domain.com"
                                    className="w-full bg-white dark:bg-slate-800 border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-eco-500 focus:outline-none dark:border-slate-700 text-slate-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-xl bg-eco-600 hover:bg-eco-700 text-white font-bold text-sm shadow-md shadow-eco-500/15 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => { setForgotMode(false); setError(''); setForgotMsg(''); }}
                            className="w-full text-center text-xs text-eco-600 dark:text-eco-400 font-semibold hover:underline"
                        >
                            Back to Login
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5" htmlFor="login-id">
                                Email or Username
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="login-id"
                                    type="text"
                                    required
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    placeholder="Enter username or email"
                                    className="w-full bg-white dark:bg-slate-800 border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-eco-500 focus:outline-none dark:border-slate-700 text-slate-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400" htmlFor="login-password">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setForgotMode(true)}
                                    className="text-xs text-eco-600 dark:text-eco-400 hover:underline font-semibold"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-xl bg-eco-600 hover:bg-eco-700 text-white font-bold text-sm shadow-md shadow-eco-500/15 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
                        </button>

                        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-eco-600 dark:text-eco-400 font-bold hover:underline">
                                Sign Up
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
