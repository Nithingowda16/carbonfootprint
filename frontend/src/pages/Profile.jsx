import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Award, Flame, ShieldAlert, CheckCircle, Save } from 'lucide-react';
import { api } from '../utils/api';

export default function Profile({ user, setUser }) {
    const [gamification, setGamification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const [error, setError] = useState('');

    // Form inputs
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');

    useEffect(() => {
        fetchGamificationData();
    }, []);

    const fetchGamificationData = async () => {
        setLoading(true);
        try {
            const data = await api.getGamification();
            setGamification(data);
        } catch (error) {
            console.error("Failed to load gamification data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        try {
            const updatedUser = await api.updateProfile({ username, email, password });
            setUser(updatedUser);
            setSuccessMsg('Profile updated successfully!');
            setPassword('');
            fetchGamificationData();
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="w-10 h-10 border-4 border-eco-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mb-2 flex items-center justify-center gap-2">
                    <UserIcon className="w-8 h-8 text-eco-600 animate-float" /> My Eco Profile
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
                    Manage your account settings, inspect unlocked badges, and review your status on the global leaderboards.
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-5 h-5" /> {successMsg}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Account Details Form */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm md:col-span-1 space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm pb-2 border-b dark:border-slate-800 flex items-center gap-1">
                        Profile details
                    </h3>
                    
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border rounded-xl pl-9 pr-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border rounded-xl pl-9 pr-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Change Password (optional)</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-eco-600 hover:bg-eco-700 text-white font-bold rounded-xl text-xs shadow-md shadow-eco-500/10 flex items-center justify-center gap-1.5 transition-all"
                        >
                            <Save className="w-4 h-4" /> Save Profile
                        </button>
                    </form>
                </div>

                {/* Achievements and Leaderboard */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm md:col-span-2 space-y-6">
                    {/* Unlocked Badges */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm pb-2 border-b dark:border-slate-800 flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-eco-600" /> Unlocked Eco-Achievements ({gamification?.badges?.length || 0})
                        </h3>

                        {gamification?.badges?.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {gamification.badges.map((ach) => (
                                    <div
                                        key={ach.id}
                                        className="px-3.5 py-2 rounded-xl bg-eco-50 dark:bg-eco-950/20 border border-eco-100 dark:border-eco-900/50 flex items-center gap-2"
                                    >
                                        <Award className="w-4 h-4 text-eco-600" />
                                        <div className="text-left">
                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">{ach.badge_name}</span>
                                            <span className="text-[9px] text-slate-400 block">Unlocked {ach.unlocked_at.slice(0, 10)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 py-2">You haven't unlocked any badges yet. Log carbon choices or set goals to win achievements!</p>
                        )}
                    </div>

                    {/* Global Leaderboard */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm pb-2 border-b dark:border-slate-800 flex items-center gap-1.5">
                            <Flame className="w-4 h-4 text-amber-500" /> Global Leaderboard (Top 5)
                        </h3>

                        <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-xl">
                            <table className="w-full text-left border-collapse text-xs text-slate-700 dark:text-slate-300">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold border-b dark:border-slate-800">
                                        <th className="p-3">Rank</th>
                                        <th className="p-3">Username</th>
                                        <th className="p-3 text-right">XP Points</th>
                                        <th className="p-3 text-right">Green Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gamification?.leaderboard?.slice(0, 5).map((l, index) => (
                                        <tr key={index} className="border-b dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                            <td className="p-3 font-bold">{index + 1}</td>
                                            <td className="p-3 font-semibold flex items-center gap-1.5">
                                                {l.username} {l.username === user.username && <span className="text-[8px] bg-eco-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">You</span>}
                                            </td>
                                            <td className="p-3 text-right font-semibold">{l.xp} XP</td>
                                            <td className="p-3 text-right text-eco-600 font-bold">{l.green_points} GP</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
