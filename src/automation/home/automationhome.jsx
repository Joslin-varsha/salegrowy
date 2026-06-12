import { CRMLayout } from "../components/CRMLayout";
import {
    automationRules as initialRules,
    automationLogs as initialLogs,
    stages,
    agents,
} from "../data/mockData";

import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "../components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../components/ui/alert-dialog";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import {
    Zap,
    Plus,
    MessageSquare,
    MousePointerClick,
    Clock,
    Bell,
    ArrowRight,
    Tag,
    Send,
    UserPlus,
    Pencil,
    Trash2,
    Copy,
    Activity,
    CheckCircle,
    XCircle,
    SkipForward,
    Inbox,
    GitBranch,
    Radio,
    UserX,
    Timer,
    Webhook,
    ShoppingBag,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    Target,
    History,
    Star,
    Lock,
    TrendingUp,
    TrendingDown,
    ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { ConditionBuilder } from "../components/automation/ConditionBuilder";
import { ActionBuilder } from "../components/automation/ActionBuilder";
import { WebhookConfigPanel } from "../components/automation/WebhookConfig";
import { RecurringConfigPanel } from "../components/automation/RecurringConfig";
import { SpecificDateConfigPanel } from "../components/automation/SpecificDateConfig";
import { DailyTimeConfigPanel } from "../components/automation/DailyTimeConfig";
import { BeforeDateConfigPanel } from "../components/automation/BeforeDateConfig";
import { AfterDateConfigPanel } from "../components/automation/AfterDateConfig";
import { format } from "date-fns";
import { Separator } from "../components/ui/separator";
import { getVendorId } from "../utils/getVendorId";

const BASE_URI = import.meta.env.VITE_BASE_URI;
const USER_ID = localStorage.getItem('user_id');


// const triggerTypeOptions = [
//     { value: "incoming_message", label: "Incoming Message", icon: Inbox, description: "When any message is received" },
//     { value: "keyword", label: "Keyword Detected", icon: MessageSquare, description: "When message contains specific keywords" },
//     { value: "button_click", label: "Button Click", icon: MousePointerClick, description: "When user clicks a WhatsApp button" },
//     { value: "lead_created", label: "Lead Created", icon: Plus, description: "When a new lead is added" },
//     { value: "stage_changed", label: "Stage Changed", icon: GitBranch, description: "When lead moves to a new stage" },
//     { value: "campaign_reply", label: "Campaign Reply", icon: Radio, description: "When lead replies to a campaign" },
//     { value: "no_response", label: "No Agent Response", icon: UserX, description: "When agent hasn't replied in time" },
//     { value: "lead_inactive", label: "Lead Inactive", icon: Timer, description: "When lead has been inactive" },
//     { value: "webhook", label: "Webhook Trigger", icon: Webhook, description: "Trigger from external systems (Shopify, etc.)" },
// ];
// const triggerIcons = {
//     incoming_message: <Inbox className="h-4 w-4" />,
//     keyword: <MessageSquare className="h-4 w-4" />,
//     button_click: <MousePointerClick className="h-4 w-4" />,
//     lead_created: <Plus className="h-4 w-4" />,
//     stage_changed: <GitBranch className="h-4 w-4" />,
//     campaign_reply: <Radio className="h-4 w-4" />,
//     no_response: <UserX className="h-4 w-4" />,
//     lead_inactive: <Timer className="h-4 w-4" />,
//     webhook: <Webhook className="h-4 w-4" />,
// };

let triggerTypeOptions = [];
let triggerIcons = {};

const actionLabels = {
    move_lead_stage: "Move Lead Stage",
    assign_agent: "Assign agent",
    add_tag: "Add tag",
    update_field: "Update field",
    send_message: "Send message",
    send_template: "Send template",
    send_buttons: "Send buttons",
    create_followup: "Create follow-up",
    notify_agent: "Notify agent",
    notify_admin: "Notify admin",
};

const actionIcons = {
    move_lead_stage: <ArrowRight className="h-3.5 w-3.5" />,
    assign_agent: <UserPlus className="h-3.5 w-3.5" />,
    send_message: <Send className="h-3.5 w-3.5" />,
    send_template: <Send className="h-3.5 w-3.5" />,
    send_buttons: <Send className="h-3.5 w-3.5" />,
    notify_agent: <Bell className="h-3.5 w-3.5" />,
    notify_admin: <Bell className="h-3.5 w-3.5" />,
    add_tag: <Tag className="h-3.5 w-3.5" />,
    update_field: <Pencil className="h-3.5 w-3.5" />,
    create_followup: <Clock className="h-3.5 w-3.5" />,
};

const getActionDisplayValue = (action) => {
    if (action.type === "move_lead_stage" || action.type === "move_stage") {
        const stage = stages.find((s) => s.id?.toString() === action.value?.toString());
        return stage ? stage.name : action.value;
    }
    if (action.type === "assign_agent") {
        const agent = agents.find((a) => a.id === action.value);
        return agent ? agent.name : action.value;
    }
    return action.value.length > 40 ? action.value.slice(0, 40) + "…" : action.value;
};

const getTriggerDescription = (rule) => {
    const opt = triggerTypeOptions.find((t) => t.value === rule.triggerType);
    const label = opt?.label || rule.triggerType;
    if (rule.triggerType === "webhook" && rule.webhookConfig) {
        const sourceLabel = rule.webhookConfig.source.charAt(0).toUpperCase() + rule.webhookConfig.source.slice(1);
        return `Webhook: ${sourceLabel}`;
    }
    if (rule.triggerValue) return `${label}: "${rule.triggerValue}"`;
    return label;
};

const defaultWebhookConfig = {
    source: "shopify",
    event: "order_created",
    webhookUrl: "",
    fieldMappings: [
        { id: "fm1", webhookField: "name", crmField: "name" },
        { id: "fm2", webhookField: "phone", crmField: "phone" },
        { id: "fm3", webhookField: "email", crmField: "email" },
    ],
};

const defaultRecurringConfig = {
    frequency: "Every Month",
    scheduleType: 2,
    specific_day_of_month: "",
    specific_week: "First",
    specific_day: "Monday",
    week_days: "",
    specific_time: ""
};


const defaultSpecificDateConfig = {
    date: "",
    time: "09:00"
};

const defaultDailyTimeConfig = {
    time: "09:00"
};

const defaultBeforeDateConfig = {
    referenceField: "",
    daysBefore: "2",
    time: "09:00"
};

const defaultAfterDateConfig = {
    referenceField: "",
    daysAfter: "3",
    time: "09:00"
};

const emptyForm = {
    name: "",
    triggerType: "",
    triggerValue: "",
    conditionLogic: "AND",
    conditions: [{ id: `c${Date.now()}`, field: "", conditionMasterId: null, operator: "", value: "", conditionMasterValueId: "" }],
    actions: [{ id: `a${Date.now()}`, type: "", actionMasterId: null, value: "", order: 1 }],
    webhookConfig: undefined,
    recurringConfig: { ...defaultRecurringConfig },
    specificDateConfig: { ...defaultSpecificDateConfig },
    dailyTimeConfig: { ...defaultDailyTimeConfig },
    beforeDateConfig: { ...defaultBeforeDateConfig },
    afterDateConfig: { ...defaultAfterDateConfig },
    // Automation control settings
    stop_if_customer_replies: 0,
    stop_for_24_hours: 0,
    stop_once_per_conversation: 0,
    stop_until_agent_responds: 0,
    stop_until_new_trigger: 0,
};

export default function Automations() {
    const [VENDOR_ID, setVendorId] = useState(null);

    // Fetch real vendor ID (vendors__id) from profile API on mount
    // Starts as null — data fetching is blocked until this resolves
    useEffect(() => {
        getVendorId().then(id => {
            if (id) setVendorId(id);
        });
    }, []);

    const formatTimeForInput = (timeStr) => {
        if (!timeStr) return "09:00";
        // If it's HH:mm:ss, take only HH:mm
        const parts = timeStr.split(':');
        if (parts.length >= 2) {
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        }
        return timeStr;
    };

    const formatTime12h = (timeStr) => {
        const hhmm = formatTimeForInput(timeStr);
        if (!hhmm) return "";
        const parts = hhmm.split(':');
        let h = parseInt(parts[0], 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12; // the hour '0' should be '12'
        return `${h}:${parts[1]} ${ampm}`;
    };

    const [rules, setRules] = useState([]);
    const [rulesLoading, setRulesLoading] = useState(true);
    const [rulesPagination, setRulesPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 15
    });
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsPagination, setLogsPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 15
    });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [activeTab, setActiveTab] = useState("rules");
    const [subActiveTab, setSubActiveTab] = useState("scoring_rules");
    const [triggers, setTriggers] = useState([]);
    const [triggersLoading, setTriggersLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);

    const [step1ConfirmOpen, setStep1ConfirmOpen] = useState(false);
    const [creatingStep1, setCreatingStep1] = useState(false);
    const [savingStep2, setSavingStep2] = useState(false);
    const [savingStep3, setSavingStep3] = useState(false);
    const [stages, setStages] = useState([]);
    const [columnsLoading, setColumnsLoading] = useState(false);
    const [customLeadFields, setCustomLeadFields] = useState([]);

    // Fetch triggers from API
    useEffect(() => {
        const fetchTriggers = async () => {
            if (!VENDOR_ID) return;
            try {
                setTriggersLoading(true);
                const response = await axios.post(`${BASE_URI}/api/automationRuleMasterListShopify`, {
                    vendorId: VENDOR_ID
                });
                if (response.data.status && response.data.data && response.data.data.automationMaster) {
                    const apiTriggers = response.data.data.automationMaster;

                    // Clear existing arrays before adding new triggers
                    triggerTypeOptions.length = 0;
                    Object.keys(triggerIcons).forEach(key => delete triggerIcons[key]);

                    // Update triggerTypeOptions with API data
                    const updatedTriggerOptions = apiTriggers.map(trigger => {
                        let finalIcon = Inbox;
                        if (trigger.icon) {
                            finalIcon = ({ className }) => {
                                const cleanSvg = trigger.icon.replace(/class="[^"]*"/g, `class="${className}"`);
                                return <span dangerouslySetInnerHTML={{ __html: cleanSvg }} className="inline-flex items-center justify-center shrink-0" />;
                            };
                        }

                        return {
                            value: trigger.name.toLowerCase().replace(/\s+/g, '_'),
                            label: trigger.name,
                            icon: finalIcon,
                            description: trigger.description,
                            masterId: trigger._id // Add masterId for condition fields
                        };
                    });

                    // Update triggerIcons with API data
                    const updatedTriggerIcons = {};
                    apiTriggers.forEach(trigger => {
                        const triggerKey = trigger.name.toLowerCase().replace(/\s+/g, '_');
                        let finalIcon = <Inbox className="h-4 w-4" />;
                        if (trigger.icon) {
                            const cleanSvg = trigger.icon.replace(/class="[^"]*"/g, `class="h-4 w-4"`);
                            finalIcon = <span dangerouslySetInnerHTML={{ __html: cleanSvg }} className="inline-flex items-center justify-center shrink-0" />;
                        }
                        updatedTriggerIcons[triggerKey] = finalIcon;
                    });

                    // Update the global variables
                    triggerTypeOptions.push(...updatedTriggerOptions);
                    Object.assign(triggerIcons, updatedTriggerIcons);
                    setTriggers(apiTriggers);
                }
            } catch (error) {
                console.error("Error fetching triggers:", error);
                toast.error("Failed to load triggers");
            } finally {
                setTriggersLoading(false);
            }
        };

        const fetchColumns = async () => {
            if (!VENDOR_ID) return;
            try {
                setColumnsLoading(true);
                const response = await axios.post(`${BASE_URI}/api/get-columns`, {
                    vendorId: VENDOR_ID
                });
                if (response.data.status === "success" && response.data.data) {
                    const stageData = response.data.data.map(stage => ({
                        id: stage.id,
                        name: stage.header_name
                    }));
                    setStages(stageData);
                }
            } catch (error) {
                console.error("Error fetching columns:", error);
            } finally {
                setColumnsLoading(false);
            }
        };

        const fetchCustomLeadFields = async () => {
            if (!VENDOR_ID) return;
            try {
                const response = await axios.post(`${BASE_URI}/api/listLeadCustomFields`, {
                    vendorId: VENDOR_ID
                });
                if (response.data.status && Array.isArray(response.data.data)) {
                    setCustomLeadFields(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching custom lead fields:", error);
            }
        };

        fetchTriggers();
        fetchColumns();
        fetchCustomLeadFields();
    }, [VENDOR_ID]); // Wait for real vendors__id before fetching


    const [leadScores, setLeadScores] = useState([]);
    const [leadScoresLoading, setLeadScoresLoading] = useState(false);

    const [auditLogs, setAuditLogs] = useState([]);
    const [auditLogsLoading, setAuditLogsLoading] = useState(false);

    const [predefinedScoringRules, setPredefinedScoringRules] = useState([]);
    const [customScoringRules, setCustomScoringRules] = useState([]);
    const [scoringRulesLoading, setScoringRulesLoading] = useState(false);

    const fetchScoringRules = async () => {
        if (!VENDOR_ID) return;
        try {
            setScoringRulesLoading(true);
            const response = await axios.post(`${BASE_URI}/api/predefinedSystemRules`, {
                vendorId: VENDOR_ID
            });
            if (response.data.status && Array.isArray(response.data.data)) {
                setPredefinedScoringRules(response.data.data.map(rule => {
                    const pointsMatch = rule.name.match(/\(([+-]?\d+)\)/);
                    const points = pointsMatch ? parseInt(pointsMatch[1]) : 0;
                    const cleanName = rule.name.replace(/\s?\([+-]?\d+\)/, "");
                    return {
                        id: rule.id,
                        name: cleanName,
                        points: points,
                        trigger: rule.description.replace("Trigger: ", ""),
                        active: Number(rule.status) === 1
                    };
                }));
            }
        } catch (error) {
            console.error("Error fetching scoring rules:", error);
            // toast.error("Failed to load scoring rules");
        } finally {
            setScoringRulesLoading(false);
        }
    };

    const fetchAuditLogs = async () => {
        if (!VENDOR_ID) return;
        try {
            setAuditLogsLoading(true);
            const response = await axios.post(`${BASE_URI}/api/getLeadScoreExecutionLogs`, {
                vendorId: VENDOR_ID
            });
            if (response.data.status && Array.isArray(response.data.data)) {
                setAuditLogs(response.data.data.map(log => ({
                    id: log.id,
                    timestamp: log.created_at || "—",
                    lead: log.Lead,
                    event: log.event,
                    rule: log.rule,
                    type: log.type,
                    change: parseInt(log.score) || 0,
                    total: parseInt(log.total) || 0
                })));
            }
        } catch (error) {
            console.error("Error fetching audit logs:", error);
        } finally {
            setAuditLogsLoading(false);
        }
    };

    const fetchLeadScores = async () => {
        if (!VENDOR_ID) return;
        try {
            setLeadScoresLoading(true);
            const response = await axios.post(`${BASE_URI}/api/getLeadsWithScoreApi`, {
                vendor_id: VENDOR_ID
            });
            if (response.data.status && Array.isArray(response.data.data)) {
                setLeadScores(response.data.data.map(lead => ({
                    id: lead._id,
                    name: lead.full_name || `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || lead.email || "Unknown Lead",
                    phone: lead.wa_id || lead.email || "—",
                    score: lead.lead_score || 0,
                    priority: lead.priority || "Low",
                    source: lead.created_from_source || "—"
                })));
            }
        } catch (error) {
            console.error("Error fetching lead scores:", error);
        } finally {
            setLeadScoresLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "lead_scoring") {
            if (subActiveTab === "scoring_rules") {
                fetchScoringRules();
            } else if (subActiveTab === "lead_scores") {
                fetchLeadScores();
            } else if (subActiveTab === "audit_logs") {
                fetchAuditLogs();
            }
        }
    }, [activeTab, subActiveTab]);

    const togglePredefinedRule = async (id) => {
        const rule = predefinedScoringRules.find(r => r.id === id);
        if (!rule) return;

        const newStatus = !rule.active;

        // Optimistic update
        setPredefinedScoringRules(prev => prev.map(r => r.id === id ? { ...r, active: newStatus } : r));

        try {
            const response = await axios.post(`${BASE_URI}/api/savePredefinedSystemRules`, {
                vendorId: VENDOR_ID,
                master: id,
                status: newStatus ? 1 : 0
            });

            if (!response.data.status) {
                // Revert on failure
                setPredefinedScoringRules(prev => prev.map(r => r.id === id ? { ...r, active: !newStatus } : r));
                toast.error(response.data.message || "Failed to toggle rule");
            } else {
                toast.success(`Rule ${newStatus ? 'activated' : 'deactivated'}`);
            }
        } catch (error) {
            console.error("Error toggling rule:", error);
            setPredefinedScoringRules(prev => prev.map(r => r.id === id ? { ...r, active: !newStatus } : r));
            toast.error("Failed to toggle rule");
        }
    };

    // Helper to format duplicate names
    const formatRuleName = (name) => {
        if (!name) return "";
        const copyPattern = /(\s\(Copy\s?\d*\))+$/;
        const match = name.match(copyPattern);
        if (!match) return name;

        const baseName = name.replace(copyPattern, "").trim();
        const copyMatches = name.match(/\(Copy\s?(\d*)\)/g) || [];
        let totalCount = 0;
        copyMatches.forEach(m => {
            const numMatch = m.match(/\d+/);
            totalCount += numMatch ? parseInt(numMatch[0], 10) : 1;
        });

        return `${baseName} (${totalCount})`;
    };

    // Fetch rules from API
    const loadRules = async (page = 1) => {
        try {
            setRulesLoading(true);
            const response = await axios.post(`${BASE_URI}/api/automation-rule-list`, {
                vendorId: VENDOR_ID,
                per_page: rulesPagination.perPage,
                page: page
            });
            if (response.data.status && response.data.data) {
                const apiData = response.data.data;
                // Handle both paginated and non-paginated responses
                const actualData = Array.isArray(apiData) ? apiData : (apiData.data || []);

                const apiRules = actualData.map(rule => ({
                    id: rule._id,
                    name: formatRuleName(rule.name),
                    triggerName: rule.trigger_name,

                    conditionLogic: rule.setOperation,
                    conditions: (rule.conditions || []).map((c, i) => ({
                        id: `c_${rule._id}_${i}`,
                        condition_name: c.condition_name,
                        operator: c.operator,
                        value: c.value,
                        condition_webhook_key: c.condition_webhook_key
                    })),
                    actions: (rule.actions || []).map((a, i) => {
                        let parsedExtraValues = a.extra_values;
                        if (typeof parsedExtraValues === "string") {
                            try {
                                parsedExtraValues = JSON.parse(parsedExtraValues);
                            } catch (e) {
                                console.error("Error parsing extra_values JSON", e);
                            }
                        }
                        return {
                            id: `a_${rule._id}_${i}`,
                            action_name: a.action_name,
                            value: a.value,
                            extra_values: parsedExtraValues,
                            reminder_time: a.reminder_time,
                        };
                    }),
                    webhookConfig: (() => {
                        if (rule.webhook_source || rule.webhook_url) {
                            const mappings = [];
                            if (rule.name_key_from_webhook) mappings.push({ id: "fm1", webhookField: rule.name_key_from_webhook, crmField: "name" });
                            if (rule.phone_key_from_webhook) mappings.push({ id: "fm2", webhookField: rule.phone_key_from_webhook, crmField: "phone" });
                            if (rule.email_key_from_webhook) mappings.push({ id: "fm3", webhookField: rule.email_key_from_webhook, crmField: "email" });
                            return {
                                source: rule.webhook_source,
                                event: rule.webhook_event || "",
                                webhookUrl: rule.webhook_url || "",
                                fieldMappings: mappings
                            };
                        }
                        return undefined;
                    })(),
                    createdAt: rule.created_at,
                    active: rule.status === 1,
                    stop_if_customer_replies: Number(rule.stop_if_customer_replies ?? 0),
                    stop_for_24_hours: Number(rule.stop_for_24_hours ?? 0),
                    stop_once_per_conversation: Number(rule.stop_once_per_conversation ?? 0),
                    stop_until_agent_responds: Number(rule.stop_until_agent_responds ?? 0),
                    stop_until_new_trigger: Number(rule.stop_until_new_trigger ?? 0),
                    trigger_days_before_after: rule.trigger_days_before_after,
                    originalData: rule // Store for reference
                }));
                setRules(apiRules);
                setRulesPagination({
                    currentPage: apiData.current_page || 1,
                    lastPage: apiData.last_page || 1,
                    total: apiData.total || actualData.length,
                    perPage: apiData.per_page || 15
                });
            }
        } catch (error) {

            console.error("Error loading rules:", error);
        } finally {
            setRulesLoading(false);
        }
    };

    // Fetch execution logs from API
    const loadLogs = async (page = 1) => {
        try {
            setLogsLoading(true);
            const response = await axios.post(`${BASE_URI}/api/automation-execution-logs`, {
                vendorId: VENDOR_ID,
                per_page: logsPagination.perPage,
                page: page
            });

            if (response.data.status && response.data.data) {
                const apiData = response.data.data;
                const actualData = Array.isArray(apiData) ? apiData : (apiData.data || []);
                setLogs(actualData);
                setLogsPagination({
                    currentPage: apiData.current_page || 1,
                    lastPage: apiData.last_page || 1,
                    total: apiData.total || actualData.length,
                    perPage: apiData.per_page || 15
                });
            }
        } catch (error) {
            console.error("Error loading logs:", error);
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "logs" || activeTab === "execution_logs" || subActiveTab === "audit_logs") {
            loadLogs(1);
        }
    }, [activeTab, subActiveTab]);

    useEffect(() => {
        if (!VENDOR_ID) return;
        loadRules();
    }, [VENDOR_ID]); // Wait for real vendors__id before fetching


    const toggleRule = async (id) => {
        const rule = rules.find((r) => r.id === id);
        if (!rule) return;

        const newStatus = !rule.active;
        try {
            const response = await axios.post(`${BASE_URI}/api/toggle-automation-rule`, {
                vendorId: parseInt(VENDOR_ID),
                rule_id: id,
                status: newStatus ? 1 : 0
            });

            if (response.data.status) {
                setRules((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, active: newStatus } : r))
                );
                toast.success(`"${rule.name}" ${newStatus ? "activated" : "deactivated"}`);
            } else {
                toast.error(response.data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error toggling rule:", error);
            toast.error("An error occurred while toggling the rule");
        }
    };

    const openCreate = () => {
        setEditingId(null);
        setForm({
            ...emptyForm,
            conditions: [{ id: `c${Date.now()}`, field: "", conditionMasterId: null, operator: "", value: "" }],
            actions: [{ id: `a${Date.now()}`, type: "", actionMasterId: null, value: "", order: 1 }],
        });
        setCurrentStep(1);
        setDialogOpen(true);
    };

    const openEdit = async (rule) => {
        try {
            console.log("Opening edit for rule:", rule);
            setEditingId(rule.id);

            // Find trigger to get masterId for actions
            const trigger = triggerTypeOptions.find(t =>
                t.label?.toLowerCase() === rule.triggerName?.toLowerCase() ||
                t.value?.toLowerCase() === rule.triggerName?.toLowerCase() ||
                t.label?.toLowerCase() === rule.originalData?.trigger_name?.toLowerCase() ||
                t.value?.toLowerCase() === rule.originalData?.trigger_name?.toLowerCase()
            );
            const triggerMasterId = trigger?.masterId;
            console.log("Matched trigger:", trigger);

            // Fetch actions for this trigger to find actionMasterId by name
            let actionsMaster = [];
            if (triggerMasterId) {
                try {
                    const response = await axios.post(`${BASE_URI}/api/automationRuleActionMasterList`, {
                        vendorId: VENDOR_ID,
                        masterId: triggerMasterId
                    });
                    if (response.data.status && response.data.data && response.data.data.automationMaster) {
                        actionsMaster = response.data.data.automationMaster;
                    }
                } catch (error) {
                    console.error("Error fetching actions list:", error);
                }
            }

            const triggerInfo = triggers.find(t => t.name === rule.triggerName);

            const mappedConditions = (rule.conditions || []).map(c => {
                const conditionMaster = triggerInfo?.conditions?.find(mc => mc.name === c.condition_name);
                return {
                    id: c.id || `c${Date.now()}_${Math.random()}`,
                    conditionMasterId: conditionMaster?._id || null,
                    field: c.condition_name?.toLowerCase().replace(/\s+/g, '_') || "",
                    operator: c.operator?.toLowerCase().replace(/\s+/g, '_') || "",
                    value: c.value,
                    webhookField: c.condition_webhook_key || ""
                };
            });

            const mappedActions = (rule.actions || []).map(a => {
                const actionMaster = actionsMaster.find(am => am.name === a.action_name);
                const type = actionMaster?.name?.toLowerCase().replace(/\s+/g, '_') || a.action_name?.toLowerCase().replace(/\s+/g, '_') || "";

                let value = a.value;
                let extra_values = {};
                try {
                    if (typeof a.extra_values === 'string') {
                        extra_values = JSON.parse(a.extra_values);
                    } else if (typeof a.extra_values === 'object' && a.extra_values !== null) {
                        extra_values = { ...a.extra_values };
                    }
                } catch (e) {
                    console.error("Error parsing extra_values:", e);
                }

                // Extraction of reminder_time from either top-level or extra_values
                const reminder_time = a.reminder_time || extra_values.reminder_time || "";
                console.log("reminder_time", a)
                if (reminder_time) {
                    extra_values.reminder_time = reminder_time;
                }

                if (typeof a.value === "string" && (a.value.includes('"interaction_message"') || a.value.includes('"media_message"'))) {
                    try {
                        const parsed = JSON.parse(a.value);
                        if (parsed.interaction_message) {
                            const im = parsed.interaction_message;
                            value = im.body_text || im.reply_text || "";
                            extra_values = {
                                ...extra_values,
                                buttonType: im.interactive_type === "cta_url" ? "cta" : (im.interactive_type === "list" ? "list" : "reply"),
                                headerType: im.header_type || "",
                                headerText: im.header_text || "",
                                footerText: im.footer_text || "",
                                [`header_${im.header_type || ""}`]: im.media_link || "",
                                uploadFileName: im.uploaded_media_file_name || ""
                            };
                            if (im.buttons && typeof im.buttons === "object" && !Array.isArray(im.buttons)) {
                                extra_values.button1 = im.buttons["1"] || "";
                                extra_values.button2 = im.buttons["2"] || "";
                                extra_values.button3 = im.buttons["3"] || "";
                            }
                            if (im.interactive_type === "cta_url") {
                                if (im.cta_url && typeof im.cta_url === "object") {
                                    extra_values.ctaUrl = im.cta_url.url || "";
                                    extra_values.ctaButtonText = im.cta_url.display_text || "";
                                } else {
                                    extra_values.ctaUrl = im.cta_url || "";
                                    extra_values.ctaButtonText = im.button_display_text || im.cta_button_text || "";
                                }
                            }
                            if (im.interactive_type === "list" && im.list_data) {
                                extra_values.listButtonText = im.list_data.button_text || "";
                                const sectionsArray = [];
                                if (im.list_data.sections) {
                                    Object.values(im.list_data.sections).forEach(sec => {
                                        const rowsArray = sec.rows ? Object.values(sec.rows) : [];
                                        sectionsArray.push({
                                            id: sec.id || Date.now(),
                                            title: sec.title || "",
                                            rows: rowsArray.map(r => ({
                                                id: r.id || Date.now(),
                                                row_id: r.row_id || "",
                                                title: r.title || "",
                                                description: r.description || ""
                                            }))
                                        });
                                    });
                                }
                                extra_values.sections = sectionsArray;
                            }
                        } else if (parsed.media_message) {
                            const mm = parsed.media_message;
                            value = "";
                            extra_values = {
                                ...extra_values,
                                selectedType: mm.header_type || "image",
                                caption: mm.caption || "",
                                [`header_${mm.header_type || "image"}`]: mm.media_link || "",
                                uploadFileName: mm.file_name || ""
                            };
                        }
                    } catch (e) {
                        console.error("Error parsing JSON action value", e);
                    }
                }

                return {
                    ...a,
                    id: a.id || `a${Date.now()}_${Math.random()}`,
                    actionMasterId: a.actions_master_id || actionMaster?._id || actionMaster?.id || null,
                    type: type,
                    value: value,
                    extra_values: extra_values,
                    reminder_time: reminder_time
                };
            });

            let triggerVal = rule.originalData?.value || "";
            let parsedRecurring = { ...defaultRecurringConfig };
            let parsedSpecificDate = { ...defaultSpecificDateConfig };
            let parsedDailyTime = { ...defaultDailyTimeConfig };
            let parsedBeforeDate = { ...defaultBeforeDateConfig };
            let parsedAfterDate = { ...defaultAfterDateConfig };
            if (trigger?.value?.includes('recurring') || rule.triggerName === 'Recurring') {
                const data = rule.originalData || {};
                parsedRecurring = {
                    ...defaultRecurringConfig,
                    frequency: data.trigger_recurring_frequency || defaultRecurringConfig.frequency,
                    week_days: data.trigger_recurring_WeekDays || defaultRecurringConfig.week_days,
                    scheduleType: data.trigger_schedule_type || defaultRecurringConfig.scheduleType,
                    specific_day_of_month: data.trigger_schedule_specific_day_of_month || defaultRecurringConfig.specific_day_of_month,
                    specific_week: data.trigger_schedule_specific_week || defaultRecurringConfig.specific_week,
                    specific_day: data.trigger_schedule_specific_day || defaultRecurringConfig.specific_day,
                    specific_time: formatTimeForInput(data.trigger_time || defaultRecurringConfig.specific_time)
                };
            }
            else if (trigger?.value?.includes('specific_date') || trigger?.value?.includes('specific date')) {

                let parsed = {};
                try {
                    parsed = JSON.parse(triggerVal) || {};
                } catch (e) { }

                parsedSpecificDate = {
                    ...defaultSpecificDateConfig,
                    date: rule.originalData?.trigger_date || rule.originalData?.specific_date || parsed.date || defaultSpecificDateConfig.date,
                    time: formatTimeForInput(rule.originalData?.trigger_time || rule.originalData?.specific_time || parsed.time || defaultSpecificDateConfig.time)
                };
            } else if (trigger?.value?.includes('daily')) {
                let parsed = {};
                try {
                    parsed = JSON.parse(triggerVal) || {};
                } catch (e) { }

                parsedDailyTime = {
                    ...defaultDailyTimeConfig,
                    ...parsed,
                    time: formatTimeForInput(rule.originalData?.trigger_time || rule.originalData?.specific_time || parsed.time || defaultDailyTimeConfig.time)
                };
            } else if (trigger?.value?.includes('before_date') || trigger?.value?.includes('before date')) {
                let parsed = {};
                try {
                    parsed = JSON.parse(triggerVal) || {};
                } catch (e) { }

                parsedBeforeDate = {
                    ...defaultBeforeDateConfig,
                    time: formatTimeForInput(rule.originalData?.trigger_time || rule.originalData?.specific_time || parsed.time || defaultBeforeDateConfig.time),
                    daysBefore: rule.originalData?.trigger_days_before_after || rule.originalData?.days_before_after || parsed.daysBefore || defaultBeforeDateConfig.daysBefore,
                    referenceField: rule.originalData?.trigger_lead_ref_id || rule.originalData?.lead_ref_id || parsed.referenceField || defaultBeforeDateConfig.referenceField
                };
            } else if (trigger?.value?.includes('after_date') || trigger?.value?.includes('after date')) {
                let parsed = {};
                try {
                    parsed = JSON.parse(triggerVal) || {};
                } catch (e) { }

                parsedAfterDate = {
                    ...defaultAfterDateConfig,
                    time: formatTimeForInput(rule.originalData?.trigger_time || rule.originalData?.specific_time || parsed.time || defaultAfterDateConfig.time),
                    daysAfter: rule.originalData?.trigger_days_before_after || rule.originalData?.days_before_after || parsed.daysAfter || defaultAfterDateConfig.daysAfter,
                    referenceField: rule.originalData?.trigger_lead_ref_id || rule.originalData?.lead_ref_id || parsed.referenceField || defaultAfterDateConfig.referenceField
                };
            }

            const newForm = {
                name: rule.name || "",
                triggerType: trigger?.value || rule.triggerName || "",
                triggerValue: triggerVal,
                conditionLogic: rule.conditionLogic || "AND",
                conditions: mappedConditions,
                actions: mappedActions,
                webhookConfig: rule.webhookConfig ? {
                    ...rule.webhookConfig,
                    fieldMappings: (rule.webhookConfig.fieldMappings || []).map(m => ({ ...m }))
                } : undefined,
                recurringConfig: parsedRecurring,
                specificDateConfig: parsedSpecificDate,
                dailyTimeConfig: parsedDailyTime,
                beforeDateConfig: parsedBeforeDate,
                afterDateConfig: parsedAfterDate,
                stop_if_customer_replies: Number(rule.stop_if_customer_replies ?? 0),
                stop_for_24_hours: Number(rule.stop_for_24_hours ?? 0),
                stop_once_per_conversation: Number(rule.stop_once_per_conversation ?? 0),
                stop_until_agent_responds: Number(rule.stop_until_agent_responds ?? 0),
                stop_until_new_trigger: Number(rule.stop_until_new_trigger ?? 0),
            };

            console.log("Setting form state:", newForm);
            setForm(newForm);
            setCurrentStep(1);
            setDialogOpen(true);
        } catch (error) {
            console.error("CRITICAL ERROR in openEdit:", error);
            toast.error("An error occurred while opening the edit dialog. Check console.");
            // Still open dialog with basic info if possible
            setForm(f => ({ ...f, name: rule.name }));
            setDialogOpen(true);
        }
    };



    const handleDuplicate = async (rule) => {
        try {
            const response = await axios.post(`${BASE_URI}/api/duplicate-automation-rule`, {
                vendorId: parseInt(VENDOR_ID),
                rule_id: rule.id
            });

            if (response.data.status) {
                toast.success(response.data.message || `Automation rule duplicated successfully`);
                loadRules();
            } else {
                toast.error(response.data.message || "Failed to duplicate rule");
            }
        } catch (error) {
            console.error("Error duplicating rule:", error);
            toast.error(error.response?.data?.message || "An error occurred while duplicating the rule");
        }
    };

    const isStepValid = (step) => {
        if (step === 1) {
            // 1. Basic Rule Info & Trigger
            if (!form.name.trim()) return false;
            const triggerId = triggerTypeOptions.find(t => t.value === form.triggerType)?.masterId;
            if (!triggerId) return false;
            if (needsTriggerValue && !form.triggerValue?.trim()) return false;
            if (form.triggerType?.includes("specific_date") || form.triggerType?.includes("specific date")) {
                if (!form.specificDateConfig?.date || !form.specificDateConfig?.time) return false;
            }

            return true;
        }
        if (step === 2) {
            // 2. Conditions (Optional)
            const noValueOperators = ["exists", "not_exists", "is_empty", "is", "is_not", "does_not_exist"];
            return form.conditions.every(cond => {
                if (!cond.field || !cond.operator) return false;
                if (!noValueOperators.includes(cond.operator) && !cond.value?.toString().trim()) return false;
                return true;
            });
        }
        if (step === 3) {
            // 3. Actions
            if (form.actions.length === 0) return false;
            return form.actions.every(action => {
                if (!action.type) return false;
                if (action.type === "send_whatsapp_reminder" && !action.reminder_time) return false;
                if ((action.type === "move_lead_stage" || action.type === "move_stage") && !action.value) return false;
                if (action.type === "assign_agent" && !action.value) return false;
                if ((action.type === "send_message" || action.type === "send_whatsapp_message") && !action.value?.trim()) return false;
                if (action.type === "send_template_message" || action.type === "send_appointment_template" || action.type === "send_feedback_request" || action.type === "send_whatsapp_reminder") {
                    if (!action.value) return false;
                    if (action.extra_values) {
                        return Object.values(action.extra_values).every(val => val && val.toString().trim() !== "");
                    }
                }
                if (action.type === "send_media_message") {
                    const extra = action.extra_values || {};
                    if (!extra.selectedType) return false;
                    const mediaField = `header_${extra.selectedType.toLowerCase()}`;
                    if (!extra[mediaField]) return false;
                }
                if (action.type === "send_interactive_message") {
                    if (!action.value?.trim()) return false;
                    const extra = action.extra_values || {};

                    if (extra.headerType === "text" && !extra.headerText?.trim()) return false;
                    if (["image", "video", "document"].includes(extra.headerType) && !extra[`header_${extra.headerType}`]) return false;

                    const buttonType = extra.buttonType || "reply";

                    if (buttonType === "reply") {
                        if (!extra.button1?.trim() && !extra.button2?.trim() && !extra.button3?.trim()) return false;
                    } else if (buttonType === "cta") {
                        if (!extra.ctaButtonText?.trim() || !extra.ctaUrl?.trim()) return false;
                    } else if (buttonType === "list") {
                        if (!extra.listButtonText?.trim()) return false;
                        const sections = extra.sections || [];
                        if (sections.length === 0) return false;
                        for (const sec of sections) {
                            if (!sec.title?.trim()) return false;
                            if (!sec.rows || sec.rows.length === 0) return false;
                            for (const row of sec.rows) {
                                if (!row.row_id?.trim() || !row.title?.trim()) return false;
                            }
                        }
                    }
                }
                return true;
            });
        }
        if (step === 4) return true; // Exit Settings automatically valid
        return false;
    };

    const isFormValid = () => {
        return isStepValid(1) && isStepValid(2) && isStepValid(3) && isStepValid(4);
    };

    const handleCreateStep1 = async () => {
        try {
            setCreatingStep1(true);
            const selectedTrigger = triggerTypeOptions.find(t => t.value === form.triggerType);
            const triggerId = selectedTrigger?.masterId;

            let finalTriggerValue = form.triggerValue || "";
            if (form.triggerType?.includes('recurring')) {
                finalTriggerValue = JSON.stringify(form.recurringConfig);
            } else if (form.triggerType?.includes('specific_date') || form.triggerType?.includes('specific date')) {
                finalTriggerValue = JSON.stringify(form.specificDateConfig);
            } else if (form.triggerType?.includes('daily')) {
                finalTriggerValue = JSON.stringify(form.dailyTimeConfig);
            } else if (form.triggerType?.includes('before_date') || form.triggerType?.includes('before date')) {
                finalTriggerValue = JSON.stringify(form.beforeDateConfig);
            } else if (form.triggerType?.includes('after_date') || form.triggerType?.includes('after date')) {
                finalTriggerValue = JSON.stringify(form.afterDateConfig);
            }

            if (needsTriggerValue && !form.triggerValue?.trim()) {
                toast.error(`${getTriggerValueLabel() || "Trigger value"} is required`);
                return;
            }

            if (form.triggerType?.includes("specific_date") || form.triggerType?.includes("specific date")) {
                if (!form.specificDateConfig?.date || !form.specificDateConfig?.time) {
                    toast.error("Please select both date and time for the trigger");
                    return;
                }
            }

            const requestData = {
                vendorId: parseInt(VENDOR_ID),
                rule_name: form.name,
                trigger_id: triggerId,
                value: (form.triggerType?.includes("specific_date") || form.triggerType?.includes("specific date") || form.triggerType?.includes("daily") || form.triggerType?.includes("before_date") || form.triggerType?.includes("before date") || form.triggerType?.includes("after_date") || form.triggerType?.includes("after date") || form.triggerType?.includes("recurring")) ? "" : finalTriggerValue,
                setOperation: form.conditionLogic
            };

            // For Specific Date trigger, the backend expects dedicated fields
            if (form.triggerType?.includes("specific_date") || form.triggerType?.includes("specific date")) {
                requestData.specific_date = form.specificDateConfig?.date;
                requestData.specific_time = form.specificDateConfig?.time;
            }

            // For Daily / Date at Time trigger
            if (form.triggerType?.includes("daily")) {
                requestData.specific_time = form.dailyTimeConfig?.time;
            }

            // For Before Date trigger
            if (form.triggerType?.includes("before_date") || form.triggerType?.includes("before date")) {
                requestData.specific_time = form.beforeDateConfig?.time;
                requestData.days_before_after = form.beforeDateConfig?.daysBefore;
                requestData.lead_ref_id = form.beforeDateConfig?.referenceField;
            }

            // For After Date trigger
            if (form.triggerType?.includes("after_date") || form.triggerType?.includes("after date")) {
                requestData.specific_time = form.afterDateConfig?.time;
                requestData.days_before_after = form.afterDateConfig?.daysAfter;
                requestData.lead_ref_id = form.afterDateConfig?.referenceField;
            }

            if (editingId) {
                requestData.rule_id = editingId;
            }

            if (form.triggerType === "webhook_trigger" && form.webhookConfig) {
                const nameMapping = form.webhookConfig.fieldMappings?.find(m => m.crmField === "name")?.webhookField || "";
                const phoneMapping = form.webhookConfig.fieldMappings?.find(m => m.crmField === "phone")?.webhookField || "";
                const emailMapping = form.webhookConfig.fieldMappings?.find(m => m.crmField === "email")?.webhookField || "";

                requestData.webhook_source = form.webhookConfig.source;
                requestData.webhook_event = form.webhookConfig.event;
                requestData.webhook_url = form.webhookConfig.webhookUrl;
                requestData.name_key_from_webhook = nameMapping;
                requestData.phone_key_from_webhook = phoneMapping;
                requestData.email_key_from_webhook = emailMapping;
            }

            // For Recurring triggers, pass individual fields as top-level properties
            if (form.triggerType?.includes('recurring')) {
                const conf = form.recurringConfig;
                requestData.frequency = conf.frequency;
                requestData.specific_time = conf.specific_time;

                if (conf.frequency === 'Every Day') {
                    requestData.scheduleType = "";
                    requestData.specific_day_of_month = "";
                    requestData.specific_week = "";
                    requestData.specific_day = "";
                    requestData.week_days = "";
                } else if (conf.frequency === 'Every Week') {
                    requestData.scheduleType = "";
                    requestData.specific_day_of_month = "";
                    requestData.specific_week = "";
                    requestData.specific_day = "";
                    requestData.week_days = conf.week_days;
                } else if (conf.frequency === 'Every Month') {

                    requestData.scheduleType = conf.scheduleType;
                    requestData.week_days = "";
                    if (Number(conf.scheduleType) === 1) {


                        requestData.specific_day_of_month = conf.specific_day_of_month;
                        requestData.specific_week = "";
                        requestData.specific_day = "";
                    } else {
                        requestData.specific_day_of_month = "";
                        requestData.specific_week = conf.specific_week;
                        requestData.specific_day = conf.specific_day;
                    }
                }

            }




            const response = await axios.post(`${BASE_URI}/api/createAutomationRuleStep1Api`, requestData);

            if (response.data.status) {
                toast.success(response.data.message || (editingId ? "Automation rule step 1 updated successfully" : "Automation rule step 1 created successfully"));
                setEditingId(response.data.data?.ruleId || editingId);
                setStep1ConfirmOpen(false);
                setCurrentStep(2);
                loadRules();
            } else {
                toast.error(response.data.message || "Failed to create rule step 1");
            }
        } catch (error) {
            console.error("Error creating rule step 1:", error);
            toast.error(error.response?.data?.message || "An error occurred while creating rule step 1");
        } finally {
            setCreatingStep1(false);
        }
    };

    const handleSaveStep2 = async () => {
        try {
            setSavingStep2(true);
            const apiConditions = form.conditions.map(condition => {
                const apiCond = {
                    condition_master_id: condition.conditionMasterId || 1,
                    condition_master_value_id: condition.conditionMasterValueId || 1,
                    value: condition.value || ""
                };
                if (form.triggerType === "webhook_trigger" && condition.webhookField) {
                    apiCond.condition_webhook_key = condition.webhookField;
                } else {
                    apiCond.condition_webhook_key = "";
                }
                return apiCond;
            });

            const requestData = {
                ruleId: editingId,
                setOperation: form.conditionLogic || "AND",
                conditions: apiConditions
            };

            const response = await axios.post(`${BASE_URI}/api/saveAutomationRuleConditionsApi`, requestData);

            if (response.data.status) {
                toast.success(response.data.message || "Automation rule conditions saved successfully");
                setCurrentStep(3);
                loadRules();
            } else {
                toast.error(response.data.message || "Failed to save rule conditions");
            }
        } catch (error) {
            console.error("Error saving rule conditions:", error);
            toast.error(error.response?.data?.message || "An error occurred while saving conditions");
        } finally {
            setSavingStep2(false);
        }
    };

    const handleSaveStep3 = async () => {
        try {
            setSavingStep3(true);
            const apiActions = form.actions.map(action => {
                const apiAction = {
                    action_master_id: action.actionMasterId || (action.type === "send_interactive_message" ? 13 : action.type === "send_media_message" ? 14 : 1),
                    value: {}
                };

                if (action.type === "send_interactive_message") {
                    const extra = action.extra_values || {};
                    apiAction.value = {
                        vendor_uid: window.localStorage.getItem('vendor_uid') || "",
                        bot_flow_uid: "",
                        message_type: "interactive",
                        interactive_type: extra.buttonType === "list" ? "list" : extra.buttonType === "cta" ? "cta_url" : "button",
                        name: "Automation Node",
                        node_id: `0-node_${action.id}`,
                        reply_text: action.value || "",
                        body_text: action.value || "",
                        footer_text: extra.footerText || "",
                        header_type: extra.headerType || "",
                        header_text: extra.headerText || "",
                        uploaded_media_file_name: extra[`header_${extra.headerType}`] || "",
                        media_link: extra[`header_${extra.headerType}`] || "",
                        buttons: {
                            "1": extra.button1 || "",
                            "2": extra.button2 || "",
                            "3": extra.button3 || ""
                        },
                        button_display_text: extra.ctaButtonText || "",
                        button_url: extra.ctaUrl || "",
                        list_button_text: extra.listButtonText || "",
                        sections: extra.sections || [],
                        select_variable: extra.selectVariable || "",
                        new_variable_value: extra.newVariableValue || "",
                        replyWebhookUrl: "",
                        validate_bot_reply: 0
                    };
                } else if (action.type === "send_media_message") {
                    const extra = action.extra_values || {};
                    const selectedType = extra.selectedType || "image";
                    apiAction.value = {
                        vendor_uid: window.localStorage.getItem('vendor_uid') || "",
                        bot_flow_uid: "",
                        message_type: "media",
                        media_header_type: selectedType,
                        name: "Media Node",
                        node_id: `0-node_${action.id}`,
                        caption: extra.caption || "",
                        media_file_url: extra[`header_${selectedType.toLowerCase()}`] || "",
                        media_link: extra[`header_${selectedType.toLowerCase()}`] || "",
                        uploaded_media_file_name: extra.uploadFileName || extra[`header_${selectedType.toLowerCase()}`]?.split('/').pop() || "",
                        replyWebhookUrl: ""
                    };
                } else {
                    apiAction.value = action.value;
                    if (action.reminder_time) {
                        apiAction.reminder_time = action.reminder_time;
                    }
                    if ((action.type === "send_template_message" || action.type === "send_appointment_template" || action.type === "send_feedback_request" || action.type === "send_whatsapp_reminder") && action.extra_values) {
                        apiAction.extra_values = JSON.stringify(action.extra_values);
                    }
                }
                return apiAction;
            });

            const requestData = {
                vendorId: parseInt(VENDOR_ID),
                ruleId: editingId,
                actions: apiActions
            };

            const response = await axios.post(`${BASE_URI}/api/saveAutomationRuleActionsApi`, requestData);

            if (response.data.status) {
                toast.success(response.data.message || "Automation rule actions saved successfully");
                setCurrentStep(4);
                loadRules();
            } else {
                toast.error(response.data.message || "Failed to save rule actions");
            }
        } catch (error) {
            console.error("Error saving rule actions:", error);
            toast.error(error.response?.data?.message || "An error occurred while saving actions");
        } finally {
            setSavingStep3(false);
        }
    };

    const handleSave = async () => {
        // 1. Basic Rule Info Validation
        if (!form.name.trim()) {
            toast.error("Rule name is required");
            return;
        }


        // 2. Trigger Validation
        const selectedTrigger = triggerTypeOptions.find(t => t.value === form.triggerType);
        const triggerId = selectedTrigger?.masterId;
        if (!triggerId) {
            toast.error("Please select a trigger type");
            return;
        }

        if (form.triggerType === "webhook_trigger") {
            const phoneMapping = form.webhookConfig?.fieldMappings?.find(m => m.crmField === "phone");
            if (!phoneMapping || !phoneMapping.webhookField?.trim()) {
                toast.error("Phone number mapping is required for Webhook triggers");
                return;
            }
        }

        // 3. Conditions Validation

        for (let i = 0; i < form.conditions.length; i++) {
            const cond = form.conditions[i];
            const noValueOperators = ["exists", "not_exists", "is_empty", "is", "is_not", "does_not_exist"];

            if (!cond.field) {
                toast.error(`Condition ${i + 1}: Field is required`);
                return;
            }
            if (!cond.operator) {
                toast.error(`Condition ${i + 1}: Operator is required`);
                return;
            }
            if (!noValueOperators.includes(cond.operator) && !cond.value?.toString().trim()) {
                toast.error(`Condition ${i + 1}: Value is required`);
                return;
            }
        }

        // 4. Actions Validation
        if (form.actions.length === 0) {
            toast.error("At least one action is required");
            return;
        }

        for (let i = 0; i < form.actions.length; i++) {
            const action = form.actions[i];
            const actionIndex = i + 1;

            if (!action.type) {
                toast.error(`Action ${actionIndex}: Action type is required`);
                return;
            }

            if ((action.type === "move_lead_stage" || action.type === "move_stage") && !action.value) {
                toast.error(`Action ${actionIndex}: Please select a lead stage`);
                return;
            }

            if (action.type === "assign_agent" && !action.value) {
                toast.error(`Action ${actionIndex}: Please select an agent`);
                return;
            }

            if ((action.type === "send_message" || action.type === "send_whatsapp_message") && !action.value?.trim()) {
                toast.error(`Action ${actionIndex}: Message text cannot be empty`);
                return;
            }

            if (action.type === "send_template_message" || action.type === "send_appointment_template") {
                if (!action.value) {
                    toast.error(`Action ${actionIndex}: Please select a WhatsApp template`);
                    return;
                }

                // For template actions, ensure extra_values are filled if present
                if (action.extra_values) {
                    const params = action.extra_values;
                    const emptyParams = Object.entries(params).filter(([key, val]) => !val || val.toString().trim() === "");

                    if (emptyParams.length > 0) {
                        toast.error(`Action ${actionIndex}: Please fill all template parameters and upload required media`);
                        return;
                    }
                }
            }
        }

        try {
            const requestData = {
                ruleId: editingId,
                stop_for_24_hours: form.stop_for_24_hours || 0,
                stop_once_per_conversation: form.stop_once_per_conversation || 0,
                stop_if_customer_replies: form.stop_if_customer_replies || 0,
                stop_until_agent_responds: form.stop_until_agent_responds || 0,
                stop_until_new_trigger: form.stop_until_new_trigger || 0
            };

            const response = await axios.post(`${BASE_URI}/api/saveAutomationRuleExitSettingsApi`, requestData);

            if (response.data.status) {
                toast.success(response.data.message || "Automation rule exit settings saved successfully");
                setDialogOpen(false);
                loadRules(); // Refresh the list from the server
            } else {
                toast.error(response.data.message || "Failed to save exit settings");
            }
        } catch (error) {
            console.error("Error saving automation rule exit settings:", error);
            toast.error(error.response?.data?.message || "Failed to save exit settings");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const rule = rules.find((r) => r.id === deleteId);

        try {
            const response = await axios.post(`${BASE_URI}/api/delete-automation-rule`, {
                vendorId: parseInt(VENDOR_ID),
                rule_id: deleteId
            });

            if (response.data.status) {
                setRules((prev) => prev.filter((r) => r.id !== deleteId));
                toast.success(response.data.message || `Deleted "${rule?.name}"`);
            } else {
                toast.error(response.data.message || "Failed to delete rule");
            }
        } catch (error) {
            console.error("Error deleting rule:", error);
            toast.error("An error occurred while deleting the rule");
        } finally {
            setDeleteId(null);
        }
    };

    const needsTriggerValue = ["keyword_detected", "button_click", "no_response", "no_agent_response", "lead_inactive", "campaign_reply", "stage_changed"].includes(form.triggerType);
    const getTriggerValuePlaceholder = () => {
        switch (form.triggerType) {
            case "keyword_detected": return 'e.g. price, demo, interested';
            case "button_click": return 'e.g. Book Demo, View Pricing';
            case "no_response":
            case "no_agent_response": return 'Minutes (e.g. 120 for 2 hours)';
            case "lead_inactive": return 'Minutes (e.g. 1440 for 24 hours)';
            case "campaign_reply": return 'Campaign name or ID';
            case "stage_changed": return 'Target stage name';
            default: return '';
        }
    };

    const getTriggerValueLabel = () => {
        switch (form.triggerType) {
            case "keyword_detected": return "Keywords";
            case "button_click": return "Button Name";
            case "no_response":
            case "no_agent_response": return "Delay (minutes)";
            case "lead_inactive": return "Inactive Duration (minutes)";
            case "campaign_reply": return "Campaign";
            case "stage_changed": return "Stage";
            default: return "Value";
        }
    };

    return (
        <CRMLayout title="Automations">
            <div className="p-6 space-y-4 animate-fade-in bg-white">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.history.back()}
                        className="p-0 h-auto hover:bg-transparent text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back</span>
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="rules" className="gap-1.5">
                                <Zap className="h-3.5 w-3.5" /> Rules
                                <Badge variant="secondary" className="ml-1 text-[10px] h-5">{rules.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="execution_logs" className="gap-1.5">
                                <Activity className="h-3.5 w-3.5" /> Execution Logs
                                <Badge variant="secondary" className="ml-1 text-[10px] h-5">{logs.length}</Badge>
                            </TabsTrigger>

                            <TabsTrigger value="lead_scoring" className="gap-1.5">
                                <Target className="h-3.5 w-3.5" /> Lead Scoring
                            </TabsTrigger>

                        </TabsList>
                        {activeTab === "rules" && (
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="h-4 w-4 mr-1.5" /> New Rule
                            </Button>
                        )}
                    </div>

                    {/* RULES TAB */}
                    <TabsContent value="rules" className="mt-4 space-y-4">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{rules.filter((r) => r.active).length} active</span>
                            <span>·</span>
                            <span>{rules.filter((r) => !r.active).length} inactive</span>
                        </div>

                        {rules.length === 0 && (
                            <Card className="p-12 text-center">
                                <Zap className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                <h3 className="text-sm font-semibold mb-1">No automation rules</h3>
                                <p className="text-xs text-muted-foreground mb-4">Create your first rule to automate lead management.</p>
                                <Button size="sm" onClick={openCreate}>
                                    <Plus className="h-4 w-4 mr-1.5" /> Create Rule
                                </Button>
                            </Card>
                        )}

                        <div className="grid gap-4">
                            {rulesLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                                    <p className="text-sm text-muted-foreground">Loading automation rules...</p>
                                </div>
                            ) : rules.map((rule) => (
                                <Card key={rule.id} className={`p-5 transition-all shadow-sm hover:shadow-md border-gray-100 ${!rule.active ? "opacity-60" : ""}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Zap className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold">{rule.name}</h3>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    Created {rule.createdAt}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(rule)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDuplicate(rule)}>
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(rule.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Switch checked={rule.active} onCheckedChange={() => toggleRule(rule.id)} />
                                        </div>
                                    </div>

                                    {/* Trigger → Conditions → Actions flow */}
                                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium mt-2">
                                        {/* Blue Trigger Box */}
                                        <div className="flex items-center gap-2 bg-blue-100/70 text-blue-700 rounded-md px-3 py-2.5 shadow-sm">
                                            <Zap className="h-3 w-3 fill-blue-600/20" />
                                            <span className="uppercase text-[11px] tracking-wider font-bold text-blue-900">IF</span>
                                            <span className="font-semibold">{rule.triggerName}</span>

                                            {(rule.triggerName?.toLowerCase().includes("specific date") || rule.triggerType?.toLowerCase().includes("specific_date")) && (
                                                <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-blue-200">
                                                    <span className="bg-blue-600/10 px-2 py-0.5 rounded text-[10px] font-bold">
                                                        {rule.originalData?.trigger_date || rule.originalData?.specific_date}
                                                    </span>
                                                    <span className="bg-blue-600/10 px-2 py-0.5 rounded text-[10px] font-bold">
                                                        {formatTime12h(rule.originalData?.trigger_time || rule.originalData?.specific_time)}
                                                    </span>
                                                </div>
                                            )}

                                            {(rule.triggerName?.toLowerCase().includes("daily") || rule.triggerType?.toLowerCase().includes("daily")) && (
                                                <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-blue-200">
                                                    <span className="bg-blue-600/10 px-2 py-0.5 rounded text-[10px] font-bold">
                                                        {formatTime12h(rule.originalData?.trigger_time || rule.originalData?.specific_time)}
                                                    </span>
                                                </div>
                                            )}

                                            {(rule.triggerType?.toLowerCase().includes("before") ||
                                                rule.triggerType?.toLowerCase().includes("after") ||
                                                rule.triggerName?.toLowerCase().includes("before") ||
                                                rule.triggerName?.toLowerCase().includes("after")) && (
                                                    <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-blue-200">
                                                        <span className="bg-blue-600/10 px-2 py-0.5 rounded text-[10px] font-bold">
                                                            {rule.originalData?.trigger_days_before_after || rule.originalData?.days_before_after} days
                                                        </span>
                                                        <span className="bg-blue-600/10 px-2 py-0.5 rounded text-[10px] font-bold">
                                                            {formatTime12h(rule.originalData?.trigger_time || rule.originalData?.specific_time)}
                                                        </span>
                                                    </div>
                                                )}

                                            {(rule.triggerName?.toLowerCase().includes("recurring") ||
                                                rule.triggerType?.toLowerCase().includes("recurring")) && (
                                                    <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-blue-200">
                                                        <span className="bg-blue-600/10 px-2 py-0.5 rounded text-[10px] font-bold">
                                                            {rule.originalData?.trigger_recurring_frequency}
                                                        </span>
                                                        {rule.originalData?.trigger_recurring_frequency === "Every Week" && rule.originalData?.trigger_recurring_WeekDays && (
                                                            <span className="bg-blue-600/10 px-2 py-0.5 rounded text-[10px] font-bold">
                                                                {rule.originalData.trigger_recurring_WeekDays}
                                                            </span>
                                                        )}
                                                        {rule.originalData?.trigger_recurring_frequency === "Every Month" && (
                                                            <span className="bg-blue-600/10 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">
                                                                {Number(rule.originalData?.trigger_schedule_type) === 1
                                                                    ? `${rule.originalData.trigger_schedule_specific_day_of_month}${["th", "st", "nd", "rd"][(rule.originalData.trigger_schedule_specific_day_of_month % 10 > 3 || [11, 12, 13].includes(rule.originalData.trigger_schedule_specific_day_of_month % 100)) ? 0 : rule.originalData.trigger_schedule_specific_day_of_month % 10] || "th"}`
                                                                    : `${rule.originalData.trigger_schedule_specific_week} ${rule.originalData.trigger_schedule_specific_day}`}
                                                            </span>
                                                        )}
                                                        <span className="bg-blue-600/10 px-2 py-0.5 rounded text-[10px] font-bold">
                                                            {formatTime12h(rule.originalData?.trigger_time || rule.originalData?.specific_time)}
                                                        </span>
                                                    </div>
                                                )}
                                        </div>


                                        {rule.conditions?.map((cond, i) => (
                                            <div key={`cond-${i}`} className="flex items-center gap-2">
                                                <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                                                {i > 0 && (
                                                    <span className="text-blue-900 uppercase text-[11px] font-bold mx-1">
                                                        {rule.conditionLogic}
                                                    </span>
                                                )}
                                                {/* White Condition Box */}
                                                <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-md px-3 py-2.5 shadow-sm">
                                                    <span className="text-gray-500">{cond.condition_name}</span>
                                                    <span className="text-gray-400 font-normal italic lowercase">{cond.operator}</span>
                                                    <span className="text-gray-700 font-semibold bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 italic">
                                                        "{cond.condition_name?.toLowerCase().includes('appointment status') ? (
                                                            cond.value === "0" ? "Pending" :
                                                                cond.value === "1" ? "Completed" :
                                                                    cond.value === "2" ? "Cancel" :
                                                                        cond.value
                                                        ) : cond.value}"
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {rule.actions?.map((action, i) => {
                                            let displayValue = action.value;
                                            const actionName = action.action_name?.toLowerCase() || '';
                                            if (actionName.includes('delay') || actionName.includes('reminde')) {
                                                const mins = parseInt(action.value, 10);
                                                if (!isNaN(mins)) {
                                                    if (mins < 60) {
                                                        displayValue = `${mins} minutes`;
                                                    } else {
                                                        const hours = Math.floor(mins / 60);
                                                        const remainingMins = mins % 60;
                                                        displayValue = hours === 1 ? "1 hour" : `${hours} hours`;
                                                        if (remainingMins > 0) displayValue += ` ${remainingMins} minutes`;
                                                    }
                                                    if (actionName.includes('reminde')) {
                                                        displayValue += " before";
                                                    }
                                                }
                                            } else if (actionName.includes('send media')) {
                                                displayValue = (
                                                    <span className="flex items-center gap-1 inline-flex">
                                                        <ImageIcon className="w-3.5 h-3.5" />
                                                        <span>Media Message</span>
                                                    </span>
                                                );
                                            } else if (actionName.includes('send interactive')) {
                                                displayValue = (
                                                    <span className="flex items-center gap-1 inline-flex">
                                                        <ImageIcon className="w-3.5 h-3.5" />
                                                        <span>Interactive Message</span>
                                                    </span>
                                                );
                                            } else if (actionName.includes('feedback')) {
                                                displayValue = (
                                                    <span className="flex items-center gap-1 inline-flex">
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        <span>Feedback Request</span>
                                                    </span>
                                                );
                                            }

                                            return (
                                                <div key={`action-${i}`} className="flex items-center gap-2">
                                                    <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                                                    {/* Green Action Box */}
                                                    <div className="flex items-center gap-2 bg-green-100/70 text-green-700 rounded-md px-3 py-2.5 shadow-sm">
                                                        <span className="uppercase text-[11px] tracking-wider font-bold text-green-700">THEN</span>
                                                        <span className="opacity-90">{action.action_name}</span>
                                                        <span className="text-[10px] opacity-60">:</span>
                                                        <span className="font-semibold underline decoration-green-600/20 underline-offset-2">{displayValue}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {rulesPagination.lastPage > 1 && (
                            <Card className="flex items-center justify-between px-6 py-4 mt-6 border-gray-100 shadow-sm">
                                <div className="text-xs text-muted-foreground font-medium">
                                    Showing {rules.length} of {rulesPagination.total} rules
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 text-xs font-medium gap-1.5 px-4"
                                        disabled={rulesPagination.currentPage === 1 || rulesLoading}
                                        onClick={() => loadRules(rulesPagination.currentPage - 1)}
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Previous
                                    </Button>
                                    <div className="text-xs font-bold bg-blue-50/50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100/50 min-w-[100px] text-center">
                                        Page {rulesPagination.currentPage} of {rulesPagination.lastPage}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 text-xs font-medium gap-1.5 px-4"
                                        disabled={rulesPagination.currentPage === rulesPagination.lastPage || rulesLoading}
                                        onClick={() => loadRules(rulesPagination.currentPage + 1)}
                                    >
                                        Next <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </TabsContent>


                    {/* LOGS TAB */}
                    <TabsContent value="execution_logs" className="mt-4">
                        <Card>
                            <div className="relative">
                                {logsLoading && (
                                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                )}
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs">Status</TableHead>
                                            <TableHead className="text-xs">Rule</TableHead>
                                            <TableHead className="text-xs">Lead</TableHead>
                                            <TableHead className="text-xs">Details</TableHead>
                                            <TableHead className="text-xs">Time</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {!logsLoading && logs.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                                                    No execution logs yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {logs.map((log) => {
                                            const status = String(log.status).toLowerCase();
                                            return (
                                                <TableRow key={log.id}>
                                                    <TableCell>
                                                        {status === "success" && (
                                                            <Badge className="bg-green-100 text-green-700 border-0 text-[10px] hover:bg-green-100">
                                                                <CheckCircle className="h-3 w-3 mr-1" /> Success
                                                            </Badge>
                                                        )}
                                                        {status === "failed" && (
                                                            <Badge className="bg-red-100 text-red-700 border-0 text-[10px] hover:bg-red-100">
                                                                <XCircle className="h-3 w-3 mr-1" /> Failed
                                                            </Badge>
                                                        )}
                                                        {status === "skipped" && (
                                                            <Badge className="bg-orange-100 text-orange-700 border-0 text-[10px] hover:bg-orange-100">
                                                                <SkipForward className="h-3 w-3 mr-1" /> Skipped
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-medium">{log.rule_name}</TableCell>
                                                    <TableCell className="text-xs">{log.lead_name}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={log.details}>
                                                        {log.details}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {log.created_at}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {logsPagination.lastPage > 1 && (
                                <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
                                    <div className="text-[11px] text-muted-foreground font-medium">
                                        Showing {logs.length} of {logsPagination.total} logs
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-[11px] font-medium gap-1"
                                            disabled={logsPagination.currentPage === 1 || logsLoading}
                                            onClick={() => loadLogs(logsPagination.currentPage - 1)}
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" /> Previous
                                        </Button>
                                        <div className="text-[11px] font-semibold bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 shadow-sm min-w-[80px] text-center">
                                            Page {logsPagination.currentPage} of {logsPagination.lastPage}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-[11px] font-medium gap-1"
                                            disabled={logsPagination.currentPage === logsPagination.lastPage || logsLoading}
                                            onClick={() => loadLogs(logsPagination.currentPage + 1)}
                                        >
                                            Next <ChevronRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </TabsContent>



                    {/* LEAD SCORING MAIN TAB */}
                    <TabsContent value="lead_scoring" className="mt-4">
                        <Tabs value={subActiveTab} onValueChange={setSubActiveTab}>
                            <TabsList className="bg-gray-100/50 p-1 mb-6">
                                <TabsTrigger value="scoring_rules" className="gap-1.5 text-xs">
                                    <Target className="h-3.5 w-3.5" /> Scoring Rules
                                </TabsTrigger>
                                <TabsTrigger value="lead_scores" className="gap-1.5 text-xs">
                                    <Star className="h-3.5 w-3.5" /> Lead Scores
                                </TabsTrigger>
                                <TabsTrigger value="audit_logs" className="gap-1.5 text-xs">
                                    <History className="h-3.5 w-3.5" /> Audit Logs
                                </TabsTrigger>
                            </TabsList>

                            {/* SCORING RULES SUB-TAB */}
                            <TabsContent value="scoring_rules" className="space-y-8">
                                {/* Predefined System Rules */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-md bg-green-50 flex items-center justify-center text-green-600">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                            Predefined System Rules
                                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-green-50 text-green-700 border-green-100">
                                                {predefinedScoringRules.length}
                                            </Badge>
                                        </h3>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground ml-8">
                                        These rules run automatically for all leads. Custom automation rules with scoring actions will stack cumulatively.
                                    </p>

                                    <div className="grid gap-2.5 relative">
                                        {scoringRulesLoading && (
                                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-[10px] font-medium text-gray-500">Updating rules...</span>
                                                </div>
                                            </div>
                                        )}
                                        {predefinedScoringRules.map((rule) => (
                                            <Card key={rule.id} className={`p-4 transition-all hover:shadow-sm border-gray-100/80 ${!rule.active ? "opacity-60 bg-gray-50/50" : "bg-white"}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <Switch
                                                            checked={rule.active}
                                                            onCheckedChange={() => togglePredefinedRule(rule.id)}
                                                            className="data-[state=checked]:bg-green-600"
                                                        />
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-sm font-semibold text-gray-800">{rule.name} ({rule.points > 0 ? `+${rule.points}` : rule.points})</span>
                                                                <Lock className="h-3 w-3 text-muted-foreground/40" />
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium italic">
                                                                Trigger: {rule.trigger}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold shadow-sm ${rule.points > 0
                                                        ? "bg-green-50/50 text-green-700 border-green-200/50"
                                                        : "bg-red-50/50 text-red-700 border-red-200/50"
                                                        }`}>
                                                        {rule.points > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                                                        {rule.points > 0 ? `+${rule.points}` : rule.points} pts
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* LEAD SCORES SUB-TAB */}
                            <TabsContent value="lead_scores">
                                <div className="grid gap-2.5">
                                    {leadScoresLoading ? (
                                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/10 rounded-xl border border-dashed border-gray-100">
                                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                                            <p className="text-sm text-muted-foreground font-medium">Crunching lead scores...</p>
                                        </div>
                                    ) : leadScores.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/10 rounded-xl border border-dashed border-gray-100">
                                            <Star className="h-8 w-8 text-muted-foreground/20 mb-3" />
                                            <p className="text-sm text-muted-foreground font-medium">No lead scores available yet</p>
                                        </div>
                                    ) : (
                                        leadScores.map((lead) => (
                                            <Card key={lead.id} className="p-4 hover:shadow-md transition-all border-gray-100 group">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <h4 className="text-sm font-bold text-gray-800">{lead.name}</h4>
                                                        {/* <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1 px-2 py-0.5 bg-blue-50/50 inline-block rounded border border-blue-100/30">
                                                            {lead.source}
                                                        </p> */}
                                                        <p className="text-[11px] text-muted-foreground font-medium block">{lead.phone}</p>
                                                    </div>

                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`h-1.5 w-16 rounded-full ${lead.priority === 'High' ? 'bg-green-500' :
                                                                lead.priority === 'Medium' ? 'bg-orange-400' : 'bg-red-400'
                                                                }`} />
                                                            <div className="flex items-center gap-2">
                                                                <TrendingUp className={`h-3.5 w-3.5 ${lead.priority === 'High' ? 'text-green-500' :
                                                                    lead.priority === 'Medium' ? 'text-orange-500' : 'text-red-500'
                                                                    }`} />
                                                                <span className="text-[15px] font-black text-gray-900 leading-none">
                                                                    {lead.score}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <Badge variant="secondary" className={`h-6 px-2.5 text-[10px] font-bold border ${lead.priority === 'High' ? 'bg-green-50 text-green-700 border-green-100' :
                                                            lead.priority === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                                'bg-red-50 text-red-700 border-red-100'
                                                            }`}>
                                                            {lead.priority}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </TabsContent>

                            {/* AUDIT LOGS SUB-TAB */}
                            <TabsContent value="audit_logs">
                                <Card className="overflow-hidden border-gray-100 shadow-sm">
                                    <Table>
                                        <TableHeader className="bg-gray-50/50">
                                            <TableRow>
                                                <TableHead className="text-[11px] font-semibold py-3 px-4">Timestamp</TableHead>
                                                <TableHead className="text-[11px] font-semibold py-3 px-4">Lead</TableHead>
                                                <TableHead className="text-[11px] font-semibold py-3 px-4">Event</TableHead>
                                                <TableHead className="text-[11px] font-semibold py-3 px-4">Rule</TableHead>
                                                <TableHead className="text-[11px] font-semibold py-3 px-4 text-center">Type</TableHead>
                                                <TableHead className="text-[11px] font-semibold py-3 px-4 text-right">Score Change</TableHead>
                                                <TableHead className="text-[11px] font-semibold py-3 px-4 text-right">New Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {auditLogsLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-20">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                            <p className="text-sm text-muted-foreground font-medium">Loading execution logs...</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : auditLogs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-20">
                                                        <History className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                                                        <p className="text-sm text-muted-foreground font-medium">No execution logs found</p>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                auditLogs.map((log) => (
                                                    <TableRow key={log.id} className="hover:bg-gray-50/30 transition-colors border-gray-50">
                                                        <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap py-4 px-4">{log.timestamp}</TableCell>
                                                        <TableCell className="text-[11px] font-bold text-gray-800 py-4 px-4">{log.lead}</TableCell>
                                                        <TableCell className="text-[11px] font-medium text-gray-600 py-4 px-4">{log.event}</TableCell>
                                                        <TableCell className="text-[11px] text-muted-foreground py-4 px-4">{log.rule}</TableCell>
                                                        <TableCell className="py-4 px-4">
                                                            <div className="flex justify-center">
                                                                <Badge variant="outline" className={`h-6 px-2 text-[10px] gap-1 font-medium capitalize border-gray-200 ${log.type === 'predefined' ? 'bg-gray-50' : 'bg-blue-50/50 border-blue-100 text-blue-600'}`}>
                                                                    {log.type === 'predefined' ? <Lock className="h-2.5 w-2.5" /> : <Zap className="h-2.5 w-2.5" />}
                                                                    {log.type}
                                                                </Badge>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4 px-4 text-right">
                                                            <span className={`text-[11px] font-bold ${log.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                                {log.change > 0 ? `+${log.change}` : log.change}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="py-4 px-4 text-right">
                                                            <span className="text-[13px] font-black text-gray-900">{log.total}</span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => {
                // Only allow closing if explicitly set to false (not from outside click)
                if (!open) {
                    setDialogOpen(false);
                }
            }}>
                <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto bg-white" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Automation Rule" : "Create Automation Rule"}</DialogTitle>
                        <DialogDescription>
                            Define trigger, conditions, and actions for automatic lead management.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Stepper Header */}
                    <div className="flex items-center justify-between mt-4 mb-6 relative px-4">
                        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100 z-0"></div>
                        {[
                            { step: 1, label: "Trigger" },
                            { step: 2, label: "Conditions" },
                            { step: 3, label: "Actions" },
                            { step: 4, label: "Exit Settings" }
                        ].map((s) => (
                            <div key={s.step} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors
                                    ${currentStep === s.step ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                                        : currentStep > s.step ? "bg-primary text-primary-foreground"
                                            : "bg-gray-100 text-gray-400 border border-gray-200"}`}
                                >
                                    {currentStep > s.step ? <CheckCircle className="h-4 w-4" /> : s.step}
                                </div>
                                <span className={`text-[11px] font-medium ${currentStep >= s.step ? "text-primary" : "text-gray-400"}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6 py-2 min-h-[400px]">
                        {/* Step 1: Trigger & Rule Name */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium flex items-center gap-1">
                                        Rule Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        placeholder="e.g. Price Inquiry Auto-Route"
                                        value={form.name}
                                        className={!form.name.trim() ? "border-destructive/50 focus-visible:ring-destructive" : ""}
                                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    />
                                    {!form.name.trim() && <p className="text-[10px] text-destructive">Rule name is required</p>}
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Trigger</Label>
                                    {triggersLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                            <span className="ml-2 text-sm text-muted-foreground">Loading triggers...</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            {triggerTypeOptions.map((t) => {
                                                const Icon = t.icon;
                                                const selected = form.triggerType === t.value;
                                                return (
                                                    <button
                                                        key={t.value}
                                                        type="button"
                                                        className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${selected
                                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                            : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                                                            } ${editingId ? "opacity-60 cursor-not-allowed" : ""}`}
                                                        onClick={async () => {
                                                            if (editingId) return;
                                                            let newConfig = form.webhookConfig;
                                                            if (t.value === "webhook_trigger") {
                                                                const generateUrl = async () => {
                                                                    try {
                                                                        const vendorId = await getVendorId();
                                                                        const res = await axios.post(`${BASE_URI}/api/generate-webhook-url`, { vendorId });
                                                                        if (res.data?.status && res.data?.data?.webhook_url) {
                                                                            return res.data.data.webhook_url;
                                                                        }
                                                                    } catch (e) {
                                                                        console.error(e);
                                                                    }
                                                                    return null;
                                                                };
                                                                const fetchedUrl = await generateUrl();
                                                                let currentUrl = form.webhookConfig?.webhookUrl;
                                                                newConfig = {
                                                                    ...(form.webhookConfig || defaultWebhookConfig),
                                                                    webhookUrl: fetchedUrl || currentUrl || `https://api.crm.com/webhook/ws_default/${editingId || `r${Date.now()}`}`
                                                                };
                                                            }
                                                            setForm((f) => ({
                                                                ...f,
                                                                triggerType: t.value,
                                                                triggerValue: "",
                                                                webhookConfig: t.value === "webhook_trigger" ? newConfig : f.webhookConfig,
                                                                recurringConfig: t.value.includes("recurring") ? { ...defaultRecurringConfig } : f.recurringConfig,
                                                                specificDateConfig: t.value.includes("specific_date") || t.value.includes("specific date") ? { ...defaultSpecificDateConfig } : f.specificDateConfig,
                                                                dailyTimeConfig: t.value.includes("daily") ? { ...defaultDailyTimeConfig } : f.dailyTimeConfig,
                                                                beforeDateConfig: t.value.includes("before_date") || t.value.includes("before date") ? { ...defaultBeforeDateConfig } : f.beforeDateConfig,
                                                                afterDateConfig: t.value.includes("after_date") || t.value.includes("after date") ? { ...defaultAfterDateConfig } : f.afterDateConfig,
                                                            }));
                                                        }}
                                                    >
                                                        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                                                        <div>
                                                            <div className="text-xs font-medium">{t.label}</div>
                                                            <div className="text-[10px] text-muted-foreground mt-0.5">{t.description}</div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {form.triggerType === "webhook_trigger" && form.webhookConfig && (
                                        <div className="mt-4">
                                            <Separator className="mb-4" />
                                            <WebhookConfigPanel
                                                config={form.webhookConfig}
                                                ruleId={editingId || `r_new`}
                                                onChange={(webhookConfig) => setForm((f) => ({ ...f, webhookConfig }))}
                                            />
                                        </div>
                                    )}

                                    {form.triggerType?.includes("recurring") && form.recurringConfig && (
                                        <div className="mt-6">
                                            <RecurringConfigPanel
                                                config={form.recurringConfig}
                                                onChange={(recurringConfig) => setForm((f) => ({ ...f, recurringConfig }))}
                                            />
                                        </div>
                                    )}

                                    {(form.triggerType?.includes("specific_date") || form.triggerType?.includes("specific date")) && form.specificDateConfig && (
                                        <div className="mt-6">
                                            <SpecificDateConfigPanel
                                                config={form.specificDateConfig}
                                                onChange={(specificDateConfig) => setForm((f) => ({ ...f, specificDateConfig }))}
                                            />
                                        </div>
                                    )}

                                    {form.triggerType?.includes("daily") && form.dailyTimeConfig && (
                                        <div className="mt-6">
                                            <DailyTimeConfigPanel
                                                config={form.dailyTimeConfig}
                                                onChange={(dailyTimeConfig) => setForm((f) => ({ ...f, dailyTimeConfig }))}
                                            />
                                        </div>
                                    )}

                                    {(form.triggerType?.includes("before_date") || form.triggerType?.includes("before date")) && form.beforeDateConfig && (
                                        <div className="mt-6">
                                            <BeforeDateConfigPanel
                                                config={form.beforeDateConfig}
                                                onChange={(beforeDateConfig) => setForm((f) => ({ ...f, beforeDateConfig }))}
                                                customFields={customLeadFields}
                                            />
                                        </div>
                                    )}

                                    {(form.triggerType?.includes("after_date") || form.triggerType?.includes("after date")) && form.afterDateConfig && (
                                        <div className="mt-6">
                                            <AfterDateConfigPanel
                                                config={form.afterDateConfig}
                                                onChange={(afterDateConfig) => setForm((f) => ({ ...f, afterDateConfig }))}
                                                customFields={customLeadFields}
                                            />
                                        </div>
                                    )}

                                    {needsTriggerValue && (
                                        <div className="space-y-1.5 mt-6 border-t pt-4">
                                            <Label className="text-xs font-medium flex items-center gap-1">
                                                {getTriggerValueLabel()} <span className="text-destructive">*</span>
                                            </Label>
                                            {form.triggerType === "stage_changed" ? (
                                                <Select
                                                    value={form.triggerValue}
                                                    onValueChange={(v) => setForm(f => ({ ...f, triggerValue: v }))}
                                                >
                                                    <SelectTrigger className={`w-full text-xs h-9 ${!form.triggerValue ? "border-destructive/50 focus:ring-destructive" : ""}`}>
                                                        <SelectValue placeholder={columnsLoading ? "Loading stages..." : "Select stage"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {stages.map((stage) => (
                                                            <SelectItem key={stage.id} value={stage.name} className="text-xs">
                                                                {stage.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    placeholder={getTriggerValuePlaceholder()}
                                                    value={form.triggerValue}
                                                    className={!form.triggerValue?.trim() ? "border-destructive/50 focus-visible:ring-destructive" : ""}
                                                    onChange={(e) => setForm((f) => ({ ...f, triggerValue: e.target.value }))}
                                                />
                                            )}
                                            {!form.triggerValue?.trim() && (
                                                <p className="text-[10px] text-destructive">{getTriggerValueLabel()} is required</p>
                                            )}
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}

                        {/* Step 2: Conditions */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                {form.triggerType ? (
                                    <ConditionBuilder
                                        conditions={form.conditions}
                                        logic={form.conditionLogic}
                                        onChange={(newConditionsOrFn, logic) => setForm((f) => ({
                                            ...f,
                                            conditions: typeof newConditionsOrFn === 'function' ? newConditionsOrFn(f.conditions) : newConditionsOrFn,
                                            conditionLogic: logic || f.conditionLogic
                                        }))}
                                        triggerType={form.triggerType}
                                        webhookConfig={form.webhookConfig}
                                        triggerMasterId={triggerTypeOptions.find(t => t.value === form.triggerType)?.masterId}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Zap className="h-8 w-8 text-muted-foreground/30 mb-3" />
                                        <p className="text-sm font-medium">No Trigger Selected</p>
                                        <p className="text-xs text-muted-foreground mt-1 text-center">Please go back to Step 1 and select a trigger to add conditions.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Actions */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                {form.triggerType ? (
                                    <ActionBuilder
                                        actions={form.actions}
                                        onChange={(actions) => setForm((f) => ({ ...f, actions }))}
                                        triggerMasterId={triggerTypeOptions.find(t => t.value === form.triggerType)?.masterId}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Zap className="h-8 w-8 text-muted-foreground/30 mb-3" />
                                        <p className="text-sm font-medium">No Trigger Selected</p>
                                        <p className="text-xs text-muted-foreground mt-1 text-center">Please go back to Step 1 and select a trigger to add actions.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Exit Settings */}
                        {currentStep === 4 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Exit Settings</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                                        <Label className="text-sm font-normal">Stop automation if customer replies</Label>
                                        <Switch
                                            checked={form.stop_if_customer_replies === 1}
                                            onCheckedChange={(val) => setForm(f => ({ ...f, stop_if_customer_replies: val ? 1 : 0 }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                                        <Label className="text-sm font-normal">Stop automation for 24 hours</Label>
                                        <Switch
                                            checked={form.stop_for_24_hours === 1}
                                            onCheckedChange={(val) => setForm(f => ({ ...f, stop_for_24_hours: val ? 1 : 0 }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                                        <Label className="text-sm font-normal">Stop automation once per conversation</Label>
                                        <Switch
                                            checked={form.stop_once_per_conversation === 1}
                                            onCheckedChange={(val) => setForm(f => ({ ...f, stop_once_per_conversation: val ? 1 : 0 }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                                        <Label className="text-sm font-normal">Stop automation until agent responds</Label>
                                        <Switch
                                            checked={form.stop_until_agent_responds === 1}
                                            onCheckedChange={(val) => setForm(f => ({ ...f, stop_until_agent_responds: val ? 1 : 0 }))}
                                        />
                                    </div>
                                    {/* <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                                        <Label className="text-sm font-normal">Stop automation until a new trigger happens</Label>
                                        <Switch 
                                            checked={form.stop_until_new_trigger === 1} 
                                            onCheckedChange={(val) => setForm(f => ({ ...f, stop_until_new_trigger: val ? 1 : 0 }))}
                                        />
                                    </div> */}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-8 border-t border-border pt-4 flex flex-row items-center justify-between">
                        {currentStep > 1 ? (
                            <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
                                Back
                            </Button>
                        ) : (
                            <Button variant="ghost" className="text-muted-foreground" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                        )}

                        <div className="flex items-center gap-2">
                            {(editingId || currentStep > 1) && currentStep < 4 && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setCurrentStep(prev => prev + 1)}
                                    className="text-muted-foreground"
                                >
                                    Skip
                                </Button>
                            )}

                            {currentStep < 4 ? (
                                <Button onClick={() => {
                                    if (currentStep === 1 && !editingId) {
                                        setStep1ConfirmOpen(true);
                                    } else if (currentStep === 1 && editingId) {
                                        handleCreateStep1();
                                    } else if (currentStep === 2) {
                                        handleSaveStep2();
                                    } else if (currentStep === 3) {
                                        handleSaveStep3();
                                    } else {
                                        setCurrentStep(prev => prev + 1);
                                    }
                                }} disabled={!isStepValid(currentStep) || savingStep2 || savingStep3 || creatingStep1}>
                                    {(savingStep2 && currentStep === 2) || (savingStep3 && currentStep === 3) || (creatingStep1 && currentStep === 1) ? "Saving..." : (
                                        <>Save & Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                            ) : (
                                <Button onClick={handleSave} disabled={!isFormValid()} className={!isFormValid() ? "opacity-50 grayscale" : "bg-success hover:bg-success/90 text-white"}>
                                    {editingId ? "Save Changes" : "Submit & Create Rule"} <CheckCircle className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete "{rules.find(r => r.id === deleteId)?.name}" rule?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this automation rule. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Step 1 Submit Confirmation */}
            <AlertDialog open={step1ConfirmOpen} onOpenChange={setStep1ConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Trigger Selection</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to proceed with this trigger? Once submitted, the trigger cannot be changed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={creatingStep1}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCreateStep1} disabled={creatingStep1}>
                            {creatingStep1 ? "Submitting..." : "Proceed"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CRMLayout>
    );
}
