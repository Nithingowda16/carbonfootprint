import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, ShieldAlert, CheckCircle, Leaf } from 'lucide-react';
import { api } from '../utils/api';

export default function Reports() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const data = await api.getSummary();
            setSummary(data);
        } catch (err) {
            console.error("Failed to load footprint summary", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await api.downloadReport();
        } catch (err) {
            alert("Failed to download PDF report: " + err.message);
        } finally {
            setDownloading(false);
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
                    <FileText className="w-8 h-8 text-eco-600 animate-float" /> Environmental Reports
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
                    Export your carbon footprint audit log as a clean, styled PDF report for personal archiving.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* PDF generation Call To Action */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm text-center md:col-span-1 space-y-4">
                    <div className="p-3 bg-eco-100 dark:bg-eco-950/50 rounded-full w-fit mx-auto text-eco-600">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Download Center</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                        Export an official PDF summary containing carbon breakdowns, target progress, and personalized recommendations.
                    </p>
                    
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full py-2.5 bg-eco-600 hover:bg-eco-700 text-white font-bold rounded-xl text-xs shadow-md shadow-eco-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" /> {downloading ? 'Downloading...' : 'Download PDF Report'}
                    </button>
                </div>

                {/* Footprint Table preview */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm md:col-span-2 space-y-6">
                    <div className="flex justify-between items-center border-b pb-3 dark:border-slate-800">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Report Data Preview</h3>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">Active log</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Carbon Index</span>
                            <span className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1 block">{summary?.carbon_score} / 100</span>
                            <span className="text-[9px] text-slate-400 mt-1 block">Based on average daily carbon efficiency</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Logged Audit Records</span>
                            <span className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1 block">{summary?.records_count} Daily Logs</span>
                            <span className="text-[9px] text-slate-400 mt-1 block">Records stored in PostgreSQL database</span>
                        </div>
                    </div>

                    <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-xl">
                        <table className="w-full text-left border-collapse text-xs text-slate-700 dark:text-slate-300">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold border-b dark:border-slate-800">
                                    <th className="p-3">Category</th>
                                    <th className="p-3 text-right">Cumulative Emissions (kg CO₂)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b dark:border-slate-800/50">
                                    <td className="p-3">Transportation</td>
                                    <td className="p-3 text-right font-semibold">{summary?.transport_emissions} kg</td>
                                </tr>
                                <tr className="border-b dark:border-slate-800/50">
                                    <td className="p-3">Home Utility Energy</td>
                                    <td className="p-3 text-right font-semibold">{summary?.home_emissions} kg</td>
                                </tr>
                                <tr className="border-b dark:border-slate-800/50">
                                    <td className="p-3">Food Habits & Diets</td>
                                    <td className="p-3 text-right font-semibold">{summary?.food_emissions} kg</td>
                                </tr>
                                <tr className="border-b dark:border-slate-800/50">
                                    <td className="p-3">Waste Management</td>
                                    <td className="p-3 text-right font-semibold">{summary?.waste_emissions} kg</td>
                                </tr>
                                <tr className="font-bold bg-slate-50/50 dark:bg-slate-800/20">
                                    <td className="p-3">Grand Total Logged</td>
                                    <td className="p-3 text-right text-eco-600">{summary?.total_emissions} kg</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
