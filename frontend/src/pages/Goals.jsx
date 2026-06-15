import React, { useState, useEffect } from 'react';
import { Leaf, Award, Plus, Target, CheckCircle, HelpCircle } from 'lucide-react';
import { api } from '../utils/api';

export default function Goals({ setUser }) {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Form states
    const [category, setCategory] = useState('overall');
    const [targetReduction, setTargetReduction] = useState(10);
    const [frequency, setFrequency] = useState('weekly');

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const data = await api.getGoals();
            setGoals(data || []);
        } catch (err) {
            console.error("Failed to load goals", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        try {
            const newGoal = await api.createGoal(category, targetReduction, frequency);
            setSuccessMsg('Goal created successfully!');
            fetchGoals();
        } catch (err) {
            setError(err.message || 'Failed to create goal');
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
                    <Target className="w-8 h-8 text-eco-600 animate-float" /> Goal Tracking
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
                    Commit to reduction milestones and track your progress daily. Earn massive XP when they expire!
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
                {/* Creation Form */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm md:col-span-1 space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm pb-2 border-b dark:border-slate-800 flex items-center gap-1">
                        <Plus className="w-4 h-4 text-eco-600" /> Create a Goal
                    </h3>
                    
                    <form onSubmit={handleCreateGoal} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                            >
                                <option value="overall">Overall Footprint</option>
                                <option value="transport">Transportation</option>
                                <option value="home">Home Energy</option>
                                <option value="food">Diet & Food</option>
                                <option value="waste">Waste Management</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Reduction %</label>
                            <select
                                value={targetReduction}
                                onChange={(e) => setTargetReduction(Number(e.target.value))}
                                className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                            >
                                <option value="5">5% (Easy)</option>
                                <option value="10">10% (Moderate)</option>
                                <option value="15">15% (Recommended)</option>
                                <option value="20">20% (Challenging)</option>
                                <option value="30">30% (Eco-Warrior)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Frequency</label>
                            <select
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                            >
                                <option value="weekly">Weekly (7 Days)</option>
                                <option value="monthly">Monthly (30 Days)</option>
                                <option value="annual">Annual (365 Days)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-eco-600 hover:bg-eco-700 text-white font-bold rounded-xl text-xs shadow-md shadow-eco-500/10 transition-all"
                        >
                            Activate Goal
                        </button>
                    </form>
                </div>

                {/* Goals Progress list */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm md:col-span-2 space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm pb-2 border-b dark:border-slate-800 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-eco-600" /> Active Commitments
                    </h3>

                    {goals.length > 0 ? (
                        <div className="space-y-6">
                            {goals.map((goal) => (
                                <div key={goal.id} className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 space-y-3 relative overflow-hidden">
                                    <div className="flex justify-between items-center text-xs">
                                        <div>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{goal.category} Reduction</span>
                                            <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[8px] font-bold uppercase">{goal.frequency}</span>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                                            goal.status === 'completed'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : (goal.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800')
                                        }`}>
                                            {goal.status}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                                            <span>Progress</span>
                                            <span>{goal.progress_pct}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${
                                                    goal.status === 'completed' ? 'bg-emerald-500' : (goal.status === 'failed' ? 'bg-red-500' : 'bg-eco-500')
                                                }`}
                                                style={{ width: `${goal.progress_pct}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400">
                                        <div>
                                            <span className="block font-bold">Target limit:</span>
                                            <span className="text-slate-600 dark:text-slate-300 font-bold">{goal.target_co2} kg CO₂ / day</span>
                                        </div>
                                        <div>
                                            <span className="block font-bold">End Date:</span>
                                            <span className="text-slate-600 dark:text-slate-300 font-bold">{goal.end_date}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 flex flex-col items-center justify-center">
                            <Award className="w-12 h-12 text-slate-300 mb-2" />
                            <p className="text-xs text-slate-400">You don't have active carbon goals.</p>
                            <p className="text-[10px] text-slate-400 mt-1">Select a category and target percentage to activate one!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
