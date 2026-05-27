import React, { useState } from 'react';
import { CheckCircle2, ExternalLink, BookOpen, Copy, Mail, Clock, Globe, MessageCircle, X, Bot, Loader2, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { WidgetPreview } from './Widget';

const InstallationSection = ({
    accentColor,
    isAiEnabled,
    isAiUpdating,
    toggleAiStatus
}) => {
    const [selectedPlatform, setSelectedPlatform] = useState('shopify');
    const [isTestWidgetOpen, setIsTestWidgetOpen] = useState(false);
    const VENDOR_ID = localStorage.getItem('vendor_id');
    const VENDOR_UID = localStorage.getItem('vendor_uid');

    const widgetScript = `{% raw %}
<script 
    src="https://app.salegrowy.com/salegrowywidget/widget.js" 
    data-vendor-id="${VENDOR_UID}">
</script>
{% endraw %}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(widgetScript);
        toast.success('Script copied to clipboard!');
    };

    const platforms = [
        { id: 'shopify', label: 'Shopify Store', icon: <Store size={16} className="text-green-600" /> },
        // { id: 'manual', label: 'Custom HTML', icon: <Globe size={16} className="text-indigo-600" /> },
    ];

    return (
        <div className="mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-500 relative pb-10">
            {/* Header Banner */}
            {/* <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Ready for Installation</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Your customized Salegrowy widget is generated and ready to go live.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsTestWidgetOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-[11px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                >
                    <MessageCircle size={14} /> Preview Widget
                </button>
            </div> */}

            <div className="space-y-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-10">Installation Guide</h2>
                    <p className="text-xs text-slate-500">Connect Salegrowy to your platform to start interacting with your visitors.</p>
                </div>

                <div className="pt-4">
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Platform Sidebar */}
                        <div className="w-full lg:w-56 flex flex-col gap-1">
                            {platforms.map(platform => (
                                <button
                                    key={platform.id}
                                    onClick={() => setSelectedPlatform(platform.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${selectedPlatform === platform.id
                                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                        : 'text-slate-500 hover:bg-slate-50 border border-transparent'
                                        }`}
                                >
                                    <span className="shrink-0">{platform.icon}</span>
                                    {platform.label}
                                </button>
                            ))}
                        </div>

                        {/* Guide Content */}
                        <div className="flex-1 space-y-10 max-w-2xl">
                            {selectedPlatform === 'shopify' ? (
                                <>
                                    <div className="flex gap-4">
                                        <div className="w-7 h-7 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-green-100">1</div>
                                        <div className="space-y-2 flex-1">
                                            <p className="text-sm font-bold text-slate-800">Go to your Shopify Online Store</p>
                                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                                Log in to your Shopify Admin, go to <span className="font-bold text-slate-700">Online Store</span> &gt; <span className="font-bold text-slate-700">Themes</span>.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-7 h-7 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-green-100">2</div>
                                        <div className="space-y-2 flex-1">
                                            <p className="text-sm font-bold text-slate-800">Edit Theme Code</p>
                                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                                Click the <span className="font-bold text-slate-700">... (three dots)</span> button next to your active theme and select <span className="font-bold text-slate-700">Edit Code</span>.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-7 h-7 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-green-100">3</div>
                                        <div className="space-y-4 flex-1">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-800">Paste Script in theme.liquid</p>
                                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                                    Open the <code className="bg-slate-100 px-1 py-0.5 rounded text-green-600 font-mono">theme.liquid</code> file. Scroll to the bottom and paste the script below just before the <code className="bg-slate-100 px-1 py-0.5 rounded text-green-600 font-mono">&lt;/body&gt;</code> tag.
                                                </p>
                                            </div>

                                            <div className="relative group max-w-lg">
                                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono text-[10px] text-green-400/80 leading-relaxed overflow-x-auto whitespace-pre">
                                                    {widgetScript}
                                                </div>
                                                <button
                                                    onClick={handleCopy}
                                                    className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all backdrop-blur-md"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={handleCopy}
                                                className="flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2.5 rounded-xl font-bold text-[11px] hover:bg-green-100 transition-all border border-green-200"
                                            >
                                                <Copy size={14} /> Copy Shopify Script
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex gap-4">
                                        <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-indigo-100">1</div>
                                        <div className="space-y-4 flex-1">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-800">Copy the widget installation script</p>
                                                <p className="text-[11px] text-slate-500 leading-relaxed">Paste this code snippet just before the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">&lt;/body&gt;</code> tag of your website HTML.</p>
                                            </div>

                                            <div className="relative group max-w-lg">
                                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 pt-7 font-mono text-[10px] text-indigo-300 leading-relaxed overflow-x-auto whitespace-pre shadow-xl">
                                                    {widgetScript}
                                                </div>
                                                <button
                                                    onClick={handleCopy}
                                                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all backdrop-blur-md"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    onClick={handleCopy}
                                                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-xl font-bold text-[11px] hover:bg-indigo-100 transition-all border border-indigo-100"
                                                >
                                                    <Copy size={14} /> Copy to clipboard
                                                </button>
                                                <button className="flex items-center gap-2 bg-slate-50 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-[11px] hover:bg-slate-100 transition-all border border-slate-200">
                                                    <Mail size={14} /> Send to developer
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-indigo-100">2</div>
                                        <div className="space-y-2 flex-1">
                                            <p className="text-sm font-bold text-slate-800">Verify Installation</p>
                                            <p className="text-[11px] text-slate-500 leading-relaxed">Open your website in a new tab. The widget should appear in the bottom-right corner. We'll automatically detect it once it's live.</p>
                                            <div className="flex items-center gap-2 text-amber-600 font-bold text-[10px] bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 w-fit uppercase tracking-widest mt-2">
                                                <Clock size={14} /> Awaiting first connection...
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Status Banner at bottom of page */}
            {/* <div className="mt-12 pt-8 border-t border-slate-100">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">AI Agent Status</h3>
                            <p className="text-[11px] text-slate-500 max-w-sm mt-1 leading-relaxed">
                                {isAiEnabled 
                                    ? "Your AI agent is currently active and responding to visitors on your behalf." 
                                    : "AI is disabled. Visitors can still send messages, but you'll need to reply manually."}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3 min-w-[180px]">
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${isAiEnabled ? 'text-green-500' : 'text-slate-400'}`}>
                                {isAiEnabled ? 'System Online' : 'System Offline'}
                            </span>
                            <div className={`w-1.5 h-1.5 rounded-full ${isAiEnabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                        </div>
                        
                        <button 
                            onClick={toggleAiStatus}
                            disabled={isAiUpdating}
                            className={`relative w-48 h-12 rounded-xl transition-all duration-300 flex items-center px-2 group ${
                                isAiEnabled 
                                ? 'bg-indigo-600 shadow-lg shadow-indigo-100 text-white' 
                                : 'bg-slate-100 border border-slate-200 text-slate-500'
                            }`}
                        >
                            {isAiUpdating && <Loader2 size={16} className="absolute left-1/2 -translate-x-1/2 animate-spin text-white" />}
                            
                            <div className={`flex-1 flex justify-center text-[10px] font-bold uppercase tracking-widest transition-all ${
                                isAiUpdating ? 'opacity-0' : 'opacity-100'
                            }`}>
                                {isAiEnabled ? 'Disable AI Agent' : 'Enable AI Agent'}
                            </div>

                            {!isAiUpdating && (
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                    isAiEnabled ? 'bg-white/20 text-white' : 'bg-white text-slate-400 shadow-sm'
                                }`}>
                                    <X size={14} className={`transition-all ${isAiEnabled ? 'rotate-0' : 'rotate-45'}`} />
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </div> */}

            {/* Test Widget Trigger (Floating) */}
            {/* <AnimatePresence>
                {isTestWidgetOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="fixed bottom-10 right-10 z-[100] w-[350px] h-[550px]"
                    >
                        <div className="relative h-full w-full">
                            <button 
                                onClick={() => setIsTestWidgetOpen(false)}
                                className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl z-[110] hover:scale-110 transition-all"
                            >
                                <X size={16} />
                            </button>
                            <WidgetPreview 
                                type="interactive" 
                                accentColor={accentColor} 
                                botName="Salegrowy Support"
                                messages={[
                                    { role: 'bot', content: '👋 Integration successful! This is a live preview of your widget.', time: 'Just now' }
                                ]}
                                onClose={() => setIsTestWidgetOpen(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence> */}
        </div>
    );
};

export default InstallationSection;
