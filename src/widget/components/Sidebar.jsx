import React from 'react';
import { ArrowLeft, Bot, Sparkles, Loader2 } from 'lucide-react';

const Sidebar = ({ 
    menuItems, 
    activeTab, 
    setActiveTab, 
    accentColor,
    isAiEnabled,
    isAiUpdating,
    toggleAiStatus
}) => {
    return (
        <aside className="w-[240px] bg-white border-r border-slate-200 flex flex-col p-5 z-10 transition-all duration-300">
            <button
                className="flex items-center gap-2 mb-8 text-slate-500 hover:text-slate-900 transition-all group w-fit"
                onClick={() => window.history.back()}
            >
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                </div>
                <span className="font-bold text-xs">Back</span>
            </button>

            <nav className="flex flex-col gap-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium group ${activeTab === item.id
                            ? 'shadow-sm'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        style={activeTab === item.id ? {
                            color: accentColor,
                            backgroundColor: `${accentColor}10`,
                            border: `1px solid ${accentColor}20`
                        } : { border: '1px solid transparent' }}
                    >
                        <span className={`transition-transform duration-200 group-hover:scale-110 ${activeTab === item.id ? 'scale-110' : ''}`}>
                            {item.icon}
                        </span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="mt-3 pt-6 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-slate-700">
                            <Bot size={18} className="text-indigo-500" />
                            <span className="font-bold text-[11px] uppercase tracking-wider">AI Agent</span>
                        </div>
                        {isAiUpdating ? (
                            <Loader2 size={14} className="animate-spin text-slate-400" />
                        ) : (
                            <div className={`w-2 h-2 rounded-full ${isAiEnabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-300'}`}></div>
                        )}
                    </div>
                    
                    <button 
                        onClick={toggleAiStatus}
                        disabled={isAiUpdating}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 group ${
                            isAiEnabled 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            {isAiEnabled ? 'Active' : 'Disabled'}
                        </span>
                        <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${isAiEnabled ? 'bg-white/20' : 'bg-slate-200'}`}>
                            <div className={`absolute top-1 w-2 h-2 rounded-full transition-all duration-300 ${
                                isAiEnabled ? 'right-1 bg-white' : 'left-1 bg-slate-400'
                            }`}></div>
                        </div>
                    </button>
                    
                    <p className="text-[9px] text-slate-400 mt-3 leading-relaxed">
                        {isAiEnabled 
                            ? 'AI is automatically handling visitor queries.' 
                            : 'AI is currently paused. Manual replies only.'}
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
