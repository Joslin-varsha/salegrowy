import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Phone,
  MessageCircle,
  CalendarPlus,
  StickyNote,
  ChevronDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PhoneMissed,
  PhoneOff,
  User,
  Tag,
  Flame,
  Activity,
  Bot,
  UserCheck,
  GitCommitHorizontal,
  PhoneCall,
  MessageSquare,
  FileText,
  PlusCircle,
  X,
  Check,
  RefreshCw,
  ArrowRight,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  AlarmClock,
  Repeat,
  Send,
  Tags,
  TrendingUp,
  Star,
  Award,
  Target,
  Zap,
  Users,
  BarChart3,
  Eye,
  Edit3,
  Archive,
  Bell,
  Shield,
  Sparkles,
  Paperclip,
} from "lucide-react";
import AudioCallButton from "../audiocall/AudioCallButton";
const BASE_URI = import.meta.env.VITE_BASE_URI;
const VENDOR_ID = localStorage.getItem('vendor_id');
const VENDOR_UID = localStorage.getItem('vendor_uid');
const USER_ID = localStorage.getItem('user_id');

// Import for WhatsApp background
const whatsappImage = "/wa.jpg";
const placeholderImage = "/placeholder.png";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const STAGES = ["New Lead", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won"];
const AGENTS = ["Priya Sharma", "Ravi Kumar", "Anjali Singh", "Mohit Verma"];

const lead = {
  name: "Rahul Mehta",
  phone: "+91 98765 43210",
  channel: "WhatsApp",
  stage: "Proposal",
  agent: "Priya Sharma",
  source: "Facebook Ads",
  priority: "Hot",
  leadAge: "8 days",
  lastActivity: "2 hours ago",
  nextFollowUp: {
    date: "2026-02-18",
    time: "11:00 AM",
    type: "Call",
    overdue: true,
  },
  lastCallSummary: "Customer is interested but asked for revised pricing. Follow-up on Monday.",
  health: "warning",
};

const callLogs = [
  { id: 1, date: "Feb 17, 2026", time: "3:45 PM", status: "Connected", duration: "4m 32s", note: "Discussed pricing, customer is interested." },
  { id: 2, date: "Feb 15, 2026", time: "10:20 AM", status: "No Answer", duration: "—", note: "" },
  { id: 3, date: "Feb 13, 2026", time: "2:00 PM", status: "Busy", duration: "—", note: "" },
];

const initialNotes = [
  { id: 1, author: "Priya Sharma", time: "Feb 17, 2026 · 4:00 PM", content: "Customer wants a revised pricing deck with bulk discount options before Thursday." },
  { id: 2, author: "Priya Sharma", time: "Feb 13, 2026 · 2:10 PM", content: "No answer on first try. Sent WhatsApp message." },
];

const WA_TEMPLATES = [
  { label: "Follow-up", text: (name) => `Hi ${name}, just following up on our last conversation. Are you available for a quick call today?` },
  { label: "Proposal Sent", text: (name) => `Hi ${name}, I've sent over the proposal. Please review and let me know if you have any questions!` },
  { label: "Reminder", text: (name) => `Hi ${name}, this is a gentle reminder about our scheduled call. Looking forward to speaking with you!` },
];

const PRESET_TAGS = ["Interested", "Demo Needed", "Price Asked", "Not Reachable", "Follow-up Done", "High Value", "Urgent", "Callback Requested"];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function Toast({ message, onClose }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-gradient-to-r from-[#1e293b] to-[#334155] text-white text-sm font-medium px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/10 animate-fade-in">
      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-4 h-4 text-white" />
      </div>
      <div className="font-medium">{message}</div>
    </div>
  );
}

function ChannelBadge({ channel }) {
  const isWA = channel === "WhatsApp";
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 ${isWA ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200" : "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200"}`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isWA ? "bg-green-500" : "bg-blue-500"}`}>
        {isWA ? <MessageCircle className="w-2.5 h-2.5 text-white" /> : <MessageSquare className="w-2.5 h-2.5 text-white" />}
      </div>
      {channel}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const map = {
    High: { bg: "bg-red-50", color: "text-red-700", border: "border-red-200", icon: "bg-red-500" },
    Medium: { bg: "bg-orange-50", color: "text-orange-700", border: "border-orange-200", icon: "bg-orange-500" },
    Low: { bg: "bg-green-50", color: "text-green-700", border: "border-green-200", icon: "bg-green-500" },
  };
  const config = map[priority] || map.Low;
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 ${config.bg} ${config.color} ${config.border} border`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${config.icon}`}>
        <Flame className="w-2.5 h-2.5 text-white" />
      </div>
      {priority}
    </div>
  );
}

function CallStatusBadge({ status }) {
  const map = {
    Connected: { bg: "bg-gradient-to-r from-green-50 to-emerald-50", color: "text-green-700", border: "border-green-200", icon: "bg-gradient-to-br from-green-500 to-emerald-500" },
    "No Answer": { bg: "bg-gradient-to-r from-amber-50 to-orange-50", color: "text-amber-800", border: "border-amber-200", icon: "bg-gradient-to-br from-amber-500 to-orange-500" },
    Busy: { bg: "bg-gradient-to-r from-red-50 to-pink-50", color: "text-red-700", border: "border-red-200", icon: "bg-gradient-to-br from-red-500 to-pink-500" },
  };
  const config = map[status] || map["No Answer"];
  const IconComponent = status === "Connected" ? CheckCircle2 : status === "No Answer" ? PhoneMissed : PhoneOff;
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105 ${config.bg} ${config.color} ${config.border} border`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${config.icon}`}>
        <IconComponent className="w-2.5 h-2.5 text-white" />
      </div>
      {status}
    </div>
  );
}

