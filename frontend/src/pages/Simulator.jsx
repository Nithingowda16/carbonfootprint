import React, { useState, useEffect } from 'react';
import { Leaf, RefreshCw, HelpCircle, ArrowRight, Zap, TrendingDown } from 'lucide-react';

export default function Simulator() {
    // Current Baseline defaults
    const baseline = {
        carKm: 35,
        acHours: 6,
        renewablePct: 0,
        diet: 'mixed'
    };

    // Modified/Future state
    const [carKm, setCarKm] = useState(35);
    const [acHours, setAcHours] = useState(6);
    const [renewablePct, setRenewablePct] = useState(0);
    const [diet, setDiet] = useState('mixed');

    // Emission Factors
    const CAR_FACTOR = 0.18; // kg per km
    const AC_FACTOR = 0.9;   // kg per hour
    const ELEC_BASE = 5.0;   // base daily electricity kg
    const DIET_FACTORS = {
        vegan: 1.5,
        vegetarian: 2.5,
        mixed: 4.5,
        heavy_meat: 7.2
    };

    // Calculate baseline daily emissions
    const baselineTotal = (
        (baseline.carKm * CAR_FACTOR) +
        (baseline.acHours * AC_FACTOR) +
        (ELEC_BASE * (1 - baseline.renewablePct / 100)) +
        DIET_FACTORS[baseline.diet]
    );

    // Calculate future daily emissions
    const futureTotal = (
        (carKm * CAR_FACTOR) +
        (acHours * AC_FACTOR) +
        (ELEC_BASE * (1 - renewablePct / 100)) +
        DIET_FACTORS[diet]
    );

    const dailySaving = Math.max(0, baselineTotal - futureTotal);
    const annualSaving = dailySaving * 365;
    const reductionPct = baselineTotal > 0 ? ((dailySaving / baselineTotal) * 100).toFixed(1) : 0;
    const treesEquivalent = (annualSaving / 22).toFixed(1);

    const resetSimulator = () => {
        setCarKm(baseline.carKm);
        setAcHours(baseline.acHours);
        setRenewablePct(baseline.renewablePct);
        setDiet(baseline.diet);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mb-2 flex items-center justify-center gap-2">
                    <TrendingDown className="w-8 h-8 text-eco-600 animate-float" /> Carbon Reduction Simulator
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
                    Simulate lifestyle adjustments and instantly see their impact on your carbon footprint, annual money saved, and tree equivalents.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Control Panel */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm md:col-span-2 space-y-6">
                    <div className="flex justify-between items-center border-b pb-3 dark:border-slate-800">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Habit Adjustments</h3>
                        <button
                            onClick={resetSimulator}
                            className="text-xs text-eco-600 dark:text-eco-400 font-bold flex items-center gap-1 hover:underline"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Reset to Baseline
                        </button>
                    </div>

                    {/* Car distance */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                            <span>Car Commute (km / day)</span>
                            <span className="text-eco-600">{carKm} km (Baseline: 35)</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={carKm}
                            onChange={(e) => setCarKm(Number(e.target.value))}
                            className="w-full accent-eco-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                        />
                    </div>

                    {/* AC usage */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                            <span>AC usage (Hours / day)</span>
                            <span className="text-eco-600">{acHours} hours (Baseline: 6)</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="24"
                            value={acHours}
                            onChange={(e) => setAcHours(Number(e.target.value))}
                            className="w-full accent-eco-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                        />
                    </div>

                    {/* Renewable share */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                            <span>Renewable Electricity Share (%)</span>
                            <span className="text-eco-600">{renewablePct}% (Baseline: 0)</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={renewablePct}
                            onChange={(e) => setRenewablePct(Number(e.target.value))}
                            className="w-full accent-eco-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                        />
                    </div>

                    {/* Diet choices */}
                    <div className="space-y-3">
                        <span className="block text-xs font-bold text-slate-600 dark:text-slate-300">Food Diet Choice</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {['vegan', 'vegetarian', 'mixed', 'heavy_meat'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setDiet(type)}
                                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                                        diet === type
                                            ? 'border-eco-600 bg-eco-50 dark:bg-eco-950/20 text-eco-600'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    {type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results display */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm text-center space-y-6">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Simulation Impact</h3>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Estimated Reduction</span>
                            <span className="text-3xl font-extrabold text-eco-600 mt-1 block">{reductionPct}%</span>
                            <span className="text-[10px] text-slate-500 mt-1 block">{(baselineTotal - futureTotal).toFixed(2)} kg CO₂ Saved / day</span>
                        </div>

                        <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Annual CO₂ Savings</span>
                            <span className="text-xl font-bold text-slate-800 dark:text-white mt-1 block">{annualSaving.toFixed(1)} kg</span>
                        </div>

                        <div className="p-4 bg-eco-50 dark:bg-eco-950/10 border border-eco-100 dark:border-eco-900/40 rounded-xl relative overflow-hidden">
                            <span className="text-[10px] text-eco-700 dark:text-eco-300 block font-bold uppercase tracking-wider">Tree Absorption Equivalent</span>
                            <span className="text-2xl font-extrabold text-eco-600 mt-1 block">{treesEquivalent} Trees</span>
                            <span className="text-[9px] text-slate-400 mt-1 block">planted and grown for 1 year</span>
                        </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-center leading-relaxed">
                        <Zap className="w-3.5 h-3.5 text-amber-500" /> In addition to carbon, these changes save an estimated ${(annualSaving * 0.15).toFixed(0)} in annual utility & fuel costs!
                    </div>
                </div>
            </div>
        </div>
    );
}
