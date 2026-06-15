import React, { useState } from 'react';
import { BookOpen, Leaf, Lightbulb, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';

export default function EducationHub() {
    const [expandedId, setExpandedId] = useState(null);

    const articles = [
        {
            id: 1,
            category: 'Energy',
            title: 'Understanding Grid Energy & Power Footprint',
            icon: <Lightbulb className="w-5 h-5" />,
            summary: 'Grid electricity production is still heavily reliant on fossil fuels. Learn how to calculate and reduce your electricity footprint.',
            content: `Grid electricity generates carbon emissions when fossil fuels (coal, natural gas, oil) are burned to spin generators. On average, grid electricity generates 0.45 kg of CO2 per kilowatt-hour (kWh).

Key Actions to Minimize Grid Footprint:
- **Switch to LEDs**: They use 80% less energy than standard bulbs.
- **Set Thermostats Wisely**: Each degree above 25°C on your AC saves about 6% on cooling costs and emissions.
- **Eliminate Phantom Loads**: Devices in standby mode consume power; unplug them or use smart power strips.`
        },
        {
            id: 2,
            category: 'Transportation',
            title: 'The Real Cost of Short Travel Errands',
            icon: <Leaf className="w-5 h-5" />,
            summary: 'Driving short trips of under 2 km contributes disproportionately to local smog and greenhouse gases. Explore green alternatives.',
            content: `Short car trips are highly carbon-intensive because the car engine operates less efficiently before it reaches its optimal running temperature. 

Eco-Friendly Commuting Options:
- **Active Commute**: Walking or bicycling for distances under 2 kilometers produces zero tailpipe emissions and improves health.
- **Mass Transit**: Buses and trains group travelers together, reducing the carbon emission per passenger mile by over 75% compared to single-passenger vehicles.`
        },
        {
            id: 3,
            category: 'Food choices',
            title: 'Diet and Climate: Why Food Choices Matter',
            icon: <GraduationCap className="w-5 h-5" />,
            summary: 'Food production accounts for up to 26% of global greenhouse emissions. Animal agriculture is the dominant driver.',
            content: `The carbon footprint of meat (especially beef and lamb) is exceptionally high due to the land clearance required for pasture, the massive grain feeds required, and the methane released during digestion by ruminant animals.

Impact Comparison:
- **Vegan Diet**: Emits roughly 1.5 kg CO2 per day.
- **Heavy Meat Diet**: Emits roughly 7.2 kg CO2 per day.
- Swapping beef for beans or lentils just once or twice a week is one of the single most impactful actions an individual can take to lower their footprint.`
        }
    ];

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mb-2 flex items-center justify-center gap-2">
                    <BookOpen className="w-8 h-8 text-eco-600 animate-float" /> Climate Education Hub
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
                    Learn about global warming, environmental preservation guidelines, and actionable ways to transition into a net-zero life.
                </p>
            </div>

            <div className="space-y-4">
                {articles.map((art) => {
                    const isExpanded = expandedId === art.id;
                    return (
                        <div key={art.id} className="glass-panel rounded-2xl overflow-hidden shadow-sm transition-all border border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => toggleExpand(art.id)}
                                className="w-full text-left p-6 flex justify-between items-start gap-4 focus:outline-none"
                                aria-expanded={isExpanded}
                            >
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-eco-100 dark:bg-eco-950/50 rounded-xl text-eco-600">
                                        {art.icon}
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-eco-600 bg-eco-50 dark:bg-eco-950/20 px-2 py-0.5 rounded">
                                            {art.category}
                                        </span>
                                        <h3 className="font-extrabold text-slate-800 dark:text-white text-base mt-2">{art.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{art.summary}</p>
                                    </div>
                                </div>
                                <div className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 self-center">
                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/50 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {art.content}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