function HealthBanner({ health, summary, followUp }) {
  const cfg = {
    good: {
      bg: "bg-gradient-to-r from-green-50 via-emerald-50 to-green-50",
      border: "border-green-200",
      icon: <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-white" /></div>,
      label: "On Track",
      labelCls: "text-green-700",
      accent: "bg-green-500"
    },
    // warning: { 
    //   bg: "bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50", 
    //   border: "border-amber-200", 
    //   icon: <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center"><AlertCircle className="w-5 h-5 text-white" /></div>, 
    //   label: "Needs Attention", 
    //   labelCls: "text-amber-700",
    //   accent: "bg-amber-500"
    // },
    critical: {
      bg: "bg-gradient-to-r from-red-50 via-rose-50 to-red-50",
      border: "border-red-200",
      icon: <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center"><XCircle className="w-5 h-5 text-white" /></div>,
      label: "At Risk",
      labelCls: "text-red-700",
      accent: "bg-red-500"
    },
  }[health] ?? { bg: "bg-gray-50 border-gray-200", icon: null, label: "", labelCls: "", accent: "bg-gray-500" };

  return (
    <div className={`rounded-2xl border p-6 flex flex-col lg:flex-row lg:items-center gap-6 ${cfg.bg} ${cfg.border} relative overflow-hidden`} style={{ boxShadow: "0px 8px 32px rgba(0,0,0,0.08)" }}>
      {/* Decorative gradient accent */}
      <div className={`absolute inset-0 bg-gradient-to-r ${cfg.accent}/5 to-transparent`} />
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.accent}`} />

      <div className="flex items-start gap-4 flex-1 relative z-10">
        {cfg.icon}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <p className={`text-lg font-bold ${cfg.labelCls}`}>{cfg.label}</p>
            <div className={`w-2 h-2 rounded-full ${cfg.accent} animate-pulse`} />
          </div>
          <p className="text-[#6B7280] leading-relaxed">{summary}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-[#6B7280] shrink-0 relative z-10 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
        <div className={`w-8 h-8 ${cfg.accent} rounded-full flex items-center justify-center`}>
          <AlarmClock className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-medium text-[#374151]">Follow-up</p>
          <p className={`font-bold ${followUp.overdue ? "text-red-600" : "text-[#111827]"}`}>
            {followUp.date} · {followUp.time}
          </p>
          {followUp.overdue && <p className="text-xs text-red-500 font-bold mt-1">· Overdue</p>}
        </div>
      </div>
    </div>
  );
}

function TimelineIcon({ type }) {
  const map = {
    lead: { bg: "bg-gradient-to-br from-blue-100 to-indigo-100", icon: <User className="w-4 h-4 text-blue-600" />, circle: "bg-blue-500" },
    bot: { bg: "bg-gradient-to-br from-purple-100 to-pink-100", icon: <Bot className="w-4 h-4 text-purple-600" />, circle: "bg-purple-500" },
    assign: { bg: "bg-gradient-to-br from-indigo-100 to-blue-100", icon: <UserCheck className="w-4 h-4 text-indigo-600" />, circle: "bg-indigo-500" },
    stage: { bg: "bg-gradient-to-br from-amber-100 to-orange-100", icon: <GitCommitHorizontal className="w-4 h-4 text-amber-600" />, circle: "bg-amber-500" },
    call: { bg: "bg-gradient-to-br from-green-100 to-emerald-100", icon: <PhoneCall className="w-4 h-4 text-green-600" />, circle: "bg-green-500" },
    note: { bg: "bg-gradient-to-br from-slate-100 to-gray-100", icon: <FileText className="w-4 h-4 text-slate-600" />, circle: "bg-slate-500" },
  };
  const { bg, icon, circle } = map[type] ?? map.note;
  return (
    <div className="relative">
      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0 border-2 border-white shadow-lg`}>
        {icon}
      </div>
      {/* <div className={`absolute inset-0 rounded-full ${circle} opacity-20 animate-ping`} /> */}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function LeadDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const passed = location.state?.lead;   // data from navigate(..., { state: { lead } })

  const [leadData, setLeadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch lead details from API
  const fetchLeadDetails = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get lead ID from passed state or URL params
      const leadId = passed?._id || passed?.id || passed?.lead_id;

      if (!leadId) {
        throw new Error("Lead ID not found");
      }

      const response = await fetch(`${BASE_URI}lead-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          leadId: leadId,
          vendorId: VENDOR_ID
        })
      });

      const data = await response.json();

      if (data.status === true) {
        console.log(data);
        setLeadData(data); // Store the entire response

        // Set current stage from lead status
        if (data.lead && data.lead.status) {
          setCurrentStage(data.lead.status);
        }
        if (data.lead && data.lead.assigned_user) {
          setAssignedAgent(data.lead.assigned_user);
        }

      } else {
        throw new Error(data.message || "Failed to fetch lead details");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching lead details:", err);
    } finally {
      setLoading(false);
    }
  }, [passed]);

  useEffect(() => {
    fetchLeadDetails();
  }, [fetchLeadDetails]);


  // ── Fetch columns data for stage dropdown
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await fetch(`${BASE_URI}/api/get-columns`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            vendorId: VENDOR_ID
          })
        });

        const data = await response.json();
        console.log("Columns API response:", data);
        if (data.status === "success" && data.data) {
          console.log("Columns data:", data.data);
          setColumns(data.data);

          // Extract priority options from API response
          if (data.data && data.data.length > 0) {
            const firstColumn = data.data[0];
            if (firstColumn.priority && Array.isArray(firstColumn.priority)) {
              setPriorityOptions(firstColumn.priority);
              console.log("Priority options:", firstColumn.priority);
            }
          }
        } else {
          console.log("API response status or data issue:", data);
        }
      } catch (error) {
        console.error("Error fetching columns:", error);
      }
    };

    fetchColumns();
  }, []);

  // ── Build the lead object from API data, falling back to passed state
  const lead = React.useMemo(() => {
    if (leadData?.lead) {
      const apiLead = leadData.lead;
      return {
        _id: apiLead.lead_id,
        name: `${apiLead.first_name || ''} ${apiLead.last_name || ''}`.trim() || 'Unknown',
        phone: apiLead.wa_id ? `+${apiLead.wa_id}` : '—',
        email: apiLead.email || '—',
        channel: apiLead.created_from_source || '—',
        stage: apiLead.status || '—',
        agent: apiLead.assigned_user || '—',
        source: apiLead.created_from_source || '—',
        priority: apiLead.priority || 'Medium',
        leadAge: apiLead.created_at ? new Date(apiLead.created_at).toLocaleDateString() : '—',
        lastActivity: leadData.lastActivity != null ? leadData.lastActivity.title : "—" || '—', // Will be calculated from activities
        nextFollowUp: leadData.follow_ups?.[0] ? {
          date: new Date(leadData.follow_ups[0].leads_nextfollowup_date).toLocaleDateString(),
          time: '—',
          type: 'Follow-up',
          overdue: new Date(leadData.follow_ups[0].leads_nextfollowup_date) < new Date()
        } : { date: '—', time: '—', type: 'Call', overdue: false },
        tag: leadData.labels,
        score: apiLead.lead_score || 0,
        lastCallSummary: leadData.calls?.[0]?.notes || '',
        health: 'good',
      };
    }

    // Fallback to passed state if no API data
    if (!passed) {
      return {
        name: "Rahul Mehta",
        phone: "+91 98765 43210",
        channel: "WhatsApp",
        stage: "Proposal",
        agent: "Priya Sharma",
        source: "Facebook Ads",
        priority: "Hot",
        leadAge: "—",
        lastActivity: "—",
        nextFollowUp: { date: "—", time: "—", type: "Call", overdue: false },
        lastCallSummary: "",
        health: "good",
      };
    }

    // Normalise fields from kanban/pipeline API shape → details page shape
    const normalisePriority = (p) => {
      const lp = (p || "").toLowerCase();
      if (lp === "high" || lp === "hot") return "High";
      if (lp === "low" || lp === "cold") return "Low";
      return "Medium";
    };
    const normaliseSource = (s) => {
      const ls = (s || "").toLowerCase();
      if (ls.includes("whatsapp")) return "WhatsApp";
      if (ls.includes("facebook")) return "Facebook";
      if (ls.includes("website")) return "Website";
      return s || "—";
    };
    return {
      _id: passed._id || passed.id,
      name: passed.name || "Unknown",
      phone: passed.phone || "—",
      email: passed.email || "—",
      channel: normaliseSource(passed.source),
      stage: passed.stage || passed.status || "—",
      agent: passed.assigned_user || "—",
      source: normaliseSource(passed.source),
      priority: normalisePriority(passed.priority),
      leadAge: "—",
      lastActivity: "—",
      nextFollowUp: { date: "—", time: "—", type: "Call", overdue: false },
      lastCallSummary: "",
      health: "good",
      uid: passed.uid || null,
      score: passed.score || passed.lead_score || 0,
    };
  }, [leadData, passed]);

  const [currentStage, setCurrentStage] = useState(lead.stage);
  const [assignedAgent, setAssignedAgent] = useState(lead.agent);
  const [noteInput, setNoteInput] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("followup");
  const [toast, setToast] = useState(null);
  const [followUpDone, setFollowUpDone] = useState(false);
  const [columns, setColumns] = useState([]);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [showStageChangeModal, setShowStageChangeModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");
  const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [selectedFieldIds, setSelectedFieldIds] = useState([]);
  const [fieldValues, setFieldValues] = useState({});



  // ── Call modal
  const [showCallModal, setShowCallModal] = useState(false);
  const [callStatus, setCallStatus] = useState("");
  const [callDuration, setCallDuration] = useState("");
  const [callNote, setCallNote] = useState("");


  // ── Tag modal
  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [showAllTagModal, setShowAllTagModal] = useState(false);
  const [tagTitle, setTagTitle] = useState('');
  const [tagTextColor, setTagTextColor] = useState('#ffffff');
  const [tagBgColor, setTagBgColor] = useState('#6B7280');
  const [tagLoading, setTagLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // Fetch available custom fields
  const fetchCustomFields = async () => {
    try {
      setFieldsLoading(true);
      const formData = new FormData();
      formData.append('vendorId', VENDOR_ID);

      const response = await fetch(`${BASE_URI}/api/listLeadCustomFields`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.status) {
        setCustomFields(result.data || []);

        // Default check based on lead data
        if (leadData && leadData.leadCustomValues && Array.isArray(leadData.leadCustomValues)) {
          const currentIds = leadData.leadCustomValues.map(field => field.id);
          setSelectedFieldIds(currentIds);

          // Populate initial values
          const initialValues = {};
          leadData.leadCustomValues.forEach(field => {
            initialValues[field.id] = field.value || "";
          });
          setFieldValues(initialValues);
        }
      }
    } catch (error) {
      console.error("Error fetching custom fields:", error);
    } finally {
      setFieldsLoading(false);
    }
  };


  const handleUpdateCustomFields = async () => {
    try {
      setFieldsLoading(true);
      const leadId = passed?._id || passed?.id || passed?.lead_id;

      // Construct idValue: id-value,id-value
      const idValue = selectedFieldIds
        .map(id => `${id}_${fieldValues[id] || ""}`)
        .join(',');

      const formData = new FormData();
      formData.append('vendorId', VENDOR_ID);
      formData.append('leadId', leadId);
      formData.append('idValue', idValue);

      const response = await fetch(`${BASE_URI}updateLeadCustomFieldsValues`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.status) {
        showToast("Custom fields updated successfully", "success");
        setShowCustomFieldsModal(false);
        // Refresh lead details from the API instead of a full page reload
        fetchLeadDetails();
      } else {

        showToast(result.message || "Failed to update custom fields", "error");
      }
    } catch (error) {
      console.error("Error updating custom fields:", error);
      showToast("Error updating custom fields", "error");
    } finally {
      setFieldsLoading(false);
    }
  };



  // Fetch available tags from API
  const fetchAvailableTags = async () => {
    try {
      const formData = new FormData();
      formData.append('vendorId', VENDOR_ID);

      const response = await fetch(`${BASE_URI}labelList`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.status) {
        setAvailableTags(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  // Fetch tags when modal opens
  useEffect(() => {
    if (showAllTagModal) {
      fetchAvailableTags();
    }
  }, [showAllTagModal]);

  // Set selected tags based on existing lead tags
  useEffect(() => {
    if (availableTags.length > 0 && lead.tag) {
      const existingTagIds = lead.tag.map(tag => tag._id);
      setSelectedTags(existingTagIds);
    }
  }, [availableTags, lead.tag]);

  // Add selected tags to contact
  const handleAddSelectedTags = async () => {
    if (selectedTags.length === 0) {
      showToast("Please select at least one tag", "error");
      return;
    }

    try {
      setTagLoading(true);
      const leadId = passed?._id || passed?.id || passed?.lead_id;

      // Use updateLabel API with multiple labelIds
      const formData = new FormData();
      formData.append('vendorId', VENDOR_ID);
      formData.append('leadId', leadId);
      formData.append('userId', USER_ID);
      formData.append('labelIds', selectedTags.join(','));

      const response = await fetch(`${BASE_URI}updateLabel`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.status) {
        showToast(`${selectedTags.length} tag(s) updated successfully`, "success");
        setShowAllTagModal(false);
        setSelectedTags([]);
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        showToast(result.message || "Failed to update tags", "error");
      }
    } catch (error) {
      console.error("Error updating tags:", error);
      showToast("Failed to update tags", "error");
    } finally {
      setTagLoading(false);
    }
  };

  // Delete tag from contact
  const handleDeleteTag = async (tagId) => {
    try {
      const formData = new FormData();
      formData.append('vendorId', VENDOR_ID);
      formData.append('leadId', passed?._id || passed?.id || passed?.lead_id);
      formData.append('labelId', tagId);
      formData.append('userId', USER_ID);

      const response = await fetch(`${BASE_URI}removeLabelFromContact`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.status) {
        showToast("Tag removed successfully", "success");
        // Refresh lead data or update local state
        // You might want to refetch lead data here
      } else {
        showToast(result.message || "Failed to remove tag", "error");
      }
    } catch (error) {
      console.error("Error removing tag:", error);
      showToast("Failed to remove tag", "error");
    }
  };

  // Add tag to contact
  const handleAddTag = async () => {
    if (!tagTitle.trim()) {
      showToast("Please enter a tag title", "error");
      return;
    }

    try {
      setTagLoading(true);
      const formData = new FormData();
      const leadId = passed?._id || passed?.id || passed?.lead_id;

      formData.append('vendorId', VENDOR_ID);
      formData.append('leadId', leadId);
      formData.append('userId', USER_ID);
      formData.append('labelTitle', tagTitle);
      formData.append('labelTextColor', tagTextColor);
      formData.append('labelBgColor', tagBgColor);

      const response = await fetch(`${BASE_URI}addLabelToContact`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.status) {
        showToast("Tag added successfully", "success");
        // Refresh lead data or update local state
        setShowAllTagModal(false);
        setShowNewTagModal(false);
        setTimeout(() => {
          window.location.reload();
        }, 500);
        setTagTitle('');
        setTagTextColor('#ffffff');
        setTagBgColor('#6B7280');
      } else {
        showToast(result.message || "Failed to add tag", "error");
      }
    } catch (error) {
      console.error("Error adding tag:", error);
      showToast("Failed to add tag", "error");
    } finally {
      setTagLoading(false);
    }
  };
  const [callFollowUpDate, setCallFollowUpDate] = useState("");
  const [callLoading, setCallLoading] = useState(false);

  // ── Follow-up modal
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [fuActionType, setFuActionType] = useState("Call");
  const [fuDate, setFuDate] = useState("");
  const [fuTime, setFuTime] = useState("");
  const [fuNote, setFuNote] = useState("");
  const [fuAttachment, setFuAttachment] = useState(null);
  const [fuLoading, setFuLoading] = useState(false);
  const [editingFollowUpId, setEditingFollowUpId] = useState(null);

  // ── WhatsApp modal
  const [showWAModal, setShowWAModal] = useState(false);
  const [waMessage, setWaMessage] = useState(WA_TEMPLATES[0].text((lead.name || "").split(" ")[0]));
  const [replyType, setReplyType] = useState("message"); // message or template
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [parsedTemplateData, setParsedTemplateData] = useState(null);
  const [templateParams, setTemplateParams] = useState({});
  const [columnData, setColumnData] = useState({});
  const [headerMedia, setHeaderMedia] = useState(null);
  const [headerMediaPreview, setHeaderMediaPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Parse template data from __data field
  const parseTemplateData = (template) => {
    try {
      if (template.__data) {
        const parsed = JSON.parse(template.__data);
        return parsed.template;
      }
    } catch (error) {
      console.error("Error parsing template data:", error);
    }
    return null;
  };

  // Handle parameter changes
  const handleParamChange = (fieldName, value) => {
    setTemplateParams(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Fetch column data for dropdown options
  const fetchColumnData = () => {
    const payload = {
      vendorId: VENDOR_UID,
    };

    fetch(`${BASE_URI}getContactDataMaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Column data response:", data); // Debug log

        // Handle different response structures
        let columnDataMap = {};

        if (data.status && data.data) {
          // Original structure: {status: true, data: [...]}
          data.data.forEach(item => {
            columnDataMap[item.field_name] = item.display_name;
          });
        } else if (typeof data === 'object' && data !== null) {
          // Direct object structure: {"dynamic_contact_full_name": "Contact Full Name", ...}
          columnDataMap = data;
        }

        console.log("Mapped column data:", columnDataMap); // Debug log
        setColumnData(columnDataMap);
      })
      .catch((error) => {
        console.error("Error fetching column data:", error);
      });
  };

  // Fetch column data when component mounts
  useEffect(() => {
    fetchColumnData();
  }, []);

  // Handle file change for header media
  const handleFileChange = async (event, format) => {
    const format_typ =
      format === "IMAGE"
        ? "whatsapp_image"
        : format === "VIDEO"
          ? "whatsapp_video"
          : "whatsapp_document";

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setHeaderMedia(file);

    const fileType = format.toLowerCase();
    const previewUrl = URL.createObjectURL(file);
    setHeaderMediaPreview({
      type: fileType,
      url: previewUrl,
      name: file.name,
    });

    const formData = new FormData();
    formData.append("filepond", file);
    formData.append("vendorId", VENDOR_UID);
    formData.append("uploadfile", format_typ);

    try {
      const response = await fetch(`${BASE_URI}uploadTempMedia`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      const url = responseData.url || responseData.data?.url;

      // Update templateParams with correct field name for FormData
      const fieldName = `header_${fileType}`;
      setTemplateParams(prev => ({
        ...prev,
        [fieldName]: url
      }));

      console.log("Media uploaded and stored in templateParams:", {
        [fieldName]: url
      });
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ── Change Stage modal
  const [showStageModal, setShowStageModal] = useState(false);
  const [pendingStage, setPendingStage] = useState("");

  // ── Reassign modal
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [pendingAgent, setPendingAgent] = useState("");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // ── Reschedule modal (reuse follow-up modal)
  const [rescheduleMode, setRescheduleMode] = useState(false);

  const currentStageIdx = STAGES.indexOf(currentStage);

  const canSaveCall = callStatus !== "" && callNote.trim() !== "";
  const canSaveFU = fuDate !== "" && fuTime !== "";

  // Call validation errors
  const callErrors = {
    status: callStatus === "" ? "Call status is required" : "",
    notes: callNote.trim() === "" ? "Notes are required" : ""
  };

  function showToast(msg) {
    setToast(msg);
  }

  // ── Fetch users for reassign
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await axios.post(`${BASE_URI}get-users`, {
        vendorId: VENDOR_ID
      });

      // Handle the API response structure
      const usersData = response.data.data || [];
      const formattedUsers = usersData.map(user => ({
        id: user._id || user._uid,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        email: user.email,
        username: user.username,
        mobile: user.mobile_number,
        status: user.status
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("Failed to load users");
      // Fallback to mock agents if API fails
      setUsers(AGENTS.map(name => ({ name, id: name })));
    } finally {
      setUsersLoading(false);
    }
  };

  // ... (rest of the code remains the same)
  function handlePriorityChange(newPriority) {
    const leadId = passed?._id || passed?.id || passed?.lead_id;

    // Update local state immediately for better UX
    setLeadData(prev => ({
      ...prev,
      lead: { ...prev.lead, priority: newPriority }
    }));

    // Call API to update priority
    fetch(`${BASE_URI}update-lead-priority`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        lead_id: leadId,
        priority: newPriority,
        vendorId: VENDOR_ID
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === true || data.status === "success") {
          showToast(`Priority changed to ${newPriority}`);
        } else {
          // Revert on error
          setLeadData(prev => ({
            ...prev,
            lead: { ...prev.lead, priority: lead.priority }
          }));
          showToast(data.message || "Failed to update priority");
        }
      })
      .catch(error => {
        // Revert on error
        setLeadData(prev => ({
          ...prev,
          lead: { ...prev.lead, priority: lead.priority }
        }));
        console.error("Error updating priority:", error);
        showToast("Network error. Please try again.");
      });
  }

  function handleStageChange() {
    if (!selectedStage) return;

    const selectedColumn = columns.find(c => c.header_name === selectedStage);
    const leadId = passed?._id || passed?.id || passed?.lead_id;

    if (selectedColumn) {
      // Call API to update lead status
      fetch(`${BASE_URI}update-lead-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          lead_id: leadId,
          status: selectedColumn.id,
          vendorId: VENDOR_ID
        })
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === "success") {
            setCurrentStage(selectedStage);
            setShowStageChangeModal(false);
            setSelectedStage("");
            showToast(`Stage changed to ${selectedStage}`);
          } else {
            showToast(data.message || "Failed to update stage");
          }
        })
        .catch(error => {
          console.error("Error updating lead status:", error);
          showToast("Network error. Please try again.");
        });
    }
  }

  function handleSaveNote() {
    if (!noteInput.trim()) return;

    setNoteLoading(true);
    const leadId = passed?._id || passed?.id || passed?.lead_id;
    const noteData = {
      leadId: leadId,
      vendorId: VENDOR_ID,
      userId: USER_ID, // You might want to get this from user context
      notes: noteInput.trim()
    };

    fetch(`${BASE_URI}add-lead-notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(noteData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === true) {
          // Add the new note to the existing notes list
          if (leadData?.notes) {
            const newNote = {
              _id: data.noteId || Date.now(), // Use API response ID or fallback
              leads_title: '', // Notes might not have titles
              leads_notes: noteInput.trim(),
              leads_nextfollowup_date: null,
              leads_attachment: '',
              lead_followup_iscompleted: 0,
              created_at: new Date().toISOString()
            };
            leadData.notes.unshift(newNote);
          }

          setNoteInput("");
          showToast("Note saved successfully");
        } else {
          showToast(data.message || "Failed to save note");
        }
      })
      .catch(error => {
        console.error("Error saving note:", error);
        showToast("Network error. Please try again.");
      })
      .finally(() => {
        setNoteLoading(false);
      });
  }

  function handleSaveCall() {
    if (!canSaveCall) return;

    setCallLoading(true);
    const leadId = passed?._id || passed?.id || passed?.lead_id;
    const callData = {
      leadId: leadId, // Use lead ID or fallback to 1
      status: callStatus,
      follow_up_date: callFollowUpDate || null,
      notes: callNote || "",
      userId: USER_ID, // You might want to get this from user context
    };

    fetch(`${BASE_URI}add-lead-calls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(callData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === true) {
          // Add the new call to the existing calls list
          if (leadData?.calls) {
            const newCall = {
              _id: data.callId,
              status: callStatus,
              notes: callNote || null,
              follow_up_date: callFollowUpDate || null,
              created_at: new Date().toISOString()
            };
            leadData.calls.unshift(newCall);
          }

          setShowCallModal(false);
          setCallStatus("");
          setCallDuration("");
          setCallNote("");
          setCallFollowUpDate("");
          showToast("Call logged successfully");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showToast(data.message || "Failed to log call");
        }
      })
      .catch(error => {
        console.error("Error logging call:", error);
        showToast("Network error. Please try again.");
      })
      .finally(() => {
        setCallLoading(false);
      });
  }

  function handleSaveFollowUp() {
    if (!canSaveFU) return;

    setFuLoading(true);
    const leadId = passed?._id || passed?.id || passed?.lead_id;
    const formData = new FormData();

    if (editingFollowUpId) {
      // Update existing follow-up
      formData.append('leadFollowUpId', editingFollowUpId);
      formData.append('date', fuDate);
      formData.append('title', fuActionType);
      formData.append('note', fuNote || '');

      // Only append attachment if a file is selected
      if (fuAttachment) {
        formData.append('attachment', fuAttachment);
      }

      fetch(`${BASE_URI}update-followup`, {
        method: "POST",
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === true) {
            // Update the existing follow-up in the list
            if (leadData?.follow_ups) {
              const followUpIndex = leadData.follow_ups.findIndex(fu => fu._id === editingFollowUpId);
              if (followUpIndex !== -1) {
                leadData.follow_ups[followUpIndex] = {
                  ...leadData.follow_ups[followUpIndex],
                  leads_title: fuActionType,
                  leads_nextfollowup_date: fuDate,
                  leads_notes: fuNote || '',
                  leads_attachment: fuAttachment ? fuAttachment.name : leadData.follow_ups[followUpIndex].leads_attachment,
                  updated_at: new Date().toISOString()
                };
              }
            }

            resetFollowUpModal();
            showToast("Follow-up updated successfully");

            setTimeout(() => {
              window.location.reload();
            }, 1000);


          } else {
            showToast(data.message || "Failed to update follow-up");
          }
        })
        .catch(error => {
          console.error("Error updating follow-up:", error);
          showToast("Network error. Please try again.");
        })
        .finally(() => {
          setFuLoading(false);
        });
    } else {
      // Add new follow-up (existing logic)
      formData.append('leadId', leadId);
      formData.append('date', fuDate);
      formData.append('title', fuActionType);
      formData.append('time', fuTime || '');
      formData.append('note', fuNote || '');
      formData.append('userId', USER_ID);

      // Only append attachment if a file is selected
      if (fuAttachment) {
        formData.append('attachment', fuAttachment);
      }

      fetch(`${BASE_URI}add-lead-followup`, {
        method: "POST",
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === true) {
            // Add the new follow-up to the existing follow-ups list
            if (leadData?.follow_ups) {
              const newFollowUp = {
                _id: data.followUpId,
                leads_title: fuActionType,
                leads_nextfollowup_date: fuDate,
                leads_notes: fuNote || '',
                leads_attachment: fuAttachment ? fuAttachment.name : '',
                lead_followup_iscompleted: 0,
                created_at: new Date().toISOString()
              };
              leadData.follow_ups.unshift(newFollowUp);
            }

            resetFollowUpModal();
            showToast(rescheduleMode ? "Follow-up rescheduled" : "Follow-up scheduled");
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            showToast(data.message || "Failed to schedule follow-up");
          }
        })
        .catch(error => {
          console.error("Error scheduling follow-up:", error);
          showToast("Network error. Please try again.");
        })
        .finally(() => {
          setFuLoading(false);
        });
    }
  }

  const resetFollowUpModal = () => {
    setShowFollowUpModal(false);
    setFuDate("");
    setFuTime("");
    setFuNote("");
    setFuActionType("Call");
    setFuAttachment(null);
    setRescheduleMode(false);
    setEditingFollowUpId(null);
  };

  const handleSendWA = async () => {
    if (replyType === "message" && !waMessage.trim()) return;
    if (replyType === "template" && !selectedTemplate) return;

    try {
      let response;
      const leadId = passed?._id || passed?.id || passed?.lead_id;
      if (replyType === "message") {
        // Send regular message
        const formData = new FormData();
        formData.append("vendorId", VENDOR_ID);
        formData.append("leadId", leadId);
        formData.append("replyText", waMessage);
        formData.append("userId", USER_ID);

        console.log("Sending message with:", {
          vendorId: VENDOR_ID,
          leadId: leadId,
          replyText: waMessage
        });

        response = await fetch(`${BASE_URI}sendChatMessage`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        console.log("API Response:", result);

        if (!result.status) {
          throw new Error(result.message || "Failed to send message");
        }
      } else {
        // Send template message
        const formData = new FormData();
        formData.append("vendorId", VENDOR_ID);
        formData.append("leadId", leadId);
        formData.append("userId", USER_ID);
        formData.append("templateId", selectedTemplate._id || selectedTemplate.id);
        formData.append("templateData", JSON.stringify(templateParams));

        console.log("Sending template with FormData:", {
          vendorId: VENDOR_ID,
          leadId: leadId,
          templateId: selectedTemplate._id || selectedTemplate.id,
          templateData: templateParams
        });

        response = await fetch(`${BASE_URI}sendTemplateMessage`, {
          method: "POST",
          body: formData,
        });

        const templateResult = await response.json();
        console.log("Template API Response:", templateResult);

        if (!templateResult.status) {
          throw new Error(templateResult.message || "Failed to send template");
        }
      }

      console.log("Message/Template sent successfully");
      showToast("WhatsApp message sent");

      // Reset modal
      setShowWAModal(false);
      setWaMessage(WA_TEMPLATES[0].text((lead.name || "").split(" ")[0]));
      setSelectedTemplate(null);
      setTemplateParams({});
      setHeaderMedia(null);
      setHeaderMediaPreview(null);

    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      showToast(error.message || "Failed to send message", "error");
    }
  };

  // Fetch templates from API
  const fetchTemplates = async () => {
    try {
      setTemplateLoading(true);
      const response = await axios.post(`${BASE_URI}templatelistflow`, {
        vendorUId: VENDOR_UID,
      });

      if (response.data.success && response.data.data) {
        setTemplates(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setTemplateLoading(false);
    }
  };

  // Fetch templates when modal opens and replyType is template
  useEffect(() => {
    if (showWAModal && replyType === "template" && templates.length === 0) {
      fetchTemplates();
    }
  }, [showWAModal, replyType]);

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => (t.id || t._id) === templateId);
    setSelectedTemplate(template);
    const parsedData = parseTemplateData(template);
    setParsedTemplateData(parsedData);
  };

  const completeFollowUp = async (followUpId) => {
    try {
      const response = await axios.post(`${BASE_URI}complete-followUp`, {
        leadFollowUpId: followUpId,
        userId: USER_ID
      });

      if (response.data.status) {
        // Update the follow-up in local state to mark as completed
        if (leadData?.follow_ups) {
          const followUpIndex = leadData.follow_ups.findIndex(fu => fu._id === followUpId);
          if (followUpIndex !== -1) {
            leadData.follow_ups[followUpIndex].lead_followup_iscompleted = 1;
            leadData.follow_ups[followUpIndex].completed_at = new Date().toISOString();
          }
        }

        showToast('Follow-up marked as completed!');
      } else {
        showToast(response.data.message || "Failed to complete follow-up");
      }
    } catch (error) {
      console.error("Error completing follow-up:", error);
      showToast("Error completing follow-up");
    }
  };

  function handleReschedule() {
    setRescheduleMode(true);
    setShowFollowUpModal(true);
  }

  function handleChangeStage() {
    if (!pendingStage || pendingStage === currentStage) { setShowStageModal(false); return; }
    setCurrentStage(pendingStage);
    setShowStageModal(false);
    setPendingStage("");
    showToast(`Stage changed to ${pendingStage}`);
  }

  function handleReassign() {
    if (!pendingAgent) { setShowReassignModal(false); return; }

    // Find the selected user object to get the userId
    const selectedUser = users.find(user => user.name === pendingAgent);
    if (!selectedUser) {
      showToast("Invalid user selection");
      return;
    }

    // Get leadId from the current lead data
    const leadId = passed?._id || passed?.id || passed?.lead_id;

    // Call reAssignLead API
    reAssignLead({
      leadId: leadId,
      vendorId: VENDOR_ID,
      userId: selectedUser.id
    });
  }

  const reAssignLead = async ({ leadId, vendorId, userId }) => {
    try {
      const response = await axios.post(`${BASE_URI}reAssignLead`, {
        leadId,
        vendorId,
        userId,
        loginUserId: USER_ID
      });

      if (response.data.status) {
        // Update local state with new assigned agent
        setAssignedAgent(pendingAgent);
        setShowReassignModal(false);
        setPendingAgent("");
        showToast(`Lead reassigned to ${pendingAgent}`);

        // Refresh page after successful reassignment
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showToast("Failed to reassign lead");
      }
    } catch (error) {
      console.error("Error reassigning lead:", error);
      showToast("Error reassigning lead");
    }
  };

  function openReassignModal() {
    setShowReassignModal(true);
    fetchUsers();
  }

  // Update pendingAgent when users are loaded and modal is open
  useEffect(() => {
    if (showReassignModal && users.length > 0 && assignedAgent) {
      // Find the user that matches the current lead agent
      const matchingUser = users.find(user =>
        user.username === assignedAgent
      );

      // Set pendingAgent to the matching user's name
      if (matchingUser) {
        setPendingAgent(matchingUser.username);
      }
    }
  }, [users, showReassignModal, assignedAgent]);

  function openFollowUpModal() {
    setRescheduleMode(false);
    setFuDate(""); setFuTime(""); setFuNote(""); setFuActionType("Call");
    setEditingFollowUpId(null);
    setShowFollowUpModal(true);
  }

  function editFollowUp(followUp) {
    // Populate modal with existing follow-up data
    setFuActionType(followUp.leads_title || "Call");

    // Handle date formatting
    if (followUp.leads_nextfollowup_date) {
      const followUpDate = new Date(followUp.leads_nextfollowup_date);
      setFuDate(followUpDate.toISOString().split('T')[0]);
      setFuTime(followUpDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else {
      setFuDate("");
      setFuTime("");
    }

    setFuNote(followUp.leads_notes || "");
    setEditingFollowUpId(followUp._id);
    setRescheduleMode(false);
    setShowFollowUpModal(true);
  }

  function openAddNote() {
    setActiveTab("notes");
  }

  // ── Computed timeline from API data
  const timeline = React.useMemo(() => {
    const items = [];

    // Note: Lead creation removed to avoid extra item

    // Add activities (includes calls, so no need to add separate calls)
    if (leadData?.activities) {
      console.log(leadData.activities.length);
      leadData.activities.forEach(activity => {
        const iconMap = {
          'Calls': 'call',
          'Notes': 'note',
          'Stage': 'stage',
          'Assign': 'assign'
        };

        items.push({
          id: activity._id,
          icon: iconMap[activity.type] || 'note',
          title: activity.title,
          subtitle: activity.message || 'No details',
          time: new Date(activity.created_at).toLocaleString(),
          agent: true
        });
      });
    }

    // Note: Calls are already included in activities, so we don't add them separately
    // to avoid duplicates in the timeline

    // Sort by date (newest first)
    return items.sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [leadData]);

  return (
    <div className="min-h-screen font-sans w-full max-w-full overflow-x-hidden" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", color: "#111827" }}>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading lead details...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Lead</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b" style={{ borderColor: "rgba(229, 231, 235, 0.6)", boxShadow: "0px 8px 32px rgba(0,0,0,0.08)" }}>
        <div className="w-full max-w-full mx-auto px-3 h-full flex items-center justify-between gap-4 flex-wrap py-3">
          {/* Left – identity with enhanced narrative */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#16A34A] transition-all duration-200 hover:translate-x-1 shrink-0"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span className="border-b border-transparent hover:border-[#16A34A] pb-0.5">Back to Leads</span>
            </button>
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-[#E5E7EB] to-transparent" />

            {/* Enhanced avatar with status indicator */}
            <div className="relative group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white flex items-center justify-center font-bold text-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                {lead.name.charAt(0)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-[#111827] leading-tight tracking-tight">{lead.name}</h1>
                <ChannelBadge channel={lead.channel} />

              </div>
              <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">{lead.phone}</span>
                </div>
                {/* <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{lead.leadAge} in pipeline</span>
                </div> */}
                {/* <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">{lead.lastActivity}</span>
                </div> */}
              </div>
            </div>
          </div>

          {/* Right – enhanced actions */}
          <div className="flex items-center gap-3 flex-wrap">


            <button
              className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border hover:shadow-lg hover:scale-105"
              style={{ height: 44, borderColor: "#16A34A", color: "#16A34A", background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)" }}
              onClick={() => setShowAllTagModal(true)}
            >
              <div className="w-5 h-5 to-emerald-600 rounded-full flex items-center justify-center">
                <Tag className="w-3 h-3 text-green" />
              </div>
              <span>Tags</span>
            </button>

            <button
              className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border hover:shadow-lg hover:scale-105"
              style={{ height: 44, borderColor: "#16A34A", color: "#16A34A", background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)" }}
              onClick={() => setShowWAModal(true)}
            >
              <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-3 h-3 text-white" />
              </div>
              <span>WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <AudioCallButton />
            {/* <button className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-lg hover:scale-105 bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white shadow-md">
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </button> */}
          </div>
        </div>
      </header>

      {/* ── BODY ───────────────────────────────────────────────────────── */}
      <div className="w-full max-w-full mx-auto px-3 py-3 flex flex-col xl:flex-row gap-5 items-start overflow-x-hidden">

        {/* ── LEFT PANEL ───────────────────────────────────────────────── */}
        <aside className="w-full xl:w-[340px] shrink-0 sticky xl:self-start space-y-6">

          {/* Enhanced Snapshot card with narrative design */}
          <div className="bg-white rounded-2xl border px-4 space-y-5 relative overflow-hidden" style={{ borderColor: "rgba(229, 231, 235, 0.6)", boxShadow: "0px 12px 40px rgba(0,0,0,0.08)" }}>
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-lg flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5 text-white" />
                  </div>
                  Lead Snapshot
                </h2>

              </div>

              {/* Enhanced Stage selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mt-1">Current Stage</p>
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                    <Target className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-bold text-blue-700">{columns.findIndex(c => c.header_name === currentStage) + 1} of {columns.length}</span>
                  </div>
                </div>
                {/* <div className="flex items-center gap-2">
                  <div className="flex-1 h-11 flex items-center justify-center px-4 border border-[#E5E7EB] rounded-xl bg-white/80">
                    <span className="text-sm font-medium text-[#111827]">{currentStage || 'No stage'}</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowStageChangeModal(true);
                      setSelectedStage(currentStage);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90"
                    style={{ background: "#16A34A" }}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    Change
                  </button>
                </div> */}
              </div>

              {/* Enhanced fields with icons and better layout */}
              <div className="space-y-4 mt-3">
                {[
                  { label: "Assigned Agent", value: lead.agent, icon: <User className="w-4 h-4 text-[#6B7280]" />, color: "from-blue-50 to-indigo-50" },
                  { label: "Lead Source", value: lead.source, icon: <Tag className="w-4 h-4 text-[#6B7280]" />, color: "from-purple-50 to-pink-50" },
                  { label: "Lead Age", value: lead.leadAge, icon: <Clock className="w-4 h-4 text-[#6B7280]" />, color: "from-amber-50 to-orange-50" },
                  { label: "Lead Score", value: `+${lead.score || 0}`, icon: <TrendingUp className="w-4 h-4 text-[#6B7280]" />, color: "from-blue-50 to-indigo-50" },
                  { label: "Last Activity", value: lead.lastActivity, icon: <Activity className="w-4 h-4 text-[#6B7280]" />, color: "from-green-50 to-emerald-50" },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className={`flex items-center justify-between gap-3 rounded-xl border border-white/50`}>
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 bg-white/80 rounded-lg flex items-center justify-center shadow-sm">
                        {icon}
                      </div>
                      <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">{label}</span>
                    </div>
                    <span className="text-xs font-bold text-[#111827] bg-white/80 px-2 py-1 rounded-lg">{value}</span>
                  </div>
                ))}

                {/* Enhanced Priority */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-white/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center shadow-sm">
                      <Flame className="w-4 h-4 text-[#6B7280]" />
                    </div>
                    <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Priority</span>
                  </div>
                  <select
                    disabled
                    value={lead.priority || 'Medium'}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className="text-xs font-bold px-2 py-2 rounded-lg border border-black/50 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition-all duration-200"
                  >
                    {priorityOptions.length > 0 ? (
                      priorityOptions.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Custom Fields */}
                <div
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-white/50 cursor-pointer hover:shadow-md transition-all group"
                  onClick={() => {
                    setShowCustomFieldsModal(true);
                    fetchCustomFields();
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center shadow-sm">
                      <FileText className="w-4 h-4 text-[#6B7280]" />
                    </div>
                    <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Custom Fields</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white/80 border border-black/50 shadow-sm group-hover:bg-white transition-colors">
                    <Edit3 className="w-3.5 h-3.5 text-[#6B7280]" />
                  </div>
                </div>



              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent" />

              {/* Enhanced Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2 pb-5 mt-3">
                <button
                  className="group flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:shadow-lg hover:scale-105 bg-gradient-to-r from-[#16A34A] to-[#15803D]"
                  onClick={() => {
                    setShowStageChangeModal(true);
                    setSelectedStage(currentStage);
                  }}
                >
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Change Stage</span>
                </button>
                <button
                  className="group flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border transition-all duration-200 hover:bg-[#F3F4F6] hover:shadow-md hover:scale-105"
                  style={{ borderColor: "#E5E7EB", color: "#374151", background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}
                  onClick={openReassignModal}
                >
                  <UserCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Reassign</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN PANEL ───────────────────────────────────────────────── */}
        <main className="flex-1 space-y-4 min-w-0">
          {/* ── SALES PIPELINE JOURNEY ── */}
          <div className="bg-white rounded-2xl border px-5 py-4 flex items-center justify-start overflow-x-auto hide-scrollbar" style={{ borderColor: "#E5E7EB", boxShadow: "0px 4px 20px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-3 min-w-max">
              {columns.map((column, i) => {
                const currentStageIdx = columns.findIndex(c => c.header_name === currentStage);
                const isCompleted = i < currentStageIdx;
                const isActive = i === currentStageIdx;
                const isLast = i === columns.length - 1;

                let pillClass = "";
                let textColor = "";
                let icon = null;

                if (isCompleted) {
                  pillClass = "bg-[#16A34A]";
                  textColor = "text-white";
                  icon = <Check className="w-3.5 h-3.5 mr-1" />;
                } else if (isActive) {
                  pillClass = "bg-[#16A34A]";
                  textColor = "text-white";
                } else {
                  pillClass = "bg-[#F3F4F6]";
                  textColor = "text-[#9CA3AF]";
                }

                return (
                  <React.Fragment key={column.id}>
                    <div
                      className={`flex items-center justify-center px-4 py-1.5 rounded-xl text-sm font-bold ${pillClass} ${textColor}`}
                    >
                      {icon}
                      {column.header_name}
                    </div>
                    {!isLast && (
                      <ChevronRight className="w-4 h-4 text-[#9CA3AF] opacity-60 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* ── NEXT FOLLOW-UP / HEALTH BANNER ── */}
          {/* {(() => {
            const isOverdue = lead.nextFollowUp.overdue;
            // Using the amber style from the mockup for "Needs Attention"
            const bgClass = isOverdue ? "bg-[#fffbeb]" : "bg-[#f0fdf4]";
            const borderClass = isOverdue ? "border-[#fde68a]" : "border-[#bbf7d0]";
            const iconColor = isOverdue ? "text-[#d97706]" : "text-[#16a34a]";
            const titleColor = isOverdue ? "text-[#b45309]" : "text-[#15803d]";
            const titleText = isOverdue ? "Needs Attention" : "On Track";
            const IconObj = isOverdue ? AlertCircle : CheckCircle2;

            return (
              <div className={`rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border ${bgClass} ${borderClass}`} style={{ boxShadow: "0px 4px 20px rgba(0,0,0,0.02)" }}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <IconObj className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${titleColor}`}>
                      {titleText}
                    </h3>
                    <p className="text-sm text-[#4b5563] mt-0.5">
                      {lead.lastCallSummary || "No recent updates."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 md:pl-4">
                  <button onClick={openFollowUpModal} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity whitespace-nowrap">
                    <AlarmClock className="w-4 h-4 text-[#6b7280]" />
                    <span className="text-sm text-[#6b7280] font-medium">
                      Follow-up: <span className={`font-semibold ${isOverdue ? "text-[#b91c1c]" : "text-[#111827]"}`}>{lead.nextFollowUp.date} · {lead.nextFollowUp.time}</span>
                      {isOverdue && <span className="font-bold text-[#b91c1c]"> · Overdue</span>}
                    </span>
                  </button>
                </div>
              </div>
            );
          })()} */}



          {/* Lead Health Banner */}
          {/* <HealthBanner health={lead.health} summary={lead.lastCallSummary} followUp={lead.nextFollowUp} /> */}

          {/* Enhanced Tabs */}
          <div className="bg-white rounded-2xl border overflow-hidden relative" style={{ borderColor: "rgba(229, 231, 235, 0.6)", boxShadow: "0px 12px 40px rgba(0,0,0,0.08)" }}>
            {/* Decorative tab background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50/20" />

            <div className="relative z-10">
              <div className="w-full justify-start rounded-none border-b px-2 h-14 bg-white/80 backdrop-blur-sm gap-0 flex items-center" style={{ borderColor: "rgba(229, 231, 235, 0.6)" }}>
                {[
                  { value: "followup", label: "Follow-up", icon: <CalendarPlus className="w-4 h-4" />, color: "from-blue-500 to-indigo-600" },
                  { value: "calls", label: "Calls", icon: <Phone className="w-4 h-4" />, color: "from-green-500 to-emerald-600" },
                  { value: "timeline", label: "Activities", icon: <GitCommitHorizontal className="w-4 h-4" />, color: "from-purple-500 to-pink-600" },
                  { value: "notes", label: "Notes", icon: <StickyNote className="w-4 h-4" />, color: "from-amber-500 to-orange-600" },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setActiveTab(t.value)}
                    className={`group flex items-center gap-2.5 px-6 h-full rounded-none text-sm font-bold transition-all duration-200 relative ${activeTab === t.value
                      ? `text-black bg-gradient-to-r ${t.color} bg-clip-text`
                      : "text-[#6B7280] hover:text-[#2563EB]"
                      }`}
                  >
                    {/* Active tab indicator */}
                    {activeTab === t.value && (
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${t.color}`} />
                    )}
                    {/* Icon with gradient for active tab */}
                    <div className={`transition-all duration-200 ${activeTab === t.value
                      ? `bg-gradient-to-br ${t.color} text-white`
                      : "text-[#6B7280]"
                      } w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110`}>
                      {t.icon}
                    </div>
                    <span className="relative">{t.label}</span>
                    {/* Badge for active tab */}
                    {activeTab === t.value && (
                      <div className={`absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br ${t.color} rounded-full animate-pulse`} />
                    )}
                  </button>
                ))}
              </div>

              {/* ── FOLLOW-UP TAB ──────────────────────────────────────── */}
              {activeTab === "followup" && (
                <div className="px-3 pb-3 pt-2 space-y-4 focus-visible:outline-none">
                  {/* Set Follow-up Button */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-[#111827]">Follow-up Management</h3>
                    <button
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90"
                      style={{ background: "#16A34A" }}
                      onClick={openFollowUpModal}
                    >
                      <CalendarPlus className="w-4 h-4" />
                      Set Follow-up
                    </button>
                  </div>

                  {followUpDone ? (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-2 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-green-700">Follow-up completed</p>
                        <p className="text-xs text-green-600 mt-0.5">Great work! Set your next follow-up to stay on track.</p>
                      </div>
                      <button
                        className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90"
                        style={{ background: "#16A34A" }}
                        onClick={openFollowUpModal}
                      >
                        <CalendarPlus className="w-4 h-4" />
                        Set Next
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leadData?.follow_ups && leadData.follow_ups.length > 0 ? (
                        leadData.follow_ups.map((followUp) => {
                          const isCompleted = followUp.lead_followup_iscompleted === 1;

                          return (
                            <div
                              key={followUp._id}
                              className={`rounded-xl border p-4 space-y-3 ${isCompleted
                                ? "border-green-200 bg-green-50"
                                : new Date(followUp.leads_nextfollowup_date) < new Date()
                                  ? "border-red-200 bg-red-50"
                                  : "border-gray-200 bg-white"
                                }`}
                              style={{
                                borderLeftWidth: 4,
                                borderLeftColor: isCompleted
                                  ? "#16A34A"
                                  : new Date(followUp.leads_nextfollowup_date) < new Date()
                                    ? "#DC2626"
                                    : "#16A34A",
                              }}
                            >
                              <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Calendar className={`w-4 h-4 ${isCompleted ? "text-green-600" : "text-[#6B7280]"}`} />
                                    <p className={`text-sm font-bold ${isCompleted ? "text-green-700" : "text-[#111827]"}`}>
                                      {new Date(followUp.leads_nextfollowup_date).toLocaleDateString()} · {followUp.time || new Date(followUp.leads_nextfollowup_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {isCompleted && (
                                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold">
                                        <CheckCircle2 className="w-3.5 h-3.5" />Completed
                                      </span>
                                    )}
                                    {!isCompleted && new Date(followUp.leads_nextfollowup_date) < new Date() && (
                                      <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold">
                                        <AlertCircle className="w-3.5 h-3.5" />Overdue
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-sm font-semibold ${isCompleted ? "text-green-600" : "text-[#374151]"}`}>
                                    {followUp.leads_title}
                                  </p>
                                  {isCompleted && followUp.completed_at && (
                                    <p className="text-xs text-green-600">
                                      Completed on {new Date(followUp.completed_at).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                {!isCompleted && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      className="text-xs text-[#16A34A] font-semibold hover:underline"
                                      onClick={() => {
                                        editFollowUp(followUp);
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="text-xs text-green-600 font-semibold hover:underline"
                                      onClick={() => {
                                        completeFollowUp(followUp._id);
                                      }}
                                    >
                                      Complete
                                    </button>
                                  </div>
                                )}
                              </div>
                              {followUp.leads_notes && (
                                <p className={`text-sm rounded-lg p-3 ${isCompleted ? "text-green-700 bg-green-100" : "text-[#6B7280] bg-gray-50"
                                  }`}>
                                  {followUp.leads_notes}
                                </p>
                              )}
                              {followUp.leads_attachment && (
                                <div className="border-t pt-3" style={{ borderColor: "#F3F4F6" }}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-[#6B7280]" />
                                      <span className="text-sm font-medium text-[#374151]">Attachment</span>
                                    </div>
                                    <button
                                      onClick={() => window.open(followUp.leads_attachment, '_blank')}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                                    >
                                      <ArrowRight className="w-3 h-3" />
                                      Open
                                    </button>
                                  </div>
                                  <div className="mt-2">
                                    <p className="text-xs text-[#6B7280] truncate">
                                      {followUp.leads_attachment.split('/').pop()}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">No follow-ups scheduled</p>
                          <button
                            onClick={openFollowUpModal}
                            className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Schedule your first follow-up
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── CALLS TAB ──────────────────────────────────────── */}
              {activeTab === "calls" && (
                <div className="px-3 pb-3 pt-2 space-y-4 focus-visible:outline-none">
                  {/* Call Now Button */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#111827]">Call Management</h3>
                    <button
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90"
                      style={{ background: "#16A34A" }}
                      onClick={() => setShowCallModal(true)}
                    >
                      <PlusCircle className="w-4 h-4" />
                      Log Call
                    </button>
                  </div>

                  {/* <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => setShowCallModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90"
                      style={{ background: "#16A34A" }}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />Log Call
                    </button>
                  </div> */}
                  <div className="space-y-3">
                    {leadData?.calls && leadData.calls.length > 0 ? (
                      leadData.calls.map((call) => (
                        <div key={call._id} className="rounded-xl border p-4 space-y-2" style={{ borderColor: "#E5E7EB", background: "#fff", boxShadow: "0px 4px 12px rgba(0,0,0,0.04)" }}>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${call.status === 'Busy' ? 'bg-red-500' :
                                call.status === 'Unavailable' ? 'bg-orange-500' :
                                  call.status === 'Completed' ? 'bg-green-500' :
                                    'bg-gray-500'
                                }`}>
                                {call.status === 'Busy' ? 'B' :
                                  call.status === 'Unavailable' ? 'U' :
                                    call.status === 'Completed' ? 'C' : 'N'}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#111827]">{call.status}</p>
                                <p className="text-xs text-[#6B7280]">{new Date(call.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                            {call.follow_up_date && (
                              <div className="text-right">
                                <p className="text-xs text-[#6B7280]">Follow-up</p>
                                <p className="text-xs font-medium text-[#16A34A]">{new Date(call.follow_up_date).toLocaleDateString()}</p>
                              </div>
                            )}
                          </div>
                          {call.notes && (
                            <p className="text-xs text-[#6B7280] bg-gray-50 rounded-lg p-2">{call.notes}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No call history available</p>
                        <button
                          onClick={() => setShowCallModal(true)}
                          className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Log your first call
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TIMELINE TAB ──────────────────────────────────────── */}
              {activeTab === "timeline" && (
                <div className="px-3 pb-3 pt-2 focus-visible:outline-none">
                  <h3 className="text-sm font-bold text-[#111827] mb-5">Activity Timeline</h3>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3.5 bottom-3.5 w-px bg-[#E5E7EB]" />
                    <div className="space-y-5">
                      {timeline.map((item) => (
                        <div key={item.id} className="flex items-start gap-4">
                          <TimelineIcon type={item.icon} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
                              {item.agent ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded">Agent</span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">Bot</span>
                              )}
                            </div>
                            <p className="text-xs text-[#6B7280] mt-0.5">{item.subtitle}</p>
                            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── NOTES TAB ─────────────────────────────────────────── */}
              {activeTab === "notes" && (
                <div className="px-3 pb-3 pt-2 space-y-5 focus-visible:outline-none">
                  {/* Add Note Button */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#111827]">Notes Management</h3>
                    <button
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90"
                      style={{ background: "#16A34A" }}
                      onClick={() => {
                        // Focus on the textarea
                        const textarea = document.querySelector('textarea[placeholder*="Type your note here"]');
                        if (textarea) {
                          textarea.focus();
                          textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                    >
                      <StickyNote className="w-4 h-4" />
                      Add Note
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Create New Note</h4>
                    <textarea
                      placeholder="Type your note here..."
                      className="w-full text-sm min-h-[80px] border border-[#E5E7EB] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] resize-none"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      autoFocus={activeTab === "notes"}
                    />
                    <button
                      onClick={handleSaveNote}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 hover:opacity-90"
                      style={{ background: "#16A34A" }}
                      disabled={!noteInput.trim() || noteLoading}
                    >
                      {noteLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />Save Note
                        </>
                      )}
                    </button>
                  </div>
                  <div className="w-full h-px bg-[#E5E7EB]" />
                  <div className="space-y-3">
                    {leadData?.notes && leadData.notes.length > 0 ? (
                      leadData.notes.map((note) => (
                        <div key={note._id} className="rounded-xl border p-4 space-y-2" style={{ borderColor: "#E5E7EB", background: "#fff", boxShadow: "0px 4px 12px rgba(0,0,0,0.04)" }}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-[#111827]">Note</span>
                              <span className="text-xs text-[#9CA3AF]">·</span>
                              <span className="text-xs text-[#9CA3AF]">{new Date(note.created_at).toLocaleString()}</span>
                            </div>
                            {note.leads_nextfollowup_date && (
                              <div className="flex items-center gap-1 text-xs text-blue-600">
                                <Calendar className="w-3 h-3" />
                                Follow-up: {new Date(note.leads_nextfollowup_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          {note.leads_title && (
                            <p className="text-sm font-semibold text-[#374151]">{note.leads_title}</p>
                          )}
                          <p className="text-sm text-[#374151]">{note.leads_notes}</p>
                          {note.leads_attachment && (
                            <div className="flex items-center gap-2 text-xs text-blue-600">
                              <Paperclip className="w-3.5 h-3.5" />
                              <span>Attachment available</span>
                            </div>
                          )}
                          {note.lead_followup_iscompleted === 0 && note.leads_nextfollowup_date && (
                            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                              <Clock className="w-3 h-3" />
                              Pending follow-up
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No notes available</p>
                        <button
                          onClick={() => {
                            const textarea = document.querySelector('textarea[placeholder*="Type your note here"]');
                            if (textarea) {
                              textarea.focus();
                              textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                          className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Add your first note
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── ENHANCED CALL LOG MODAL ──────────────────────────────────────────────── */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden shadow-2xl" style={{ boxShadow: "0px 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2563EB]/10 to-transparent rounded-full blur-2xl" />

            <div className="relative z-10">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#111827]">Log a Call</h2>
                    <p className="text-xs text-[#6B7280]">Record your conversation details</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCallModal(false)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-[#374151] block mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Call Status <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    value={callStatus}
                    onChange={(e) => setCallStatus(e.target.value)}
                    className={`w-full h-11 text-sm font-medium border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-[#16A34A] bg-white/80 backdrop-blur-sm transition-all duration-200 ${callErrors.status ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-[#16A34A]'
                      }`}
                  >
                    <option value="">Select status...</option>
                    <option value="Connected">🟢 Connected</option>
                    <option value="No Answer">🟡 No Answer</option>
                    <option value="Busy">🔴 Busy</option>
                  </select>
                  {callErrors.status && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {callErrors.status}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold text-[#374151] block mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    className="w-full h-11 text-sm font-medium border border-gray-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-[#16A34A] bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-[#16A34A]"
                    value={callFollowUpDate}
                    onChange={(e) => setCallFollowUpDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-[#374151] block mb-2 flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-gray-500" />
                    Notes <span className="text-red-500 font-bold">*</span>
                  </label>
                  <textarea
                    placeholder="Add call notes..."
                    className={`w-full text-sm min-h-[80px] border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#16A34A] bg-white/80 backdrop-blur-sm resize-none transition-all duration-200 ${callErrors.notes ? 'border-red-500 bg-red-50 hover:border-red-500' : 'border-gray-200 hover:border-[#16A34A]'
                      }`}
                    value={callNote}
                    onChange={(e) => setCallNote(e.target.value)}
                  />
                  {callErrors.notes && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {callErrors.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowCallModal(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border transition-all duration-200 hover:bg-[#F3F4F6] hover:shadow-md"
                  style={{ borderColor: "#E5E7EB", color: "#374151", background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}
                >
                  <X className="w-4 h-4" />Cancel
                </button>
                <button
                  onClick={handleSaveCall}
                  disabled={!canSaveCall || callLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r from-[#16A34A] to-[#15803D] shadow-md"
                >
                  {callLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />Save Call
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ALL TAG MODAL ───────────────────────────────────────────────────── */}
      {showAllTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden relative">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Tags</h2>
                    <p className="text-sm text-gray-600">Create and manage tags for this lead</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAllTagModal(false)}
                  className="w-8 h-8 rounded-lg bg-white/50 hover:bg-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar min-h-0">

              {/* Available Tags Section */}
              <div className="space-y-4">
                <h3
                  onClick={() => setShowNewTagModal(true)}
                  className="text-sm font-semibold text-gray-900 flex items-center gap-2 cursor-pointer hover:text-green-600 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-green-600" />
                  Create New Tag
                </h3>

                {/* Available Tags Grid */}
                {availableTags.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-gray-600">Select from available tags:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {availableTags.map((tag) => (
                        <div
                          key={tag._id}
                          className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => {
                            if (selectedTags.includes(tag._id)) {
                              setSelectedTags(selectedTags.filter(id => id !== tag._id));
                            } else {
                              setSelectedTags([...selectedTags, tag._id]);
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag._id)}
                            onChange={() => { }}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <div
                            className="flex-1 px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: tag.bg_color,
                              color: tag.text_color
                            }}
                          >
                            {tag.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Tags Section */}
              {/* {lead.tag && lead.tag.length > 0 && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    Existing Tags
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {lead.tag.map((label) => (
                      <div 
                        key={label._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium group hover:shadow-sm transition-all"
                        style={{
                          backgroundColor: label.bg_color || "#F3F4F6",
                          borderColor: label.bg_color || "#D1D5DB",
                          color: label.text_color || "#374151"
                        }}
                      >
                        <span>{label.title}</span>
                        <button
                          onClick={() => handleDeleteTag(label._id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                          title="Delete tag"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {selectedTags.length > 0 && (
                    <span className="font-medium text-green-600">
                      {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAllTagModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSelectedTags}
                    disabled={tagLoading || selectedTags.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {tagLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-transparent animate-spin rounded-full"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Tag className="w-4 h-4" />
                        Add Selected Tags
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW TAG MODAL ───────────────────────────────────────────── */}
      {showNewTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Create New Tag</h2>
                    <p className="text-sm text-gray-600">Add a new tag to this lead</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewTagModal(false)}
                  className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tag Name</label>
                  <input
                    type="text"
                    value={tagTitle}
                    onChange={(e) => setTagTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    placeholder="Enter tag name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={tagTextColor}
                        onChange={(e) => setTagTextColor(e.target.value)}
                        className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={tagTextColor}
                        onChange={(e) => setTagTextColor(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={tagBgColor}
                        onChange={(e) => setTagBgColor(e.target.value)}
                        className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={tagBgColor}
                        onChange={(e) => setTagBgColor(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="#6B7280"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">Preview</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="px-3 py-1.5 rounded-full text-sm font-medium border"
                      style={{
                        backgroundColor: tagBgColor,
                        color: tagTextColor,
                        borderColor: tagBgColor
                      }}
                    >
                      {tagTitle || "Tag Name"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowNewTagModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTag}
                  disabled={tagLoading || !tagTitle.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {tagLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-transparent animate-spin rounded-full"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Tag className="w-4 h-4" />
                      Create Tag
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FOLLOW-UP MODAL ───────────────────────────────────────────── */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-base font-bold mb-4">{rescheduleMode ? "Reschedule Follow-up" : "Set Follow-up"}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Action Type</label>
                <div className="flex gap-2">
                  {["Call", "WhatsApp", "Meeting"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFuActionType(type)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${fuActionType === type ? "bg-[#16A34A] text-white border-[#16A34A]" : "bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F3F4F6]"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className="w-full h-9 text-sm border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    value={fuDate}
                    onChange={(e) => setFuDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    className="w-full h-9 text-sm border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    value={fuTime}
                    onChange={(e) => setFuTime(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Note (optional)</label>
                <textarea
                  placeholder="Why this follow-up?"
                  className="w-full text-sm min-h-[64px] border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] resize-none"
                  value={fuNote}
                  onChange={(e) => setFuNote(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Attachment (optional)</label>
                <div className="relative">
                  <input
                    type="file"
                    id="fu-attachment"
                    className="hidden"
                    onChange={(e) => setFuAttachment(e.target.files[0])}
                  />
                  <label
                    htmlFor="fu-attachment"
                    className="flex items-center gap-2 w-full h-9 text-sm border border-gray-300 rounded-md px-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "#E5E7EB" }}
                  >
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 truncate">
                      {fuAttachment ? fuAttachment.name : "Click to upload file"}
                    </span>
                    {fuAttachment && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFuAttachment(null);
                        }}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => { setShowFollowUpModal(false); setRescheduleMode(false); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border hover:bg-[#F3F4F6]"
                style={{ borderColor: "#E5E7EB", color: "#374151", background: "#fff" }}
              >
                <X className="w-4 h-4" />Cancel
              </button>
              <button
                onClick={handleSaveFollowUp}
                disabled={!canSaveFU || fuLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: "#2563EB" }}
              >
                {fuLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {rescheduleMode ? "Rescheduling..." : "Scheduling..."}
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4" />{rescheduleMode ? "Reschedule" : "Schedule"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WHATSAPP MODAL ──────────────────────────────────────────────── */}
      {showWAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                Send WhatsApp to {lead.name}
              </h2>
              <button
                onClick={() => setShowWAModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Radio Buttons */}
            <div className="w-full mx-auto mt-5 border border-gray-200 shadow-sm rounded-lg bg-white p-4 relative">
              <div className="absolute -top-3 left-4 bg-white px-2 text-sm text-blue-600 font-medium">
                Reply Type
              </div>

              <div className="flex space-x-6 mt-2 mb-3 text-sm text-gray-700">
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="replyType"
                    value="message"
                    checked={replyType === "message"}
                    onChange={(e) => setReplyType(e.target.value)}
                    className="form-radio text-blue-600"
                  />
                  <span>Message</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="replyType"
                    value="template"
                    checked={replyType === "template"}
                    onChange={(e) => setReplyType(e.target.value)}
                    className="form-radio text-blue-600"
                  />
                  <span>Template</span>
                </label>
              </div>
            </div>

            {/* Message Content */}
            {replyType === "message" && (
              <div className="mt-6 space-y-4">
                {/* <div>
                  <label className="text-sm font-medium block mb-1.5">Quick Templates</label>
                  <div className="flex flex-wrap gap-2">
                    {WA_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.label}
                        onClick={() => setWaMessage(tpl.text(lead.name.split(" ")[0]))}
                        className="px-3 py-1 rounded-full text-xs font-semibold border transition-colors hover:bg-[#F3F4F6]"
                        style={{ borderColor: "#E5E7EB", color: "#374151" }}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div> */}
                <div>
                  <label className="text-sm font-medium block mb-1.5">Message</label>
                  <textarea
                    className="w-full text-sm min-h-[100px] border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A] resize-none"
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    placeholder="Type your message..."
                  />
                  <p className="text-xs text-[#9CA3AF] text-right mt-1">{waMessage.length} chars</p>
                </div>
              </div>
            )}

            {/* Template Content */}
            {replyType === "template" && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">
                    Select a Template
                  </label>
                  {templateLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm text-gray-600">Loading templates...</span>
                    </div>
                  ) : (
                    <select
                      className="block w-full border border-gray-300 rounded-md p-2 mb-4"
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                      value={selectedTemplate?.id || selectedTemplate?._id || ""}
                    >
                      <option value="" disabled>
                        Select a template
                      </option>
                      {templates
                        .filter(
                          (template) => template.template_name
                        )
                        .map((template) => (
                          <option
                            key={template.id || template._id}
                            value={template.id || template._id}
                          >
                            {template.template_name}
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                {selectedTemplate && parsedTemplateData && (
                  <div className="mt-4">
                    {/* Template Parameters */}
                    <h4 className="font-medium mb-2">Template Parameters:</h4>

                    {/* Header Parameters */}
                    {parsedTemplateData.components
                      .filter((comp) => comp.type === "HEADER")
                      .map((comp, index) => {
                        const format = comp.format;

                        // For media headers (IMAGE, VIDEO, DOCUMENT), show file upload only
                        if (format !== "TEXT") {
                          return (
                            <div key={index} className="mb-4 mt-4">
                              <label className="block font-semibold mb-2">
                                Upload {format}
                              </label>
                              <div className="flex flex-col">
                                <input
                                  type="file"
                                  accept={
                                    format === "IMAGE"
                                      ? "image/*"
                                      : format === "VIDEO"
                                        ? "video/*"
                                        : format === "DOCUMENT"
                                          ? ".pdf,.doc,.docx,.xls,.xlsx"
                                          : undefined
                                  }
                                  ref={fileInputRef}
                                  onChange={(event) => handleFileChange(event, format)}
                                  className="hidden"
                                />
                                <button
                                  type="button"
                                  className="bg-blue-600 text-white px-4 py-2 rounded-md mb-2 flex items-center gap-2 hover:bg-blue-700 transition"
                                  onClick={triggerFileInput}
                                >
                                  Select File
                                </button>

                                {/* {headerMediaPreview && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                                    {format === "IMAGE" ? (
                                      <img
                                        src={headerMediaPreview.url}
                                        alt="Header preview"
                                        className="max-w-full h-auto rounded-lg border border-gray-300"
                                        style={{ maxHeight: "200px" }}
                                      />
                                    ) : format === "VIDEO" ? (
                                      <video
                                        src={headerMediaPreview.url}
                                        controls
                                        className="max-w-full rounded-lg border border-gray-300"
                                        style={{ maxHeight: "200px" }}
                                      />
                                    ) : (
                                      <div className="flex items-center gap-2 p-2 border border-gray-300 rounded">
                                        <FileText className="w-4 h-4" />
                                        <span className="text-sm">{headerMediaPreview.name}</span>
                                      </div>
                                    )}
                                  </div>
                                )} */}
                              </div>
                            </div>
                          );
                        }

                        // For TEXT headers only, show parameter fields
                        const headerText = comp.text || "";
                        const paramMatches = headerText.match(/\{\{(\d+)\}\}/g);

                        return paramMatches?.map((match, paramIndex) => {
                          const paramNum = match.replace(/\{\{(\d+)\}\}/, "$1");
                          const fieldName = `header_field_${paramNum}`;
                          let label = `Header value {{${paramNum}}}`;

                          if (comp.example?.header_text?.[0]?.[paramNum - 1]) {
                            label += ` (${comp.example.header_text[0][paramNum - 1]})`;
                          }

                          return (
                            <div key={`${index}-${paramIndex}`} className="mb-3">
                              <label className="block text-sm font-medium mb-1">
                                {label}
                              </label>
                              <select
                                className="block w-full border border-gray-300 rounded-md p-2"
                                value={templateParams[fieldName] || ""}
                                onChange={(e) =>
                                  handleParamChange(fieldName, e.target.value)
                                }
                              >
                                <option value="">Select an option</option>
                                {Object.entries(columnData).map(([key, label]) => (
                                  <option key={key} value={key}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        });
                      })}

                    {/* Body Parameters */}
                    {parsedTemplateData.components
                      .filter((comp) => comp.type === "BODY")
                      .map((comp, index) => {
                        const bodyText = comp.text || "";
                        const paramMatches = bodyText.match(/\{\{(\d+)\}\}/g);

                        return paramMatches?.map((match, paramIndex) => {
                          const paramNum = match.replace(/\{\{(\d+)\}\}/, "$1");
                          const fieldName = `field_${paramNum}`;
                          let label = `Body value {{${paramNum}}}`;

                          if (comp.example?.body_text?.[0]?.[paramNum - 1]) {
                            label += ` (${comp.example.body_text[0][paramNum - 1]})`;
                          }

                          return (
                            <div key={`${index}-${paramIndex}`} className="mb-3">
                              <label className="block text-sm font-medium mb-1">
                                {label}
                              </label>
                              <select
                                className="block w-full border border-gray-300 rounded-md p-2"
                                value={templateParams[fieldName] || ""}
                                onChange={(e) =>
                                  handleParamChange(fieldName, e.target.value)
                                }
                              >
                                <option value="">Select an option</option>
                                {Object.entries(columnData).map(([key, label]) => (
                                  <option key={key} value={key}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        });
                      })}

                    {/* Template preview */}
                    <h4 className="font-medium mb-2 mt-4">Template Preview:</h4>

                    {/* WhatsApp-style template preview */}
                    <div
                      className="p-5 rounded"
                      style={{
                        backgroundImage: `url(${whatsappImage})`,
                        backgroundColor: "#e5ddd5",
                        backgroundRepeat: "repeat",
                        backgroundSize: "contain",
                        backgroundBlendMode: "overlay",
                      }}
                    >
                      <div className="bg-[#f4f4f4] p-4 rounded-lg max-w-[90%] mx-2 my-2 relative shadow border border-[#e5ddd5]">
                        {parsedTemplateData.components?.map((comp, index) => {
                          switch (comp.type) {
                            case "HEADER":
                              const format = comp.format;

                              switch (format) {
                                case "TEXT":
                                  return (
                                    <div key={index} className="mb-2">
                                      <h6 className="font-bold text-[#3b4a54] text-sm">
                                        {comp.text}
                                      </h6>
                                    </div>
                                  );

                                case "IMAGE":
                                  return (
                                    <div
                                      key={index}
                                      className="mb-2 rounded-lg overflow-hidden"
                                    >
                                      <img
                                        src={headerMediaPreview?.url || templateParams?.header_image || placeholderImage}
                                        alt="Header"
                                        className="max-w-full h-auto"
                                      />
                                    </div>
                                  );

                                case "VIDEO":
                                  return (
                                    <div
                                      key={index}
                                      className="mb-2 rounded-lg overflow-hidden"
                                    >
                                      <video controls className="max-w-full">
                                        <source src={headerMediaPreview?.url || templateParams?.header_video} type="video/mp4" />
                                        Your browser does not support the video tag.
                                      </video>
                                    </div>
                                  );

                                case "DOCUMENT":
                                  return (
                                    <a
                                      key={index}
                                      href={headerMediaPreview?.url || templateParams?.header_document}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mb-2 block font-semibold text-sm text-[#075e54]"
                                    >
                                      📄 {comp.text || "Download File"}
                                    </a>
                                  );

                                default:
                                  return null;
                              }

                            case "BODY":
                              return (
                                <div key={index}>
                                  <p className="text-[#3b4a54] text-sm whitespace-pre-line leading-snug">
                                    {comp.text}
                                  </p>
                                </div>
                              );

                            case "BUTTONS":
                              return (
                                <div key={index} className="mt-3 w-full">
                                  {comp.buttons.map((btn, i) => {
                                    const isLink =
                                      btn.type === "URL" ||
                                      btn.type === "PHONE_NUMBER" ||
                                      btn.type === "COPY_CODE";

                                    if (isLink) {
                                      return (
                                        <a
                                          key={i}
                                          target=""
                                          rel="noopener noreferrer"
                                          className="block text-center bg-[#f4f4f4] py-2 px-3 text-sm font-medium text-sky-600 transition-colors mb-1"
                                        >
                                          {btn.text}
                                        </a>
                                      );
                                    }

                                    return (
                                      <button
                                        key={i}
                                        className="block text-center w-full py-1 bg-[#f4f4f4] px-3 text-sm font-medium text-sky-600 transition-colors mb-1"
                                      >
                                        {btn.text}
                                      </button>
                                    );
                                  })}
                                </div>
                              );

                            default:
                              return null;
                          }
                        })}

                        <div className="text-right text-[0.6875rem] text-[#667781] mt-2">
                          {new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Info */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 mt-6">
              <MessageCircle className="w-4 h-4 shrink-0" />
              Sending to <span className="font-semibold ml-1">{lead.phone}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowWAModal(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border hover:bg-[#F3F4F6]"
                style={{ borderColor: "#E5E7EB", color: "#374151", background: "#fff" }}
              >
                <X className="w-4 h-4" />Cancel
              </button>
              <button
                onClick={handleSendWA}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] transition-colors"
                disabled={
                  (replyType === "message" && !waMessage.trim()) ||
                  (replyType === "template" && !selectedTemplate)
                }
              >
                <Send className="w-4 h-4" />Send WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CHANGE STAGE MODAL ──────────────────────────────────────────── */}
      {showStageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-base font-bold mb-4">Change Stage</h2>
            <div className="space-y-3">
              {STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => setPendingStage(s)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${pendingStage === s ? "bg-[#EFF6FF] border-[#16A34A] text-[#16A34A]" : s === currentStage ? "bg-[#F0FDF4] border-[#16A34A] text-[#16A34A]" : "bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"}`}
                >
                  {s}
                  {s === currentStage && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Current</span>}
                  {pendingStage === s && s !== currentStage && <Check className="w-4 h-4 text-[#16A34A]" />}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowStageModal(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border hover:bg-[#F3F4F6]"
                style={{ borderColor: "#E5E7EB", color: "#374151", background: "#fff" }}
              >
                <X className="w-4 h-4" />Cancel
              </button>
              <button
                onClick={handleChangeStage}
                disabled={!pendingStage || pendingStage === currentStage}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: "#2563EB" }}
              >
                <ArrowRight className="w-4 h-4" />Move Stage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REASSIGN MODAL ──────────────────────────────────────────────── */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 flex flex-col max-h-[85vh] overflow-hidden">
            <h2 className="text-base font-bold mb-4 shrink-0">Reassign Lead</h2>
            <div className="space-y-4 flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
              <p className="text-sm text-[#6B7280]">Currently assigned to <span className="font-semibold text-[#111827]">{assignedAgent}</span></p>
              <div className="space-y-2 pt-1 pb-4">

                {usersLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#6B7280]" />
                    <span className="ml-2 text-sm text-[#6B7280]">Loading users...</span>
                  </div>
                ) : users.length > 0 ? (
                  users.map((user) => {
                    const userName = user.name || user;
                    const userId = user.id || user;
                    return (
                      <button
                        key={userId}
                        onClick={() => setPendingAgent(userName)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${pendingAgent === userName ? "bg-[#EFF6FF] border-[#16A34A] text-[#16A34A]" : userName === assignedAgent ? "bg-[#F3F4F6] border-[#E5E7EB] text-[#9CA3AF]" : "bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"}`}
                        disabled={userName === assignedAgent}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#16A34A] text-white text-xs flex items-center justify-center font-bold">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-left">{userName}</span>
                        </div>
                        {userName === assignedAgent && <span className="text-xs text-[#9CA3AF]">Current</span>}
                        {pendingAgent === userName && <Check className="w-4 h-4 text-[#16A34A]" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-[#6B7280]">No users available</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowReassignModal(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border hover:bg-[#F3F4F6]"
                style={{ borderColor: "#E5E7EB", color: "#374151", background: "#fff" }}
              >
                <X className="w-4 h-4" />Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={!pendingAgent}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: "#2563EB" }}
              >
                <UserCheck className="w-4 h-4" />Reassign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE CHANGE MODAL ─────────────────────────────────────────────── */}
      {showStageChangeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden shadow-2xl" style={{ boxShadow: "0px 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2563EB]/10 to-transparent rounded-full blur-2xl" />

            <div className="relative z-10">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ArrowUpDown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#111827]">Change Stage</h2>
                    <p className="text-xs text-[#6B7280]">Select new stage for this lead</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowStageChangeModal(false); setSelectedStage(""); }}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-[#374151] block mb-2">Select Stage</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {columns.map((column) => (
                      <button
                        key={column.id}
                        onClick={() => setSelectedStage(column.header_name)}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${selectedStage === column.header_name
                          ? "border-[#2563EB] bg-[#2563EB]/10"
                          : "border-[#E5E7EB] bg-white hover:bg-[#F3F4F6]"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#111827]">{column.header_name}</span>
                          {selectedStage === column.header_name && (
                            <Check className="w-4 h-4 text-[#2563EB]" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => { setShowStageChangeModal(false); setSelectedStage(""); }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border transition-all duration-200 hover:bg-[#F3F4F6] hover:shadow-md"
                  style={{ borderColor: "#E5E7EB", color: "#374151", background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}
                >
                  <X className="w-4 h-4" />Cancel
                </button>
                <button
                  onClick={handleStageChange}
                  disabled={!selectedStage || selectedStage === currentStage}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r from-[#16A34A] to-[#15803D] shadow-md"
                >
                  <Check className="w-4 h-4" />Update Stage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM FIELDS MODAL ───────────────────────────────────────────── */}
      {showCustomFieldsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-xl w-full mx-4 relative shadow-2xl flex flex-col max-h-[85vh]" style={{ boxShadow: "0px 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 rounded-2xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Modal header */}
            <div className="relative z-10 flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111827]">Custom Fields</h2>
                  <p className="text-xs text-[#6B7280]">Select fields to display or update</p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomFieldsModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Scrollable body content */}
            <div className="relative z-10 flex-1 overflow-y-auto pr-2 min-h-0 custom-scrollbar">
              <div className="space-y-4">
                {fieldsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-3 text-sm text-gray-600 font-medium">Fetching fields...</span>
                  </div>
                ) : customFields.length > 0 ? (
                  <div className="space-y-3 pb-2">
                    {customFields.map((field) => (
                      <div
                        key={field.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${selectedFieldIds.includes(field.id)
                          ? "border-blue-500 bg-blue-50/50 shadow-sm"
                          : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                          }`}
                        onClick={() => {
                          const isSelected = selectedFieldIds.includes(field.id);
                          const newSelection = isSelected
                            ? selectedFieldIds.filter(id => id !== field.id)
                            : [...selectedFieldIds, field.id];
                          setSelectedFieldIds(newSelection);
                        }}
                      >
                        <div className="flex flex-col gap-3 w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">{field.name}</span>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedFieldIds.includes(field.id)
                              ? "bg-blue-600 border-blue-600 shadow-sm"
                              : "border-gray-300 bg-white"
                              }`}>
                              {selectedFieldIds.includes(field.id) && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                            </div>
                          </div>
                          {selectedFieldIds.includes(field.id) && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                              <input
                                autoFocus
                                type={field.dataType === 'number' ? 'number' : field.dataType === 'date' ? 'date' : 'text'}
                                className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
                                placeholder={`Enter ${field.name}`}
                                value={fieldValues[field.id] || ""}
                                onChange={(e) => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No custom fields found</p>
                    <p className="text-xs text-gray-400 mt-1">Fields you create will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="relative z-10 flex gap-3 mt-8 shrink-0 border-t pt-6 border-gray-100">
              <button
                onClick={() => setShowCustomFieldsModal(false)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border transition-all duration-200 hover:bg-[#F3F4F6] hover:shadow-md"
                style={{ borderColor: "#E5E7EB", color: "#374151", background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}
              >
                <X className="w-4 h-4" />Cancel
              </button>
              <button
                onClick={handleUpdateCustomFields}
                disabled={fieldsLoading || customFields.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md"
              >
                <Check className="w-4 h-4" />Update
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── TOAST ───────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

    </div>
  );
}