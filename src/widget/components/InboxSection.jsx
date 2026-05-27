import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, MoreVertical, ImageIcon, Send, Loader2, Bot } from 'lucide-react';
import Pusher from 'pusher-js';

const InboxSection = ({ accentColor }) => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatList, setChatList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [chatHistory, setChatHistory] = useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [replyValue, setReplyValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const VENDOR_ID = localStorage.getItem('vendor_id') || '19';
    const BASE_URI = import.meta.env.VITE_BASE_URI;

    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const parseMessageContent = (msg) => {
        if (!msg) return '';

        // If it's already an object
        if (typeof msg === 'object' && msg !== null) {
            if (msg.hasOwnProperty('answer') && msg.answer !== null) return msg.answer;
            if (msg.hasOwnProperty('text') && msg.text !== null) return msg.text;
            return JSON.stringify(msg);
        }

        // If it's a string, try to parse as JSON
        if (typeof msg === 'string' && (msg.startsWith('{') || msg.startsWith('['))) {
            try {
                const parsed = JSON.parse(msg);
                if (parsed && typeof parsed === 'object') {
                    if (parsed.hasOwnProperty('answer')) return parsed.answer;
                    if (parsed.hasOwnProperty('text')) return parsed.text;
                }
            } catch (e) {
                return msg;
            }
        }

        return msg;
    };

    // Pusher Setup
    useEffect(() => {
        if (!selectedChat) return;

        // Enable pusher logging for debugging
        Pusher.logToConsole = true;

        const pusher = new Pusher('47cad4071c70ec772da2', {
            cluster: 'ap2',
            forceTLS: true
        });

        const channelName = `widget-chat-admin-${VENDOR_ID}-${selectedChat.id}`;
        console.log('Subscribing to Pusher channel:', channelName);

        const channel = pusher.subscribe(channelName);

        pusher.connection.bind('connected', () => {
            console.log('Pusher connected successfully!');
        });

        channel.bind('new-admin-message', (data) => {
            console.log('New Pusher Message:', data);

            const newMsg = {
                id: data.id || Date.now(),
                sender: data.sender,
                content: parseMessageContent(data.message),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setChatHistory(prev => {
                // Prevent duplicate messages (especially those we just sent)
                const exists = prev.some(m => m.id === newMsg.id || (m.content === newMsg.content && m.sender === newMsg.sender && Math.abs(Date.now() - m.timestamp) < 2000));
                if (exists) return prev;
                return [...prev, { ...newMsg, timestamp: Date.now() }];
            });

            // Update the chat list preview on the left
            setChatList(prev => prev.map(chat => {
                if (chat.id === selectedChat.id) {
                    return {
                        ...chat,
                        message: newMsg.content,
                        time: newMsg.time
                    };
                }
                return chat;
            }));
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
            pusher.disconnect();
        };
    }, [selectedChat, VENDOR_ID]);

    useEffect(() => {
        fetchChatList();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetchChatHistory(selectedChat.id);
        }
    }, [selectedChat]);

    const fetchChatList = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URI}/api/getAdminChatList`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ vendor_id: VENDOR_ID })
            });
            const result = await response.json();

            if (result.success && result.data && result.data.data) {
                const formattedChats = result.data.data.map(chat => {
                    // Simple time formatting from "2026-05-05 09:08:36"
                    const dateObj = new Date(chat.created_at.replace(' ', 'T'));
                    const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return {
                        id: chat.contact_id,
                        name: `Visitor ${chat.contact_id.slice(-4)}`,
                        message: parseMessageContent(chat.message),
                        time: timeString,
                        unread: false,
                        status: 'Online',
                        raw: chat
                    };
                });
                setChatList(formattedChats);
            }
        } catch (error) {
            console.error('Error fetching chat list:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchChatHistory = async (contactId) => {
        setIsHistoryLoading(true);
        setChatHistory([]);
        try {
            const response = await fetch(`${BASE_URI}/api/getContactChatHistory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vendor_id: VENDOR_ID,
                    contact_id: contactId
                })
            });
            const result = await response.json();

            if (result.success && result.data && result.data.data) {
                const formattedHistory = result.data.data.map(msg => {
                    const dateObj = new Date(msg.created_at.replace(' ', 'T'));
                    const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return {
                        id: msg.id,
                        sender: msg.sender,
                        content: parseMessageContent(msg.message),
                        time: timeString
                    };
                }).reverse(); // Most recent at the bottom

                setChatHistory(formattedHistory);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const handleAdminReply = async () => {
        if (!replyValue.trim() || !selectedChat || isSending) return;

        const messageToSend = replyValue.trim();
        setIsSending(true);

        try {
            const response = await fetch(`${BASE_URI}/api/adminReply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vendor_id: VENDOR_ID,
                    contact_id: selectedChat.id,
                    message: messageToSend
                })
            });

            const result = await response.json();
            if (result.success) {
                // Append message to history
                const newMsg = {
                    id: Date.now(), // Temp ID
                    sender: 'admin', // Aligns to the right end
                    content: messageToSend,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setChatHistory(prev => [...prev, newMsg]);
                setReplyValue('');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
        } finally {
            setIsSending(false);
        }
    };

    const filteredChats = chatList.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex gap-4 h-[calc(100vh-140px)] w-full">
            {/* Chat List (Left) */}
            <div className="w-[320px] flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search chats..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-xs"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                            <Loader2 className="animate-spin mb-2" size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Loading chats...</span>
                        </div>
                    ) : filteredChats.length > 0 ? (
                        filteredChats.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                className={`group p-3 flex items-center gap-3 cursor-pointer transition-all ${selectedChat?.id === chat.id
                                    ? 'bg-indigo-50/50'
                                    : 'hover:bg-slate-50'
                                    }`}
                            >
                                <div className="relative shrink-0">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.id}`} alt={chat.name} className="w-10 h-10 rounded-xl bg-slate-100 object-cover border border-slate-200" />
                                    {chat.status === 'Online' && (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className={`text-sm truncate ${selectedChat?.id === chat.id || chat.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>{chat.name}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-slate-400 font-medium">{chat.time}</span>
                                            {chat.raw?.sender?.trim() === 'ai' && <Bot size={10} className="text-indigo-500" />}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-xs truncate ${chat.unread ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>{chat.message}</p>
                                        {chat.unread && (
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 ml-2"></span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-slate-400 p-4 text-center">
                            <MessageSquare className="mb-2 opacity-20" size={24} />
                            <span className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">No conversations found</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Details (Right) */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                {selectedChat ? (
                    <>
                        <header className="p-3 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat.id}`} alt={selectedChat.name} className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm text-slate-800 leading-none">{selectedChat.name}</h3>
                                        {chatHistory.some(m => m.sender?.trim() === 'ai') && <Bot size={14} className="text-indigo-500" />}
                                    </div>
                                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1">{selectedChat.status}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors"><MoreVertical size={16} /></button>
                            </div>
                        </header>

                        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
                            {isHistoryLoading ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <Loader2 className="animate-spin mb-2" size={24} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Retrieving history...</span>
                                </div>
                            ) : chatHistory.length > 0 ? (
                                chatHistory.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col gap-1.5 max-w-[85%] ${msg.sender === 'user' ? 'self-start' : 'self-end'}`}
                                    >
                                        {msg.sender?.trim() === 'ai' && (
                                            <div className="flex items-center gap-1.5 mb-1 self-end mr-1">
                                                <Bot size={12} className="text-indigo-500" />
                                                <span className="text-[9px] font-bold text-indigo-500 uppercase">AI Assistant</span>
                                            </div>
                                        )}
                                        <div
                                            className={`p-3 rounded-xl px-[15px] shadow-sm leading-relaxed text-xs w-fit flex items-end gap-2 ${msg.sender === 'user'
                                                ? 'bg-white border border-slate-100 text-slate-700 rounded-bl-none self-start'
                                                : 'bg-blue-600 text-white rounded-br-none shadow-blue-100/20 self-end'
                                                }`}
                                        >
                                            <span>{msg.content}</span>
                                            {msg.sender?.trim() === 'ai' && <Bot size={12} className="text-white/70 shrink-0 mb-0.5" />}
                                        </div>
                                        <span className={`text-[9px] font-bold text-slate-400 uppercase ${msg.sender === 'user' ? 'text-left ml-1' : 'text-right mr-1'}`}>
                                            {msg.time}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-300 italic text-xs">
                                    No message history found for this contact.
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-3 bg-white border-t border-slate-100">
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200">
                                <button className="p-1.5 text-slate-400 hover:text-slate-600 ml-1"><ImageIcon size={16} /></button>
                                <input
                                    type="text"
                                    value={replyValue}
                                    onChange={(e) => setReplyValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAdminReply();
                                    }}
                                    className="flex-1 bg-transparent border-none outline-none py-1 text-slate-700 placeholder:text-slate-400 font-medium px-1 text-xs"
                                    placeholder="Type a message..."
                                    disabled={isSending}
                                />
                                <button
                                    onClick={handleAdminReply}
                                    disabled={isSending || !replyValue.trim()}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transition-all ${isSending || !replyValue.trim() ? 'bg-slate-300 shadow-none' : 'bg-blue-600 shadow-blue-100/50 hover:scale-105 active:scale-95'
                                        }`}
                                >
                                    {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                            <MessageSquare size={32} className="text-slate-200" />
                        </div>
                        <h3 className="text-slate-900 font-bold mb-1">Select a conversation</h3>
                        <p className="text-xs max-w-[200px]">Choose a chat from the left to view the conversation and start messaging.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InboxSection;
