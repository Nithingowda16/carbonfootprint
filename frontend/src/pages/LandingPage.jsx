import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, Shield, Globe, Award, Sparkles, TrendingDown } from 'lucide-react';

export default function LandingPage({ user }) {
    const [co2SavedInput, setCo2SavedInput] = useState(50);
    
    // 22 kg CO2 absorbed by one tree per year
    const treesEquivalent = (co2SavedInput / 22).toFixed(2);

    return (
        <div className="relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 opacity-20">
                <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-eco-400 blur-3xl"></div>
                <div className="absolute top-40 right-10 w-96 h-96 rounded-full bg-emerald-300 blur-3xl"></div>
            </div>

            {/* Hero Section */}
            <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 text-center flex flex-col items-center">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-eco-100 dark:bg-eco-950/40 text-eco-700 dark:text-eco-300 text-xs font-bold mb-6 border border-eco-200/50 dark:border-eco-800/30 animate-pulse-soft">
                    <Sparkles className="w-3.5 h-3.5" /> Track, Reduce, and Gamify Your Carbon Footprint
                </div>
                
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-white max-w-3xl leading-tight">
                    Every Daily Green Choice{' '}
                    <span className="bg-gradient-to-r from-eco-600 to-emerald-500 bg-clip-text text-transparent">
                        Saves Our Planet
                    </span>
                </h1>
                
                <p className="mt-6 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                    EcoTrack AI helps you understand your environmental impact, track daily habits, set goals, and earn points while reducing carbon emissions through personalized AI-powered insights.
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-4">
                    {user ? (
                        <Link
                            to="/dashboard"
                            className="px-8 py-3.5 rounded-full bg-eco-600 hover:bg-eco-700 text-white font-bold text-base shadow-lg shadow-eco-500/25 flex items-center gap-2 hover:scale-105 transition-all"
                        >
                            Go to Dashboard <ArrowRight className="w-5 h-5" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/register"
                                className="px-8 py-3.5 rounded-full bg-eco-600 hover:bg-eco-700 text-white font-bold text-base shadow-lg shadow-eco-500/25 flex items-center gap-2 hover:scale-105 transition-all"
                            >
                                Start Tracking Free <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/login"
                                className="px-8 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-base transition-colors"
                            >
                                Sign In
                            </Link>
                        </>
                    )}
                </div>
            </section>

            {/* Tree Equivalent interactive simulator card */}
            <section className="max-w-4xl mx-auto px-4 py-8 mb-16">
                <div className="p-8 rounded-2xl glass-card text-center relative overflow-hidden shadow-xl">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        🌳 Interactive Tree Equivalent Calculator
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                        One mature tree absorbs roughly 22 kg of CO₂ per year. See your impact visualized!
                    </p>

                    <div className="max-w-md mx-auto flex flex-col items-center gap-4">
                        <div className="w-full">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                CO₂ Saved (kg): <span className="text-eco-600 text-sm font-extrabold">{co2SavedInput} kg</span>
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="500"
                                step="10"
                                value={co2SavedInput}
                                onChange={(e) => setCo2SavedInput(Number(e.target.value))}
                                className="w-full accent-eco-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                            />
                        </div>

                        <div className="mt-4 p-4 rounded-xl bg-eco-50 dark:bg-eco-950/20 border border-eco-100 dark:border-eco-900/50 w-full">
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                                Equivalent to planting
                            </p>
                            <p className="text-3xl font-extrabold text-eco-600 mt-1 animate-pulse-soft">
                                {treesEquivalent} Trees
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                                growing for 1 full year!
                            </p>
                            
                            {/* Render tree icons */}
                            <div className="flex flex-wrap justify-center gap-1 mt-4">
                                {Array.from({ length: Math.min(25, Math.ceil(treesEquivalent)) }).map((_, idx) => (
                                    <span key={idx} className="text-2xl animate-float" style={{ animationDelay: `${idx * 0.2}s` }}>🌳</span>
                                ))}
                                {Math.ceil(treesEquivalent) > 25 && <span className="text-slate-400 font-bold self-end text-xs">...and more!</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Highlights Grid */}
            <section className="max-w-6xl mx-auto px-4 py-12 border-t dark:border-slate-800">
                <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-12">
                    Core Platform Features
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 rounded-2xl glass-card hover:scale-[1.02] transition-all">
                        <div className="p-3 bg-eco-100 dark:bg-eco-950/50 rounded-xl text-eco-600 w-fit mb-4">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Emissions Calculator</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 leading-relaxed">
                            Log carbon footprint metrics across travel, diet, waste, and energy with instant breakdown scores.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl glass-card hover:scale-[1.02] transition-all">
                        <div className="p-3 bg-eco-100 dark:bg-eco-950/50 rounded-xl text-eco-600 w-fit mb-4">
                            <Award className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Gamification & Badges</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 leading-relaxed">
                            Earn Green Points, gain XP, complete streaks, and level up to unlock specialized eco achievements.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl glass-card hover:scale-[1.02] transition-all">
                        <div className="p-3 bg-eco-100 dark:bg-eco-950/50 rounded-xl text-eco-600 w-fit mb-4">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">AI Recommendations</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 leading-relaxed">
                            Receive personalized carbon saving insights tailored specifically to target your largest emissions source.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
