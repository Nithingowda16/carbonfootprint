import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Home, Utensils, Trash2, ArrowLeft, ArrowRight, Save, Leaf, Sparkles } from 'lucide-react';
import { api } from '../utils/api';

export default function Calculator({ setUser }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        car_type: 'petrol',
        car_km: 0,
        bus_km: 0,
        train_km: 0,
        flight_km: 0,
        ride_sharing_km: 0,
        electricity_kwh: 0,
        ac_hours: 0,
        renewable_pct: 0,
        appliance_runs: 0,
        diet_type: 'mixed',
        waste_kg: 0,
        plastic_usage: 'medium',
        recycles: false,
        composts: false
    });

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const dateStr = new Date().toISOString().slice(0, 10);
            const data = await api.addRecord(dateStr, formData);
            setResult(data.record);
            if (data.user) {
                setUser(data.user);
            }
        } catch (err) {
            setError(err.message || 'Failed to calculate and store record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mb-2 text-center flex items-center justify-center gap-2">
                <Leaf className="w-8 h-8 text-eco-600 animate-float" /> Carbon Footprint Calculator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center max-w-lg mx-auto">
                Log your activities to calculate your daily CO₂ emissions and unlock Green Points.
            </p>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                    {error}
                </div>
            )}

            {result ? (
                // Results Screen
                <div className="glass-card p-8 rounded-2xl text-center shadow-xl border border-eco-200/40 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-eco-600 to-emerald-500"></div>
                    <div className="p-3 bg-eco-100 dark:bg-eco-950/50 rounded-full w-fit mx-auto text-eco-600 mb-4 animate-bounce">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Calculation Complete!</h2>
                    <p className="text-xs text-slate-400 mb-6">Your carbon emissions have been updated.</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                            <span className="text-xs text-slate-400 block mb-1">Total</span>
                            <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{result.total_emissions} <span className="text-xs font-normal">kg</span></span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                            <span className="text-xs text-slate-400 block mb-1">Transport</span>
                            <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{result.transport_emissions} kg</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                            <span className="text-xs text-slate-400 block mb-1">Home Energy</span>
                            <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{result.home_emissions} kg</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                            <span className="text-xs text-slate-400 block mb-1">Diet & Food</span>
                            <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{result.food_emissions} kg</span>
                        </div>
                    </div>

                    <div className="bg-eco-50 dark:bg-eco-950/20 border border-eco-100 dark:border-eco-900/50 p-4 rounded-xl max-w-md mx-auto mb-8">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            🎉 Rewards Earned
                        </p>
                        <p className="text-eco-600 font-extrabold text-lg mt-1">
                            +20 XP | +5 Green Points
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-2.5 bg-eco-600 hover:bg-eco-700 text-white font-bold rounded-full text-sm shadow-md shadow-eco-500/15"
                    >
                        Go to Dashboard
                    </button>
                </div>
            ) : (
                // Calculator Steps Form
                <div className="glass-card rounded-2xl shadow-xl overflow-hidden">
                    {/* Form header progress tracker */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800/50 h-2">
                        <div
                            className="bg-gradient-to-r from-eco-600 to-emerald-500 h-2 transition-all duration-300"
                            style={{ width: `${(step / 4) * 100}%` }}
                        ></div>
                    </div>

                    <div className="p-4 sm:p-8 flex justify-around border-b border-slate-200 dark:border-slate-800">
                        <button onClick={() => setStep(1)} className={`flex items-center gap-1.5 text-xs font-bold ${step === 1 ? 'text-eco-600' : 'text-slate-400'}`}>
                            <Car className="w-4 h-4" /> 1. Transport
                        </button>
                        <button onClick={() => setStep(2)} className={`flex items-center gap-1.5 text-xs font-bold ${step === 2 ? 'text-eco-600' : 'text-slate-400'}`}>
                            <Home className="w-4 h-4" /> 2. Home Energy
                        </button>
                        <button onClick={() => setStep(3)} className={`flex items-center gap-1.5 text-xs font-bold ${step === 3 ? 'text-eco-600' : 'text-slate-400'}`}>
                            <Utensils className="w-4 h-4" /> 3. Food
                        </button>
                        <button onClick={() => setStep(4)} className={`flex items-center gap-1.5 text-xs font-bold ${step === 4 ? 'text-eco-600' : 'text-slate-400'}`}>
                            <Trash2 className="w-4 h-4" /> 4. Waste
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                        {step === 1 && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2"><Car className="w-5 h-5 text-eco-600" /> Transportation Choices</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Car Fuel / Engine Type</label>
                                        <select
                                            value={formData.car_type}
                                            onChange={(e) => updateField('car_type', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                                        >
                                            <option value="petrol">Petrol</option>
                                            <option value="diesel">Diesel</option>
                                            <option value="hybrid">Hybrid</option>
                                            <option value="electric">Electric</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Car Distance (km / day)</label>
                                        <input
                                            type="number"
                                            value={formData.car_km}
                                            onChange={(e) => updateField('car_km', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bus Commute (km / day)</label>
                                        <input
                                            type="number"
                                            value={formData.bus_km}
                                            onChange={(e) => updateField('bus_km', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Train / Subway (km / day)</label>
                                        <input
                                            type="number"
                                            value={formData.train_km}
                                            onChange={(e) => updateField('train_km', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Flights Distance (km / week)</label>
                                        <input
                                            type="number"
                                            value={formData.flight_km}
                                            onChange={(e) => updateField('flight_km', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ride Sharing (km / day)</label>
                                        <input
                                            type="number"
                                            value={formData.ride_sharing_km}
                                            onChange={(e) => updateField('ride_sharing_km', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2"><Home className="w-5 h-5 text-eco-600" /> Home Utility Usage</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Electricity Consumption (kWh / day)</label>
                                        <input
                                            type="number"
                                            value={formData.electricity_kwh}
                                            onChange={(e) => updateField('electricity_kwh', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">AC Usage (Hours / day)</label>
                                        <input
                                            type="number"
                                            value={formData.ac_hours}
                                            onChange={(e) => updateField('ac_hours', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Renewable Energy Share (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.renewable_pct}
                                            onChange={(e) => updateField('renewable_pct', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Appliance Runs (loads / day)</label>
                                        <input
                                            type="number"
                                            value={formData.appliance_runs}
                                            onChange={(e) => updateField('appliance_runs', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2"><Utensils className="w-5 h-5 text-eco-600" /> Food & Diet habits</h3>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Diet Type</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { key: 'vegan', name: 'Vegan', desc: 'Fully plant-based food, zero animal footprint.' },
                                            { key: 'vegetarian', name: 'Vegetarian', desc: 'No meat, includes dairy products.' },
                                            { key: 'mixed', name: 'Mixed Diet', desc: 'Balanced vegetables and moderate meats.' },
                                            { key: 'heavy_meat', name: 'Heavy Meat', desc: 'Beef, pork, or lamb consumed regularly.' }
                                        ].map(item => (
                                            <label
                                                key={item.key}
                                                className={`p-4 rounded-xl border-2 flex flex-col cursor-pointer transition-all ${
                                                    formData.diet_type === item.key
                                                        ? 'border-eco-600 bg-eco-50/50 dark:bg-eco-950/20'
                                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="diet_type"
                                                    value={item.key}
                                                    checked={formData.diet_type === item.key}
                                                    onChange={() => updateField('diet_type', item.key)}
                                                    className="sr-only"
                                                />
                                                <span className="font-bold text-slate-800 dark:text-white text-sm">{item.name}</span>
                                                <span className="text-[10px] text-slate-400 mt-1">{item.desc}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2"><Trash2 className="w-5 h-5 text-eco-600" /> Waste & Recycling</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Waste Generated (kg / week)</label>
                                        <input
                                            type="number"
                                            value={formData.waste_kg}
                                            onChange={(e) => updateField('waste_kg', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Plastic Single-Use Usage</label>
                                        <select
                                            value={formData.plastic_usage}
                                            onChange={(e) => updateField('plastic_usage', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border rounded-xl px-3 py-2 text-sm dark:border-slate-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-eco-500"
                                        >
                                            <option value="high">High (Daily takeouts, bottled water)</option>
                                            <option value="medium">Medium (Moderate shopping plastic packaging)</option>
                                            <option value="low">Low (Reusable containers, canvas bags)</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2 pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-200">
                                            <input
                                                type="checkbox"
                                                checked={formData.recycles}
                                                onChange={(e) => updateField('recycles', e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-300 text-eco-600 focus:ring-eco-500"
                                            />
                                            I recycle paper, glass, or metals daily.
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-200">
                                            <input
                                                type="checkbox"
                                                checked={formData.composts}
                                                onChange={(e) => updateField('composts', e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-300 text-eco-600 focus:ring-eco-500"
                                            />
                                            I compost food scraps or organic yard waste.
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Footer */}
                        <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={step === 1}
                                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>

                            {step < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-5 py-2 text-xs font-bold bg-eco-600 hover:bg-eco-700 text-white rounded-xl flex items-center gap-1 shadow-md shadow-eco-500/10 transition-all"
                                >
                                    Next <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 text-xs font-bold bg-gradient-to-r from-eco-600 to-emerald-500 hover:from-eco-700 hover:to-emerald-600 text-white rounded-xl flex items-center gap-1 shadow-md shadow-eco-500/20 transition-all disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" /> {loading ? 'Calculating...' : 'Submit & Calculate'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
