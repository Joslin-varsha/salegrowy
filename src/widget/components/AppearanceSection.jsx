import React, { useState, useEffect } from 'react';
import { Info, ChevronDown, BookOpen, Home, MessageCircle, Zap, CheckCircle2, Smile, GripVertical, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Accordion from './Accordion';
import { WidgetPreview } from './Widget';

const AppearanceSection = ({ accentColor, setAccentColor }) => {
    const [activeAccordion, setActiveAccordion] = useState('general');
    const [contentTab, setContentTab] = useState('home');
    const [widgetBgColor, setWidgetBgColor] = useState(accentColor || '#3b82f6');
    const [actionColor, setActionColor] = useState('#3b82f6');
    const [welcomeImageType, setWelcomeImageType] = useState('agents');
    const [headerText, setHeaderText] = useState('Hi there 👋');
    const [isBgDropdownOpen, setIsBgDropdownOpen] = useState(false);
    const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
    const [brandLogo, setBrandLogo] = useState(null);
    const [isLogoUploading, setIsLogoUploading] = useState(false);

    const presetColors = [
        { name: 'Indigo', value: '#6366f1' },
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Purple', value: '#8b5cf6' },
        { name: 'Pink', value: '#ec4899' },
        { name: 'Red', value: '#ef4444' },
        { name: 'Orange', value: '#f59e0b' },
        { name: 'Green', value: '#10b981' },
        { name: 'Slate', value: '#475569' },
    ];
    const [messageText, setMessageText] = useState('Welcome to our website. Ask us anything 🦄');
    const [onlineStatus, setOnlineStatus] = useState('We reply immediately');
    const [offlineStatus, setOfflineStatus] = useState('We typically reply within a few minutes.');
    const [surveyDisplay, setSurveyDisplay] = useState(true);
    const [surveyMessage, setSurveyMessage] = useState('Please introduce yourself:');
    const [minimalizedLabelActive, setMinimalizedLabelActive] = useState(true);
    const [minimalizedLabel, setMinimalizedLabel] = useState('Chat with us 👋');
    const [offlineTicketActive, setOfflineTicketActive] = useState(true);
    const [privacyPolicyActive, setPrivacyPolicyActive] = useState(false);

    const [starters, setStarters] = useState([
        { id: 1, text: 'Which product is right for me?', active: true },
        { id: 2, text: 'I have a question about the product', active: true },
        { id: 3, text: 'Do you offer discount codes?', active: true },
        { id: 4, text: 'What is my order status?', active: true },
        { id: 5, text: 'What is the return policy?', active: true },
    ]);
    const VENDOR_ID = localStorage.getItem('vendor_id');
    const VENDOR_UID = localStorage.getItem('vendor_uid');
    const USER_ID = localStorage.getItem('user_id');
    const BASE_URI = import.meta.env.VITE_BASE_URI;

    const [offlineMessage, setOfflineMessage] = useState("We're currently unavailable. We'll get back to you when one of our agents is able to respond. Please provide your email address so we can get in touch with you.");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null

    const [surveyFields, setSurveyFields] = useState([
        { id: 'email', type: 'email', label: '', required: true, ask_newsletter: true },
        { id: 'dept', type: 'department', label: '', required: false }
    ]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch(`${BASE_URI}/api/getWidgetSettings?vendor_id=${VENDOR_UID}`, {
                method: 'GET'
            });
            const result = await response.json();

            if (result.success && result.data) {
                const data = result.data;

                // General Settings
                if (data.general_settings) {
                    setWidgetBgColor(data.general_settings.background_color || '#3b82f6');
                    setActionColor(data.general_settings.action_color || '#3b82f6');
                    setBrandLogo(data.general_settings.brand_logo);
                }

                // Home Content
                if (data.content_home) {
                    setWelcomeImageType(data.content_home.welcome_image_type === 'agents_collage' ? 'agents' : 'logo');
                    setHeaderText(data.content_home.header || 'Hi there 👋');
                    setMessageText(data.content_home.message || '');
                    setOnlineStatus(data.content_home.online_status || '');
                    setOfflineStatus(data.content_home.offline_status || '');

                    if (data.content_home.conversation_starters) {
                        setStarters(data.content_home.conversation_starters.map(s => ({
                            id: s.id,
                            text: s.text,
                            active: s.enabled
                        })));
                    }
                }

                // Chat Content
                if (data.content_chat) {
                    setOfflineMessage(data.content_chat.offline_message || '');
                    setOfflineTicketActive(data.content_chat.let_visitors_create_ticket_offline);
                    setPrivacyPolicyActive(data.content_chat.privacy_policy_message_enabled);
                }

                // Pre-chat Survey
                if (data.content_prechat) {
                    setSurveyDisplay(data.content_prechat.display);
                    setSurveyMessage(data.content_prechat.message || '');
                    if (data.content_prechat.survey_fields) {
                        setSurveyFields(data.content_prechat.survey_fields.map((f, index) => ({
                            id: f.id || index,
                            type: f.type,
                            label: f.label,
                            required: f.required,
                            ask_newsletter: f.ask_newsletter_permission
                        })));
                    }
                }

                // Minimalized
                if (data.content_minimalized) {
                    setMinimalizedLabelActive(data.content_minimalized.show_button_label);
                    setMinimalizedLabel(data.content_minimalized.button_label_text || '');
                }
            }
        } catch (error) {
            console.error('Error fetching widget settings:', error);
        }
    };

    const toggleAccordion = (id) => {
        setActiveAccordion(activeAccordion === id ? null : id);
    };
    const vendor_uid = localStorage.getItem('vendor_uid');


    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLogoUploading(true);
        const formData = new FormData();
        formData.append("filepond", file);
        formData.append("vendorId", vendor_uid);
        formData.append("uploadfile", "whatsapp_image");

        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URI}/api/uploadTempMedia`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setBrandLogo(data.url);
            } else {
                alert(data.message || "Logo upload failed.");
            }
        } catch (error) {
            console.error('Logo upload error:', error);
            alert("Error uploading logo.");
        } finally {
            setIsLogoUploading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);

        const settingsData = {
            vendor_id: VENDOR_ID,
            general_settings: {
                background_color: widgetBgColor,
                action_color: actionColor,
                brand_logo: brandLogo
            },
            content_home: {
                welcome_image_type: welcomeImageType === 'agents' ? 'agents_collage' : 'your_logo',
                header: headerText,
                message: messageText,
                conversation_starters: starters.map(s => ({
                    id: s.id,
                    text: s.text,
                    enabled: s.active
                })),
                online_status: onlineStatus,
                offline_status: offlineStatus
            },
            content_chat: {
                offline_message: offlineMessage,
                let_visitors_create_ticket_offline: offlineTicketActive,
                privacy_policy_message_enabled: privacyPolicyActive
            },
            content_prechat: {
                display: surveyDisplay,
                message: surveyMessage,
                survey_fields: surveyFields.map(f => ({
                    type: f.type,
                    label: f.label,
                    required: f.required,
                    ask_newsletter_permission: f.type === 'email' ? f.ask_newsletter : undefined
                }))
            },
            content_minimalized: {
                show_button_label: minimalizedLabelActive,
                button_label_text: minimalizedLabel
            },
            visibility_position: {
                desktop: {
                    display: true,
                    widget_position: "right",
                    button_type: "corner",
                    hide_on_specific_pages: [],
                    hide_display_for_specific_countries: []
                },
                mobile: {
                    display: true,
                    button_position: "right",
                    button_size: "large",
                    hide_on_specific_pages: [],
                    hide_display_for_specific_countries: []
                }
            }
        };

        console.log('Saving Widget Settings:', settingsData);
        try {
            const response = await fetch(`${BASE_URI}/api/saveWidgetSettings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settingsData),
            });

            if (response.ok) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                setSaveStatus('error');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mx-auto w-full flex flex-col gap-6">
            {/* Info Banner */}
            {/* <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                    If you can't see the widget on your website, or you want to learn more about detailed Shopify set up instructions - <a href="#" className="underline font-semibold">read this article</a>.
                </p>
            </div> */}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Settings side (Left) */}
                <div className="flex-1 space-y-4">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-1">Appearance</h2>
                        <p className="text-xs text-slate-500">Customize your Chat Widget to catch your website visitors' attention or to fit the widget's appearance to your branding.</p>
                    </div>

                    {/* Accordion List */}
                    <div className="space-y-3">
                        {/* General */}
                        <Accordion
                            title="General"
                            isOpen={activeAccordion === 'general'}
                            onToggle={() => toggleAccordion('general')}
                        >
                            <div className="space-y-6">
                                <div className="flex items-center justify-between gap-4 relative">
                                    <label className="text-xs font-semibold text-slate-700">Background color</label>
                                    <div className="relative">
                                        <div
                                            onClick={() => setIsBgDropdownOpen(!isBgDropdownOpen)}
                                            className="flex items-center gap-2 border border-slate-200 rounded-lg p-2 bg-white w-48 justify-between cursor-pointer hover:border-blue-300 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div style={{ backgroundColor: widgetBgColor }} className="w-5 h-5 rounded-full border border-slate-100"></div>
                                                <span className="text-xs font-medium">{presetColors.find(c => c.value === widgetBgColor)?.name || 'Custom'}</span>
                                            </div>
                                            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isBgDropdownOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        <AnimatePresence>
                                            {isBgDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                                                >
                                                    <div className="p-2 grid grid-cols-1 gap-1">
                                                        {presetColors.map((color) => (
                                                            <button
                                                                key={color.value}
                                                                onClick={() => {
                                                                    setWidgetBgColor(color.value);
                                                                    setIsBgDropdownOpen(false);
                                                                }}
                                                                className={`flex items-center gap-2 w-full p-2 rounded-lg hover:bg-slate-50 transition-colors ${widgetBgColor === color.value ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
                                                            >
                                                                <div style={{ backgroundColor: color.value }} className="w-4 h-4 rounded-full border border-slate-100"></div>
                                                                <span className="text-xs font-medium">{color.name}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <label className="text-xs font-semibold text-slate-700">Action color</label>
                                    <div className="relative">
                                        <div
                                            onClick={() => setIsActionDropdownOpen(!isActionDropdownOpen)}
                                            className="flex items-center gap-2 border border-slate-200 rounded-lg p-2 bg-white w-48 justify-between cursor-pointer hover:border-blue-300 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div style={{ backgroundColor: actionColor }} className="w-5 h-5 rounded-full border border-slate-100"></div>
                                                <span className="text-xs font-medium">{presetColors.find(c => c.value === actionColor)?.name || 'Custom'}</span>
                                            </div>
                                            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isActionDropdownOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        <AnimatePresence>
                                            {isActionDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                                                >
                                                    <div className="p-2 grid grid-cols-1 gap-1">
                                                        {presetColors.map((color) => (
                                                            <button
                                                                key={color.value}
                                                                onClick={() => {
                                                                    setActionColor(color.value);
                                                                    setIsActionDropdownOpen(false);
                                                                }}
                                                                className={`flex items-center gap-2 w-full p-2 rounded-lg hover:bg-slate-50 transition-colors ${actionColor === color.value ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
                                                            >
                                                                <div style={{ backgroundColor: color.value }} className="w-4 h-4 rounded-full border border-slate-100"></div>
                                                                <span className="text-xs font-medium">{color.name}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="flex items-start justify-between gap-4">
                                    <div className="w-32">
                                        <label className="text-xs font-semibold text-slate-700 block">Brand logo</label>
                                        <span className="text-[10px] text-slate-400 block mt-1">Custom branding in widget and emails</span>
                                    </div>
                                    <div className="flex-1 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                            {brandLogo ? (
                                                <img src={brandLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                                            ) : (
                                                <Plus size={16} className="text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    id="logo-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                />
                                                <label
                                                    htmlFor="logo-upload"
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${isLogoUploading ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                                                >
                                                    {isLogoUploading ? 'Uploading...' : 'Upload image'}
                                                </label>
                                                {brandLogo && (
                                                    <button
                                                        onClick={() => setBrandLogo(null)}
                                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-[9px] text-slate-400 leading-tight">
                                                Recommended size: 512x512px. Max size: 2MB. Supports PNG, JPG.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* <div className="pt-2">
                                    <a href="#" className="flex items-center gap-2 text-blue-600 text-xs font-semibold hover:underline">
                                        <BookOpen size={16} />
                                        Learn how to customize your widget
                                    </a>
                                </div> */}
                            </div>
                        </Accordion>

                        {/* Content */}
                        <Accordion
                            title="Content"
                            isOpen={activeAccordion === 'content'}
                            onToggle={() => toggleAccordion('content')}
                        >
                            <div className="space-y-6">
                                {/* Content Sub-tabs */}
                                <div className="flex items-center gap-6 border-b border-slate-100 -mx-5 px-5 mb-6">
                                    {[
                                        { id: 'home', icon: <Home size={16} />, label: 'Home' },
                                        { id: 'chat', icon: <MessageCircle size={16} />, label: 'Chat' },
                                        { id: 'survey', icon: <Zap size={16} />, label: 'Pre-chat survey' },
                                        { id: 'minimal', icon: <CheckCircle2 size={16} />, label: 'Minimalized' },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setContentTab(tab.id)}
                                            className={`flex flex-col items-center gap-2 py-3 px-1 border-b-2 transition-all ${contentTab === tab.id ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {tab.icon}
                                            <span className="text-[10px] uppercase tracking-wider">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    {contentTab === 'home' && (
                                        <>
                                            <p className="text-[11px] text-slate-500">Welcome your visitors when they open the widget.</p>

                                            <div className="flex items-start gap-12">
                                                <label className="text-xs font-semibold text-slate-700 w-32 pt-1">Welcome image</label>
                                                <div className="space-y-3">
                                                    <label className="flex items-start gap-2 cursor-pointer group">
                                                        <input
                                                            type="radio"
                                                            name="welcomeImg"
                                                            checked={welcomeImageType === 'agents'}
                                                            onChange={() => setWelcomeImageType('agents')}
                                                            className="mt-1 accent-blue-600"
                                                        />
                                                        <div>
                                                            <span className="text-xs font-semibold text-slate-700 block">Agents collage</span>
                                                            <span className="text-[10px] text-slate-400">Show a collage of your agents' profile pictures at the top of your widget.</span>
                                                        </div>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer group">
                                                        <input
                                                            type="radio"
                                                            name="welcomeImg"
                                                            checked={welcomeImageType === 'logo'}
                                                            onChange={() => setWelcomeImageType('logo')}
                                                            className="accent-blue-600"
                                                        />
                                                        <span className="text-xs font-semibold text-slate-700">Your logo</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-12">
                                                <label className="text-xs font-semibold text-slate-700 w-32 pt-2">Header</label>
                                                <div className="flex-1 relative">
                                                    <textarea
                                                        value={headerText}
                                                        onChange={(e) => setHeaderText(e.target.value)}
                                                        className="w-full p-3 h-20 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/10 outline-none text-xs resize-none"
                                                    />
                                                    <Smile size={16} className="absolute bottom-3 right-3 text-slate-400 cursor-pointer" />
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-12">
                                                <label className="text-xs font-semibold text-slate-700 w-32 pt-2">Message</label>
                                                <div className="flex-1 relative">
                                                    <textarea
                                                        value={messageText}
                                                        onChange={(e) => setMessageText(e.target.value)}
                                                        className="w-full p-3 h-20 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/10 outline-none text-xs resize-none"
                                                    />
                                                    <Smile size={16} className="absolute bottom-3 right-3 text-slate-400 cursor-pointer" />
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-12">
                                                <div className="w-32 pt-1">
                                                    <label className="text-xs font-semibold text-slate-700 block">Conversation starters</label>
                                                    <span className="text-[9px] text-slate-400 leading-tight block mt-1">Visitors can quickly start a conversation with Lyro AI Agent or an agent if available</span>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    {starters.map(starter => (
                                                        <div key={starter.id} className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-lg border border-slate-100 group">
                                                            <GripVertical size={14} className="text-slate-300 cursor-grab" />
                                                            <div
                                                                className={`w-8 h-4 rounded-full relative cursor-pointer transition-all ${starter.active ? 'bg-blue-500' : 'bg-slate-300'}`}
                                                                onClick={() => {
                                                                    setStarters(starters.map(s => s.id === starter.id ? { ...s, active: !s.active } : s));
                                                                }}
                                                            >
                                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${starter.active ? 'left-[18px]' : 'left-0.5 shadow-sm'}`}></div>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={starter.text}
                                                                onChange={(e) => {
                                                                    setStarters(starters.map(s => s.id === starter.id ? { ...s, text: e.target.value } : s));
                                                                }}
                                                                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400 transition-all"
                                                            />
                                                            <button
                                                                onClick={() => setStarters(starters.filter(s => s.id !== starter.id))}
                                                                className="p-1 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                <Trash2 size={14} className="text-slate-300 hover:text-red-500 cursor-pointer transition-colors" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => setStarters([...starters, { id: Date.now(), text: 'New conversation starter', active: true }])}
                                                        className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all mt-2 shadow-sm"
                                                    >
                                                        <Plus size={14} /> Add new
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-12 pt-4">
                                                <label className="text-xs font-semibold text-slate-700 w-32">Online status</label>
                                                <input
                                                    type="text"
                                                    value={onlineStatus}
                                                    onChange={(e) => setOnlineStatus(e.target.value)}
                                                    className="flex-1 p-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/10 text-xs"
                                                />
                                            </div>

                                            <div className="flex items-center gap-12">
                                                <div className="w-32">
                                                    <label className="text-xs font-semibold text-slate-700 block">Offline status</label>
                                                    <a href="#" className="text-[9px] text-blue-600 underline">(adjust online hours)</a>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={offlineStatus}
                                                    onChange={(e) => setOfflineStatus(e.target.value)}
                                                    className="flex-1 p-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/10 text-xs"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {contentTab === 'chat' && (
                                        <>
                                            <p className="text-[11px] text-slate-500">All the conversations with Lyro, agents, and Flows take place here.</p>

                                            <div className="flex items-start gap-12">
                                                <label className="text-xs font-semibold text-slate-700 w-32 pt-2">Offline message</label>
                                                <textarea
                                                    value={offlineMessage}
                                                    onChange={(e) => setOfflineMessage(e.target.value)}
                                                    className="flex-1 p-3 h-28 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/10 outline-none text-xs resize-none leading-relaxed"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between gap-12">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-semibold text-slate-700">Let visitors create ticket when offline</label>
                                                    <Info size={14} className="text-slate-400" />
                                                </div>
                                                <div
                                                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${offlineTicketActive ? 'bg-blue-600' : 'bg-slate-300'}`}
                                                    onClick={() => setOfflineTicketActive(!offlineTicketActive)}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${offlineTicketActive ? 'left-[22px]' : 'left-1'}`}></div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-12">
                                                <label className="text-xs font-semibold text-slate-700">Privacy policy message</label>
                                                <div
                                                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${privacyPolicyActive ? 'bg-blue-600' : 'bg-slate-300'}`}
                                                    onClick={() => setPrivacyPolicyActive(!privacyPolicyActive)}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${privacyPolicyActive ? 'left-[22px]' : 'left-1'}`}></div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {contentTab === 'survey' && (
                                        <>
                                            <p className="text-[11px] text-slate-500">Ask your visitor for their personal information (e.g. email) before the conversation starts. The survey will be mandatory for them.</p>

                                            <div className="flex items-center justify-between gap-12">
                                                <label className="text-xs font-semibold text-slate-700">Display</label>
                                                <div
                                                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${surveyDisplay ? 'bg-blue-600' : 'bg-slate-300'}`}
                                                    onClick={() => setSurveyDisplay(!surveyDisplay)}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${surveyDisplay ? 'left-[22px]' : 'left-1'}`}></div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-12">
                                                <label className="text-xs font-semibold text-slate-700 w-32">Message</label>
                                                <input
                                                    type="text"
                                                    value={surveyMessage}
                                                    onChange={(e) => setSurveyMessage(e.target.value)}
                                                    className="flex-1 p-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/10 text-xs"
                                                />
                                            </div>

                                            <div className="flex items-start gap-12">
                                                <label className="text-xs font-semibold text-slate-700 w-32 pt-1">Survey fields</label>
                                                <div className="flex-1 space-y-3">
                                                    {surveyFields.map(field => (
                                                        <div key={field.id} className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex items-start gap-4 group">
                                                            <span className="text-xs text-slate-500 font-medium w-16 pt-2 capitalize">{field.type}</span>
                                                            <div className="flex-1 space-y-3">
                                                                <input
                                                                    type="text"
                                                                    placeholder={field.type === 'email' ? 'Enter your email...' : field.type === 'phone' ? 'Enter your phone...' : field.type === 'name' ? 'Enter your name...' : 'Enter details...'}
                                                                    value={field.label}
                                                                    onChange={(e) => {
                                                                        setSurveyFields(surveyFields.map(f => f.id === field.id ? { ...f, label: e.target.value } : f));
                                                                    }}
                                                                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-blue-400 transition-all"
                                                                />
                                                                {field.type === 'email' && (
                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={field.ask_newsletter}
                                                                            onChange={(e) => {
                                                                                setSurveyFields(surveyFields.map(f => f.id === field.id ? { ...f, ask_newsletter: e.target.checked } : f));
                                                                            }}
                                                                            className="accent-blue-600"
                                                                        />
                                                                        <span className="text-[10px] text-slate-600 font-medium">Ask your visitor for newsletter permission</span>
                                                                    </label>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => setSurveyFields(surveyFields.filter(f => f.id !== field.id))}
                                                                className="p-1 hover:bg-red-50 rounded transition-colors pt-1"
                                                            >
                                                                <Trash2 size={14} className="text-slate-300 hover:text-red-500 cursor-pointer transition-colors" />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {/* <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                                                        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                                        <p className="text-[10px] text-blue-700 leading-relaxed">
                                                            To set routing rules, please add a department first. <a href="#" className="font-bold underline">Go to departments' settings</a>
                                                        </p>
                                                    </div> */}

                                                    <div className="flex gap-2 flex-wrap">
                                                        {!surveyFields.some(f => f.type === 'name') && (
                                                            <button
                                                                onClick={() => setSurveyFields([...surveyFields, { id: Date.now(), type: 'name', label: 'Enter your name...', required: true }])}
                                                                className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                                                            >
                                                                <Plus size={14} /> Add Name
                                                            </button>
                                                        )}
                                                        {!surveyFields.some(f => f.type === 'phone') && (
                                                            <button
                                                                onClick={() => setSurveyFields([...surveyFields, { id: Date.now() + 1, type: 'phone', label: 'Enter your phone...', required: false }])}
                                                                className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                                                            >
                                                                <Plus size={14} /> Add Phone
                                                            </button>
                                                        )}
                                                        {!surveyFields.some(f => f.type === 'email') && (
                                                            <button
                                                                onClick={() => setSurveyFields([...surveyFields, { id: Date.now() + 2, type: 'email', label: 'Enter your email...', required: true, ask_newsletter: true }])}
                                                                className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                                                            >
                                                                <Plus size={14} /> Add Email
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <div className="pt-2">
                                                <a href="#" className="flex items-center gap-2 text-blue-600 text-xs font-semibold hover:underline">
                                                    <BookOpen size={16} /> Learn when to use a pre-chat survey
                                                </a>
                                            </div> */}
                                        </>
                                    )}

                                    {contentTab === 'minimal' && (
                                        <>
                                            <p className="text-[11px] text-slate-500">You can add button label to encourage visitors to open the widget.</p>

                                            <div className="flex items-center gap-12">
                                                <label className="text-xs font-semibold text-slate-700">Button label</label>
                                                <div
                                                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${minimalizedLabelActive ? 'bg-blue-600' : 'bg-slate-300'}`}
                                                    onClick={() => setMinimalizedLabelActive(!minimalizedLabelActive)}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${minimalizedLabelActive ? 'left-[22px]' : 'left-1'}`}></div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-12">
                                                <div className="w-32"></div>
                                                <input
                                                    type="text"
                                                    value={minimalizedLabel}
                                                    onChange={(e) => setMinimalizedLabel(e.target.value)}
                                                    className="flex-1 p-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/10 text-xs"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Accordion>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-8 py-2.5 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center gap-2 ${isSaving ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700 active:scale-95'}`}
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : 'Save'}
                        </button>

                        <AnimatePresence>
                            {saveStatus === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-50 px-3 py-2 rounded-lg border border-green-100"
                                >
                                    <CheckCircle2 size={14} />
                                    Settings saved successfully!
                                </motion.div>
                            )}
                            {saveStatus === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-1.5 text-red-600 font-bold text-xs bg-red-50 px-3 py-2 rounded-lg border border-red-100"
                                >
                                    Failed to save settings. Please try again.
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Preview Section (Right) */}
                <div className="w-full lg:w-[420px] shrink-0 sticky top-24 h-fit">
                    <div className="w-full flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            Preview: {contentTab.charAt(0).toUpperCase() + contentTab.slice(1)}
                            <ChevronDown size={14} />
                        </div>
                    </div>
                    <div className="w-full aspect-[3/4] bg-white rounded-2xl relative overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center p-4" style={{
                        backgroundImage: `linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)`,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                    }}>
                        <AnimatePresence mode="wait">
                            <WidgetPreview
                                type={contentTab}
                                accentColor={widgetBgColor}
                                actionColor={actionColor}
                                brandLogo={brandLogo}
                                headerText={headerText}
                                messageText={messageText}
                                surveyDisplay={surveyDisplay}
                                surveyMessage={surveyMessage}
                                surveyFields={surveyFields}
                                minimalizedLabel={minimalizedLabel}
                                minimalizedLabelActive={minimalizedLabelActive}
                            />
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppearanceSection;
