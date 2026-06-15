import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Leaf, Award, Compass, Zap, CheckCircle, Flame, Plus, Download, ChevronRight, Activity } from 'lucide-react';
import { api } from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard({ user, setUser }) {
    const [summary, setSummary] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [aiInsights, setAiInsights] = useState([]);
    const [goals, setGoals] = useState([]);
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLogSuccess, setActionLogSuccess] = useState('');

    // Predefined quick action options matching simple actions module
    const quickActions = [
        { key: 'walk_short', title: 'Walk short commute', type: 'transport', co2: 1.2, cash: 1.5, diff: 'easy' },
        { key: 'led_bulbs', title: 'Install LED bulbs', type: 'home', co2: 3.5, cash: 8.0, diff: 'easy' },
        { key: 'meat_free_day', title: 'Meat-Free Day', type: 'food', co2: 4.7, cash: 10.0, diff: 'easy' },
        { key: 'recycle_plastic', title: 'Recycle Plastics', type: 'waste', co2: 0.8, cash: 2.0, diff: 'easy' }
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const sumData = await api.getSummary();
            setSummary(sumData);
            
            const recData = await api.getRecommendations();
            setRecommendations(recData.recommendations || []);
            setAiInsights(recData.ai_insights || []);
            
            const goalsData = await api.getGoals();
            setGoals(goalsData || []);
            
            const actData = await api.getActions();
            setActions(actData || []);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogAction = async (act) => {
        setActionLogSuccess('');
        try {
            const data = await api.logAction(act.key, act.type, act.co2, act.cash, act.diff);
            setActionLogSuccess(`Logged action: "${act.title}"! +15 XP`);
            if (data.user) {
                setUser(data.user);
            }
            // Refetch summary and logged actions
            const updatedSummary = await api.getSummary();
            setSummary(updatedSummary);
            const updatedActions = await api.getActions();
            setActions(updatedActions);
        } catch (error) {
            console.error("Failed to log action", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="w-10 h-10 border-4 border-eco-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Chart configs
    const doughnutData = {
        labels: ['Transportation', 'Home Energy', 'Food Habits', 'Waste'],
        datasets: [
            {
                data: [
                    summary?.transport_emissions || 0,
                    summary?.home_emissions || 0,
                    summary?.food_emissions || 0,
                    summary?.waste_emissions || 0
                ],
                backgroundColor: ['#22c55e', '#3b82f6', '#eab308', '#ec4899'],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: document.body.classList.contains('dark') ? '#94a3b8' : '#475569',
                    font: { size: 11 }
                }
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            {/* Top Header Card */}
            <div className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md border-eco-100/50">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                        Welcome back, {user.username}! <Leaf className="w-7 h-7 text-eco-600 animate-float" />
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                        Track your daily impact. Current Streak: <span className="font-extrabold text-eco-600 inline-flex items-center gap-1"><Flame className="w-4 h-4 fill-amber-500 text-amber-500" /> {user.streak} Days</span>
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Link
                        to="/calculator"
                        className="px-5 py-2.5 bg-eco-600 hover:bg-eco-700 text-white rounded-full font-bold text-xs shadow-md shadow-eco-500/10 flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" /> Log Emissions
                    </Link>
                    <button
                        onClick={() => api.downloadReport()}
                        className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold text-xs flex items-center gap-1.5"
                    >
                        <Download className="w-4 h-4" /> Download PDF Report
                    </button>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-2xl border-l-4 border-eco-500">
                    <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Carbon Score</span>
                    <span className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 block">{summary?.carbon_score}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Higher means cleaner diet & travel</span>
                </div>
                <div className="glass-card p-5 rounded-2xl border-l-4 border-blue-500">
                    <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Sustainability Score</span>
                    <span className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 block">{summary?.sustainability_score}%</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Based on recycling & offsets</span>
                </div>
                <div className="glass-card p-5 rounded-2xl border-l-4 border-yellow-500">
                    <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Daily Avg Emissions</span>
                    <span className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 block">{summary?.avg_emissions} <span className="text-xs font-normal">kg CO₂</span></span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Target limit: 10 kg CO₂</span>
                </div>
                <div className="glass-card p-5 rounded-2xl border-l-4 border-pink-500">
                    <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Eco Level</span>
                    <span className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 block">{user.level}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Green Points: {user.green_points} GP</span>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl shadow-sm md:col-span-1 flex flex-col items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm self-start mb-6">Emissions Breakdown</h3>
                    {summary?.records_count > 0 ? (
                        <div className="w-48 h-48 sm:w-56 sm:h-56">
                            <Doughnut data={doughnutData} options={chartOptions} />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                            <Leaf className="w-10 h-10 text-slate-300 mb-2" />
                            <p className="text-xs text-slate-400">No calculation data registered yet. Run the calculator first.</p>
                        </div>
                    )}
                </div>

                {/* AI Recommendations Panel */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm md:col-span-2">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5"><Compass className="w-4 h-4 text-eco-500" /> AI-Powered Eco Recommendations</h3>
                    
                    {aiInsights.length > 0 && (
                        <div className="mb-4 p-3 bg-eco-50 dark:bg-eco-950/20 border border-eco-100 dark:border-eco-900/40 rounded-xl text-xs text-eco-800 dark:text-eco-300">
                            {aiInsights[0]}
                        </div>
                    )}

                    <div className="space-y-3">
                        {recommendations.slice(0, 3).map((rec, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{rec.title}</h4>
                                    <p className="text-[10px] text-slate-400 mt-1">{rec.description}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="px-2 py-0.5 rounded bg-eco-100 dark:bg-eco-900/50 text-eco-700 dark:text-eco-300 text-[9px] font-bold">-{rec.co2_saving} kg CO₂</span>
                                        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[9px] font-bold">Saved: ${rec.cost_saving}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleLogAction({ key: rec.key, title: rec.title, type: rec.category, co2: rec.co2_saving / 7, cash: rec.cost_saving / 7, diff: rec.difficulty })}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-eco-600 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-white dark:hover:text-white text-xs font-bold rounded-lg transition-all"
                                >
                                    Log Task
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions & Goals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Simple Actions Logger */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Log Simple Daily Green Actions</h3>
                    <p className="text-[10px] text-slate-400 mb-4">Click any green choice to log it and earn XP instantly.</p>

                    {actionLogSuccess && (
                        <div className="mb-4 p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" /> {actionLogSuccess}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((act) => (
                            <button
                                key={act.key}
                                onClick={() => handleLogAction(act)}
                                className="p-3 border rounded-xl hover:border-eco-600 dark:border-slate-800 hover:bg-eco-50/20 text-left transition-all flex flex-col group relative overflow-hidden"
                            >
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-eco-600">{act.title}</span>
                                <span className="text-[10px] text-slate-400 mt-1">Saves {act.co2} kg CO₂</span>
                                <ChevronRight className="w-4 h-4 text-slate-400 absolute right-2 bottom-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Goals Progress */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5"><Activity className="w-4 h-4 text-eco-600" /> Active Carbon Goals</h3>
                    
                    {goals.length > 0 ? (
                        <div className="space-y-4">
                            {goals.slice(0, 3).map((goal) => (
                                <div key={goal.id} className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-bold text-slate-700 dark:text-slate-200 capitalize">{goal.category} Reduction ({goal.frequency})</span>
                                        <span className="text-slate-400 font-bold">{goal.progress_pct}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div
                                            className="bg-eco-500 h-2 rounded-full transition-all"
                                            style={{ width: `${goal.progress_pct}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[9px] text-slate-400">
                                        Target: Limit average daily emissions to {goal.target_co2} kg | Predicted Success: {goal.predicted_success_rate}%
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-6 h-full">
                            <Award className="w-10 h-10 text-slate-300 mb-2" />
                            <p className="text-xs text-slate-400">You don't have active goals yet.</p>
                            <Link to="/goals" className="text-eco-600 text-xs font-bold hover:underline mt-2">Create a Goal</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
