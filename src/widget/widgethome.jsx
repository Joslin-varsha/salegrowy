import React, { useState, useEffect } from 'react';
import {
    Inbox,
    Palette,
    MessageSquare,
    Bell,
    Lightbulb,
    Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Separate Components
import Sidebar from './components/Sidebar';
import InboxSection from './components/InboxSection';
import AppearanceSection from './components/AppearanceSection';
import ChatSection from './components/ChatSection';
import InstallationSection from './components/InstallationSection';
import SuggestionsSection from './components/SuggestionsSection';

const WidgetHome = ({ embedded = false }) => {
    const [activeTab, setActiveTab] = useState('inbox');
    const [accentColor, setAccentColor] = useState('#6366f1');
    const VENDOR_ID = localStorage.getItem('vendor_id');

    const [isAiEnabled, setIsAiEnabled] = useState(true);
    const [isAiUpdating, setIsAiUpdating] = useState(false);

    const BASE_URI = import.meta.env.VITE_BASE_URI;

    const fetchAiStatus = async () => {
        try {
            const response = await fetch(`${BASE_URI}/api/getWidgetAi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ vendor_id: VENDOR_ID })
            });
            const result = await response.json();
            if (result.success && result.data) {
                setIsAiEnabled(result.data.ai_enabled === 1);
            }
        } catch (error) {
            console.error('Error fetching AI status:', error);
        }
    };

    useEffect(() => {
        fetchAiStatus();
    }, []);

    const toggleAiStatus = async () => {
        const newStatus = !isAiEnabled;
        setIsAiUpdating(true);
        try {
            const response = await fetch(`${BASE_URI}/api/enableDisableWidgetAi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vendor_id: VENDOR_ID,
                    status: newStatus ? 1 : 0
                })
            });
            const result = await response.json();
            if (result.success) {
                setIsAiEnabled(newStatus);
            }
        } catch (error) {
            console.error('Error updating AI status:', error);
        } finally {
            setIsAiUpdating(false);
        }
    };

    const menuItems = [
        { id: 'inbox', label: 'Inbox', icon: <Inbox size={20} /> },
        { id: 'appearance', label: 'Appearance', icon: <Palette size={20} /> },
        // { id: 'chat', label: 'Chat', icon: <MessageSquare size={20} /> },
        // { id: 'installation', label: 'Installation', icon: <Settings size={20} /> },
        // { id: 'suggestions', label: 'Suggestions', icon: <Lightbulb size={20} /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'inbox':
                return <InboxSection accentColor={accentColor} />;
            case 'appearance':
                return <AppearanceSection accentColor={accentColor} setAccentColor={setAccentColor} />;
            case 'chat':
                return <ChatSection accentColor={accentColor} />;
            case 'installation':
                return (
                    <InstallationSection 
                        accentColor={accentColor} 
                        isAiEnabled={isAiEnabled}
                        isAiUpdating={isAiUpdating}
                        toggleAiStatus={toggleAiStatus}
                    />
                );
            case 'suggestions':
                return <SuggestionsSection accentColor={accentColor} setActiveTab={setActiveTab} />;
            default:
                return <InboxSection accentColor={accentColor} />;
        }
    };

    if (embedded) {
        return (
            <div className="flex flex-col h-full bg-transparent font-sans text-slate-900 tracking-tight text-sm">
                <nav className="flex items-center justify-between mb-8 border-b border-slate-200 pb-2">
                    <div className="flex gap-4">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-xs uppercase tracking-wider ${
                                    activeTab === item.id
                                    ? 'bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200'
                                    : 'text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Premium Agent Status Switch */}
                 
                </nav>
                <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden tracking-tight text-sm">
            {/* Sidebar */}
            <Sidebar 
                menuItems={menuItems} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                accentColor={accentColor} 
                isAiEnabled={isAiEnabled}
                isAiUpdating={isAiUpdating}
                toggleAiStatus={toggleAiStatus}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
                    <h1 className="text-lg font-bold capitalize">{activeTab.replace('-', ' ')}</h1>
                </header>

                <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};
export default WidgetHome;