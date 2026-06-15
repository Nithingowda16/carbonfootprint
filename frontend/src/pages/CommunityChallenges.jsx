import React, { useState, useEffect } from 'react';
import { Leaf, Award, Globe, Users, CheckCircle2, Flame, Play } from 'lucide-react';
import { api } from '../utils/api';

export default function CommunityChallenges({ setUser }) {
    const [challenges, setChallenges] = useState([]);
    const [joinedMap, setJoinedMap] = useState({}); // challengeId -> userChallenge record
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState('');

    useEffect(() => {
        fetchChallengesData();
    }, []);

    const fetchChallengesData = async () => {
        setLoading(true);
        try {
            const list = await api.listChallenges();
            setChallenges(list || []);

            const joined = await api.getJoinedChallenges();
            const mapping = {};
            joined.forEach(item => {
                mapping[item.challenge_id] = item;
            });
            setJoinedMap(mapping);
        } catch (error) {
            console.error("Failed to load challenges", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (challengeId) => {
        setActionMsg('');
        try {
            const data = await api.joinChallenge(challengeId);
            setActionMsg("Joined the challenge successfully!");
            fetchChallengesData();
        } catch (error) {
            console.error("Failed to join challenge", error);
        }
    };

    const handleLogProgress = async (challengeId) => {
        setActionMsg('');
        try {
            // increment progress by 1 unit
            const data = await api.logChallengeProgress(challengeId, 1.0);
            if (data.status === 'completed') {
                setActionMsg("Challenge Completed! Reward claimed.");
                // Refetch user profile details
                const profile = await api.getProfile();
                setUser(profile);
            } else {
                setActionMsg("Logged progress on challenge!");
            }
            fetchChallengesData();
        } catch (error) {
            console.error("Failed to log progress", error);
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
                    <Users className="w-8 h-8 text-eco-600 animate-float" /> Community Challenges
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
                    Join global sustainability programs with thousands of users, cooperate on carbon cuts, and win reward badges.
                </p>
            </div>

            {actionMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5" /> {actionMsg}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {challenges.map((chal) => {
                    const joinedRecord = joinedMap[chal.id];
                    const isJoined = !!joinedRecord;
                    const isCompleted = joinedRecord?.status === 'completed';
                    const progressPct = isJoined ? Math.min(100, Math.round((joinedRecord.progress / chal.target_value) * 100)) : 0;

                    return (
                        <div key={chal.id} className="p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between shadow-sm hover:scale-[1.01] transition-all">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-eco-100 dark:bg-eco-900/50 text-eco-700 dark:text-eco-300">
                                        {chal.challenge_type} Challenge
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold">Ends 2026-12-31</span>
                                </div>
                                <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-2">{chal.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{chal.description}</p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                                <div className="flex gap-4 text-[10px] text-slate-400 font-bold">
                                    <span>XP Reward: <span className="text-eco-600">+{chal.xp_reward}</span></span>
                                    <span>GP Reward: <span className="text-eco-600">+{chal.points_reward} GP</span></span>
                                </div>

                                {isJoined ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                                            <span>Progress ({joinedRecord.progress} / {chal.target_value})</span>
                                            <span>{progressPct}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-eco-500'}`}
                                                style={{ width: `${progressPct}%` }}
                                            ></div>
                                        </div>
                                        
                                        {!isCompleted ? (
                                            <button
                                                onClick={() => handleLogProgress(chal.id)}
                                                className="w-full mt-2 py-2 bg-eco-600 hover:bg-eco-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-eco-500/10 transition-colors"
                                            >
                                                Log Daily Progress
                                            </button>
                                        ) : (
                                            <div className="text-emerald-600 font-bold text-xs flex items-center justify-center gap-1 pt-2">
                                                <Award className="w-4 h-4" /> Challenge Completed!
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleJoin(chal.id)}
                                        className="w-full py-2 bg-slate-100 hover:bg-eco-600 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
                                    >
                                        <Play className="w-3.5 h-3.5" /> Join Challenge
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
