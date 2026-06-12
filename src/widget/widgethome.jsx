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
import { message } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

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
    const [isThemeLoading, setIsThemeLoading] = useState(false);

    const BASE_URI = import.meta.env.VITE_BASE_URI;

    const fetchAiStatus = async () => {
        try {
            const response = await fetch(`${BASE_URI}/api/getWidgetAi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ vendor_id: VENDOR_ID })
            });
            const result = await response.json();
            if (result.success && result.data) {
                setIsAiEnabled(result.data.ai_enabled === 1);
                if (result.widgetEnabled !== undefined) {
                    setIsWidgetEnabled(result.widgetEnabled === 1);
                }
            }
        } catch (error) {
            console.error('Error fetching AI status:', error);
        }
    };

    useEffect(() => {
        if (VENDOR_ID) {
            fetchAiStatus();
        }
    }, [VENDOR_ID]);

    const toggleAiStatus = async () => {
        const newStatus = !isAiEnabled;
        setIsAiUpdating(true);
        try {
            const response = await fetch(`${BASE_URI}/api/enableDisableWidgetAi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    vendor_id: VENDOR_ID,
                    status: newStatus ? 1 : 0
                })
            });
            const result = await response.json();
            if (result.success) {
                setIsAiEnabled(newStatus);
                message.success(`AI Agent ${newStatus ? 'enabled' : 'disabled'}`);
            } else {
                message.error(result.message || 'Failed to update AI status');
            }
        } catch (error) {
            console.error('Error updating AI status:', error);
            message.error('Failed to update AI status');
        } finally {
            setIsAiUpdating(false);
        }
    };

    const openThemeEditor = async () => {
        setIsThemeLoading(true);
        try {
            const response = await fetch(`${BASE_URI}/api/getThemeEditorUrl`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ vendor_id: VENDOR_ID })
            });
            const result = await response.json();
            console.log('getThemeEditorUrl response:', result);

            // Extract URL from any possible field in the response
            const redirectUrl =
                result.editor_url ||
                result.url ||
                result.redirect_url ||
                result.redirectUrl ||
                (result.data && (result.data.editor_url)) ||
                (typeof result.response === 'string' && result.response.startsWith('http') ? result.response : null);

            if (redirectUrl) {
                window.open(redirectUrl, '_blank');
            } else {
                message.error(result.message || 'Could not retrieve theme editor URL');
            }
        } catch (error) {
            console.error('Error fetching theme editor URL:', error);
            message.error('Failed to open theme editor');
        } finally {
            setIsThemeLoading(false);
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

                    {/* Premium Agent Status Switches */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {/* Enable / Disable AI Switch */}
                        <div 
                            onClick={!isAiUpdating ? toggleAiStatus : undefined}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1.5rem',
                                padding: '0.45rem 1rem',
                                border: '1px solid #edf2f7',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                cursor: isAiUpdating ? 'not-allowed' : 'pointer',
                                minWidth: '220px',
                                userSelect: 'none',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Enable / Disable AI</span>
                            {isAiUpdating ? (
                                <SyncOutlined spin style={{ color: 'var(--wa-green)', fontSize: '13px' }} />
                            ) : (
                                <div style={{ 
                                    width: '34px', 
                                    height: '18px', 
                                    borderRadius: '18px', 
                                    background: isAiEnabled ? 'var(--wa-green)' : '#cbd5e1',
                                    position: 'relative',
                                    transition: 'all 0.2s ease',
                                }}>
                                    <div style={{ 
                                        position: 'absolute',
                                        top: '2px',
                                        left: isAiEnabled ? '18px' : '2px',
                                        width: '14px',
                                        height: '14px',
                                        borderRadius: '50%',
                                        background: '#ffffff',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                                    }}></div>
                                </div>
                            )}
                        </div>

                        {/* Customize Widget Button */}
                        <button
                            onClick={openThemeEditor}
                            disabled={isThemeLoading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.45rem 1rem',
                                border: 'none',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                cursor: isThemeLoading ? 'not-allowed' : 'pointer',
                                opacity: isThemeLoading ? 0.7 : 1,
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(37,211,102,0.35)',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {isThemeLoading ? (
                                <SyncOutlined spin style={{ fontSize: '13px' }} />
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9"/>
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                </svg>
                            )}
                            {isThemeLoading ? 'Opening...' : 'Enable/ Disable Widget'}
                        </button>
                    </div>
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
                openThemeEditor={openThemeEditor}
                isThemeLoading={isThemeLoading}
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