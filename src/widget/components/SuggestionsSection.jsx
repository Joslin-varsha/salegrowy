import React from 'react';
import { Play, BookOpen, ExternalLink, X, Bot, Plus, Settings } from 'lucide-react';

const SuggestionsSection = ({ accentColor, setActiveTab }) => {
    return (
        <div className="mx-auto w-full flex flex-col gap-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Suggestions</h2>
                    <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                        Complete suggested questions to help Lyro handle similar queries, based on unanswered customer issues and past operator Q&A.
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm hover:border-slate-300 w-fit">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                        <Play size={10} className="fill-slate-600 text-slate-600 ml-0.5" />
                    </div>
                    Test Lyro
                </button>
            </div>

            {/* Banner Card */}
            <div className="relative overflow-hidden bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between group min-h-[220px]">
                <div className="flex-1 space-y-4 z-10">
                    <h3 className="text-xl font-bold text-slate-900">Boost the AI Agent knowledge</h3>
                    <p className="text-sm text-slate-600 max-w-md leading-relaxed">
                        The AI Agent collects similar unanswered questions or questions previously resolved by operators and suggests answers. Just review and add them — they'll appear in <span className="font-bold text-slate-900">Knowledge &gt; Data sources</span> and help both the AI Agent and Copilot respond better.
                    </p>
                    <a href="#" className="flex items-center gap-2 text-blue-600 text-sm font-bold hover:underline group/link">
                        <BookOpen size={18} />
                        Learn about Suggestions
                        <ExternalLink size={14} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </a>
                </div>

                <div className="relative mt-8 md:mt-0 md:ml-10 shrink-0">
                    {/* Illustration Part */}
                    <div className="bg-white border border-slate-100 rounded-xl shadow-2xl p-5 w-80 transform rotate-2 group-hover:rotate-0 transition-transform duration-500 ease-out">
                        <div className="flex justify-between items-center mb-5 border-b border-slate-50 pb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggestions: 8</span>
                            <X size={14} className="text-slate-300 cursor-pointer hover:text-slate-500" />
                        </div>
                        <div className="space-y-4">
                            {[
                                { q: "Can I change my shipping address after ordering?", count: 5 },
                                { q: "Is shipping free for defective item returns?", count: 5 },
                                { q: "Do you offer price matching after purchase?", count: 4 },
                                { q: "Can I use multiple discount codes?", count: 1 },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                    <div className="w-4 h-4 border border-slate-200 rounded bg-slate-50 shrink-0"></div>
                                    <span className="text-[10px] text-slate-600 flex-1 truncate font-medium">{item.q}</span>
                                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bot Icon Overlay */}
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 transform -rotate-12 group-hover:rotate-0 transition-all duration-500 hover:scale-110 z-20">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                            <Bot size={24} className="text-slate-700" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                </div>
            </div>

            {/* Main Content Area / Empty State */}
            <div className="bg-white border border-slate-200 rounded-2xl p-24 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-8 ring-8 ring-blue-50/50 transform hover:scale-110 transition-transform cursor-pointer">
                    <Plus size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">No suggestions to review</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                    When the AI Agent identifies patterns in unanswered customer queries, they will appear here for your approval.
                </p>
                <button
                    onClick={() => setActiveTab('chat')}
                    className="mt-8 text-blue-600 font-bold text-sm hover:underline flex items-center gap-2"
                >
                    <Settings size={16} />
                    Manage AI Agent settings
                </button>
            </div>
        </div>
    );
};

export default SuggestionsSection;
