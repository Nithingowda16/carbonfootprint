import React, { useState, useEffect } from 'react';
import { Shield, Users, TrendingDown, Leaf, Award } from 'lucide-react';
import { api } from '../utils/api';

export default function AdminDashboard({ user }) {
    const [stats, setStats] = useState({
        totalUsers: 148,
        systemAvgScore: 74,
        totalSavingsKg: 12480,
        activeChallenges: 4
    });

    if (!user || user.role !== 'admin') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Access Denied</h2>
                <p className="text-xs text-slate-400 mt-2">You do not have the required administrator privileges to view this page.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mb-2 flex items-center justify-center gap-2">
                    <Shield className="w-8 h-8 text-red-500 animate-float" /> Admin Controller
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-lg mx-auto">
                    Global metrics and system performance configurations for the EcoTrack AI platform.
                </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-2xl border-l-4 border-red-500">
                    <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Total Accounts</span>
                    <span className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1 block">{stats.totalUsers}</span>
                </div>
                <div className="glass-card p-5 rounded-2xl border-l-4 border-eco-500">
                    <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider flex items-center gap-1"><Leaf className="w-3.5 h-3.5" /> System Avg Score</span>
                    <span className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1 block">{stats.systemAvgScore} / 100</span>
                </div>
                <div className="glass-card p-5 rounded-2xl border-l-4 border-blue-500">
                    <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5" /> Cumulative Savings</span>
                    <span className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1 block">{stats.totalSavingsKg} kg</span>
                </div>
                <div className="glass-card p-5 rounded-2xl border-l-4 border-yellow-500">
                    <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Open Programs</span>
                    <span className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1 block">{stats.activeChallenges}</span>
                </div>
            </div>

            {/* System logs view */}
            <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm pb-2 border-b dark:border-slate-800">
                    Database Seed & Configuration Tools
                </h3>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    EcoTrack AI automatically initializes default challenges and maps standard emission factors on startup. To adjust base calculation coefficients, please update the configuration environment variables in your deployment dashboard.
                </p>

                <div className="flex gap-3 pt-2">
                    <button className="px-4 py-2 bg-eco-600 hover:bg-eco-700 text-white rounded-xl text-xs font-bold transition-all">
                        Refresh Database Indices
                    </button>
                    <button className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors">
                        Clear Cache Indexes
                    </button>
                </div>
            </div>
        </div>
    );
}
