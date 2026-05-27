import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronDown, Send, MessageCircle, Bot, X } from 'lucide-react';

export const WidgetPreview = ({
    type = 'chat',
    accentColor,
    actionColor,
    brandLogo,
    headerText,
    messageText,
    surveyDisplay,
    surveyMessage,
    surveyFields = [],
    minimalizedLabel,
    minimalizedLabelActive,
    botName = 'Support Agent',
    messages = [],
    isTyping = false,
    inputValue = '',
    onInputChange = () => { },
    onSendMessage = () => { },
    onClose = () => { },
    chatEndRef
}) => {
    const finalActionColor = actionColor || accentColor || '#a10035';
    const finalAccentColor = accentColor || '#a10035';

    if (type === 'minimal') {
        return (
            <motion.div
                key="minimal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-8 right-8 flex items-end gap-3 scale-90 origin-bottom-right"
            >
                {minimalizedLabelActive && (
                    <div className="bg-white p-3 py-4 rounded-xl shadow-2xl border border-slate-100 text-xs font-bold text-slate-700 flex items-center gap-2 whitespace-nowrap">
                        {minimalizedLabel}
                    </div>
                )}
                <div
                    style={{ backgroundColor: finalAccentColor }}
                    className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white cursor-pointer ring-4 ring-white"
                >
                    <MessageCircle size={26} />
                </div>
            </motion.div>
        );
    }

    if (type === 'interactive') {
        return (
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden h-[540px] w-full max-w-[320px] flex flex-col relative">
                {/* Header */}
                <div style={{ backgroundColor: finalAccentColor }} className="p-4 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center border border-white/20 overflow-hidden">
                            {brandLogo ? (
                                <img src={brandLogo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Bot size={16} />
                            )}
                        </div>
                        <span className="font-bold text-xs">{botName}</span>
                    </div>
                    <X size={16} className="cursor-pointer opacity-80" onClick={onClose} />
                </div>

                {/* Messages Area */}
                <div className="flex-1 bg-[#fafafa] p-4 overflow-y-auto space-y-4 scrollbar-thin">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'self-end' : ''}`}>
                            <div className={`p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm border ${msg.role === 'bot'
                                ? 'bg-[#fdf2f4] text-[#222] rounded-bl-none border-[#eee]'
                                : 'text-white rounded-br-none'
                                }`}
                                style={msg.role === 'user' ? { backgroundColor: finalActionColor, borderColor: finalActionColor } : {}}
                            >
                                {msg.content}
                            </div>
                            <span className={`text-[8px] font-bold text-slate-400 uppercase ${msg.role === 'user' ? 'text-right mr-1' : 'ml-1'}`}>
                                {msg.role === 'bot' ? botName : 'You'}
                            </span>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-1 p-2 bg-[#fdf2f4] rounded-xl w-fit">
                            <span style={{ backgroundColor: finalActionColor }} className="w-1 h-1 rounded-full animate-bounce"></span>
                            <span style={{ backgroundColor: finalActionColor }} className="w-1 h-1 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span style={{ backgroundColor: finalActionColor }} className="w-1 h-1 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={onSendMessage} className="p-3 border-t border-slate-100 flex gap-2 bg-white shrink-0">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => onInputChange(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] outline-none"
                    />
                    <button
                        type="submit"
                        style={{ backgroundColor: finalActionColor }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                    >
                        <Send size={14} />
                    </button>
                </form>
            </div>
        );
    }

    // Default Chat Preview (for Appearance section)
    return (
        <motion.div
            key="chat-preview"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="w-full max-w-[280px] h-[400px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col relative"
        >
            {/* Chat Header */}
            <div style={{ backgroundColor: finalAccentColor }} className="p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/20 overflow-hidden">
                        {brandLogo ? (
                            <img src={brandLogo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <User size={16} />
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-bold leading-none">{botName}</p>
                        <p className="text-[9px] opacity-80 mt-1">Online</p>
                    </div>
                </div>
                <button className="p-1 hover:bg-white/10 rounded">
                    <ChevronDown size={18} />
                </button>
            </div>

            {/* Chat Body */}
            <div className={`flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 ${type === 'survey' ? 'blur-[2px] pointer-events-none' : ''}`}>
                <div className="flex flex-col gap-1 max-w-[85%]">
                    <div className="bg-white p-2.5 rounded-xl rounded-bl-none text-[10px] leading-relaxed text-slate-600 shadow-sm border border-slate-100">
                        {headerText}
                    </div>
                </div>

                <div className="flex flex-col gap-1 max-w-[85%] self-end">
                    <div style={{ backgroundColor: finalActionColor }} className="text-white p-2.5 rounded-xl rounded-br-none text-[10px] leading-relaxed shadow-md shadow-indigo-100/20">
                        I need help with my account.
                    </div>
                </div>

                <div className="flex flex-col gap-1 max-w-[85%]">
                    <div className="bg-white p-2.5 rounded-xl rounded-bl-none text-[10px] leading-relaxed text-slate-600 shadow-sm border border-slate-100">
                        {messageText}
                    </div>
                </div>
            </div>

            {/* Survey Overlay */}
            {type === 'survey' && surveyDisplay && (
                <div className="absolute inset-x-4 bottom-4 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 p-5 z-20 animate-in slide-in-from-bottom-10 duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                            <User size={20} className="text-slate-300" />
                        </div>
                        <ChevronDown size={18} className="text-slate-300" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4">{surveyMessage}</h4>
                    <div className="space-y-3 mb-6">
                        {surveyFields.map(field => (
                            <div key={field.id} className="space-y-2">
                                <input
                                    type="text"
                                    placeholder={field.label}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                                />
                                {field.type === 'email' && field.ask_newsletter && (
                                    <label className="flex items-center gap-2 cursor-pointer px-1">
                                        <input type="checkbox" className="w-3 h-3 rounded accent-blue-600" defaultChecked />
                                        <span className="text-[10px] text-slate-500 font-medium">Ask your visitor for newsletter permission</span>
                                    </label>
                                )}
                            </div>
                        ))}
                    </div>
                    <button style={{ backgroundColor: finalActionColor }} className="w-full py-2.5 rounded-lg text-white font-bold text-xs shadow-lg shadow-indigo-100">
                        Send
                    </button>
                </div>
            )}

            {/* Chat Input */}
            <div className="p-3 border-t border-slate-100 flex gap-2 items-center bg-white">
                <div className="flex-1 bg-slate-50 rounded-full px-3 py-1.5 text-[9px] text-slate-400 border border-slate-200">
                    Enter your message...
                </div>
                <div style={{ backgroundColor: finalActionColor }} className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm opacity-50">
                    <Send size={10} />
                </div>
            </div>
        </motion.div>
    );
};
