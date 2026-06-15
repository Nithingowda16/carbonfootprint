import React, { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Bell, Shield, Eye, HelpCircle, CheckCircle } from 'lucide-react';

export default function Settings({ theme, toggleTheme }) {
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [goalReminders, setGoalReminders] = useState(true);
    const [highContrast, setHighContrast] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleSave = (e) => {
        e.preventDefault();
        setSuccessMsg('Settings saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mb-2 flex items-center justify-center gap-2">
                    <SettingsIcon className="w-8 h-8 text-eco-600 animate-float" /> Account Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-lg mx-auto">
                    Manage preferences for notifications, theme appearances, privacy levels, and security settings.
                </p>
            </div>

            {successMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5 justify-center">
                    <CheckCircle className="w-5 h-5" /> {successMsg}
                </div>
            )}

            <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
                {/* Theme Configuration */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2 pb-2 border-b dark:border-slate-800">
                        Theme & Display
                    </h3>
                    <div className="flex justify-between items-center text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <div>
                            <span className="font-bold block">Theme Mode</span>
                            <span className="text-[10px] text-slate-400">Toggle light or dark theme for the interface.</span>
                        </div>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                            {theme === 'dark' ? <><Sun className="w-4 h-4 text-amber-500" /> Light Mode</> : <><Moon className="w-4 h-4" /> Dark Mode</>}
                        </button>
                    </div>

                    <div className="flex justify-between items-center text-xs sm:text-sm text-slate-700 dark:text-slate-300 pt-3">
                        <div>
                            <span className="font-bold block">High Contrast Mode</span>
                            <span className="text-[10px] text-slate-400">Increase readability using accessibility colors.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={highContrast}
                                onChange={(e) => setHighContrast(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-eco-600"></div>
                        </label>
                    </div>
                </div>

                {/* Notifications Config */}
                <div className="space-y-4 pt-4">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2 pb-2 border-b dark:border-slate-800">
                        <Bell className="w-4 h-4 text-eco-600" /> Notifications & Alerts
                    </h3>
                    
                    <div className="flex justify-between items-center text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <div>
                            <span className="font-bold block">Monthly PDF Reports</span>
                            <span className="text-[10px] text-slate-400">Receive carbon audit logs via email.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={emailAlerts}
                                onChange={(e) => setEmailAlerts(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-eco-600"></div>
                        </label>
                    </div>

                    <div className="flex justify-between items-center text-xs sm:text-sm text-slate-700 dark:text-slate-300 pt-3">
                        <div>
                            <span className="font-bold block">Carbon Goal Reminders</span>
                            <span className="text-[10px] text-slate-400">Send notifications for goals close to expiry dates.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={goalReminders}
                                onChange={(e) => setGoalReminders(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-eco-600"></div>
                        </label>
                    </div>
                </div>

                {/* Footer Save Button */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-eco-600 hover:bg-eco-700 text-white font-bold rounded-xl text-xs shadow-md shadow-eco-500/10 transition-colors"
                    >
                        Save Configuration
                    </button>
                </div>
            </form>
        </div>
    );
}
