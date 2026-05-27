import React, { useState, useEffect, useRef } from 'react';
import { Palette, ChevronUp, ChevronDown, ImageIcon, Copy, Bot, Globe, MoreVertical, User, Send, X, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetPreview } from './Widget';

const ChatSection = ({ accentColor }) => {
    // Chat Page Settings
    const [bgColor, setBgColor] = useState('#eff2f6');
    const [header, setHeader] = useState('Welcome to ');
    // AI Agent Settings
    const [isAIAgentOpen, setIsAIAgentOpen] = useState(true);
    const [botName, setBotName] = useState('Assistant');
    const [initialMessage, setInitialMessage] = useState('👋 Hi! How can I help you today?');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [autoReply, setAutoReply] = useState(true);

    // Interactive Chat State (for Widget Preview)
    const [messages, setMessages] = useState([
        { role: 'bot', content: '👋 Hi! How can I help you today?', time: 'Just now' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = { role: 'user', content: inputValue, time: 'Just now' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            const responses = [
                "I've found some great anime t-shirts for you! Would you like to see the size chart?",
                "Our current shipping time is 3-5 business days. Can I help you with anything else? 😊",
                "That's a great choice! We have that style available in S, M, and L.",
                "I'm here to help you find the perfect fit! What's your preferred style?"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            setMessages(prev => [...prev, { role: 'bot', content: randomResponse, time: 'Just now' }]);
        }, 1500);
    };

    return (
        <div className=" mx-auto w-full flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] overflow-hidden">
            {/* Settings Panel (Left) */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {/* AI Agent Accordion */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <button
                        onClick={() => setIsAIAgentOpen(!isAIAgentOpen)}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Bot size={18} className="text-slate-400" />
                            <span className="font-bold text-slate-800 text-sm">AI Agent Configuration</span>
                        </div>
                        {isAIAgentOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    <AnimatePresence initial={false}>
                        {isAIAgentOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="p-5 border-t border-slate-50 space-y-6">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="space-y-0.5">
                                            <h4 className="text-xs font-bold text-slate-900">Auto-reply</h4>
                                            <p className="text-[10px] text-slate-500">Enable AI responses</p>
                                        </div>
                                        <div
                                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${autoReply ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                            onClick={() => setAutoReply(!autoReply)}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoReply ? 'left-6' : 'left-1'}`}></div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Bot Name</label>
                                            <input
                                                type="text"
                                                value={botName}
                                                onChange={(e) => setBotName(e.target.value)}
                                                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/10 outline-none text-xs transition-all"
                                                placeholder="e.g. Mayilo Assistant"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Initial Message</label>
                                            <textarea
                                                value={initialMessage}
                                                onChange={(e) => setInitialMessage(e.target.value)}
                                                className="w-full p-2.5 h-20 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/10 outline-none text-xs transition-all resize-none"
                                                placeholder="The first message the user sees..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">System Prompt</label>
                                                <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded uppercase">Advanced</span>
                                            </div>
                                            <textarea
                                                value={systemPrompt}
                                                onChange={(e) => setSystemPrompt(e.target.value)}
                                                className="w-full p-2.5 h-32 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/10 outline-none text-xs transition-all resize-none leading-relaxed font-mono text-slate-600"
                                                placeholder="Detailed instructions for the AI..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                    Save Changes
                </button>
            </div>

            {/* Preview Panel (Right) */}
            <div className="w-full lg:w-[450px] bg-slate-900 overflow-hidden flex flex-col relative shadow-2xl rounded-2xl">
                {/* Preview Label */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex bg-black/40 backdrop-blur-md p-1 px-4 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[10px] font-bold text-white tracking-wider uppercase">AI Widget Preview</span>
                </div>

                <div className="w-full h-full p-8 flex items-center justify-center bg-slate-800">
                    <WidgetPreview
                        type="interactive"
                        accentColor={accentColor}
                        botName={botName}
                        messages={messages}
                        isTyping={isTyping}
                        inputValue={inputValue}
                        onInputChange={setInputValue}
                        onSendMessage={handleSendMessage}
                        chatEndRef={chatEndRef}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatSection;
