import React, { useState, useEffect } from "react";
import {
  Phone,
  MessageCircle,
  StickyNote,
  CalendarPlus,
  AlertCircle,
  Clock,
  Flame,
  Globe,
  Facebook,
  ChevronRight,
  ChevronLeft,
  Plus,
  MoreHorizontal,
  GripVertical,
  X,
  CheckCircle2,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
  Send,
  User,
  ChevronDown,
  ChevronUp,
  Filter,
  Loader2,
  Paperclip,
  RefreshCw,
  Trash2,
  LayoutGrid,
  Lock,
  Pencil,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const BASE_URI = import.meta.env.VITE_BASE_URI;
// const vendor_uid = localStorage.getItem('vendor_uid');
// const user_id = localStorage.getItem('user_id');

const VENDOR_ID = localStorage.getItem('vendor_id');
const USER_ID = localStorage.getItem('user_id');

// ─── TYPES ────────────────────────────────────────────────────────────────────
// Priority: "Hot" | "Warm" | "Cold"
// Source: "WhatsApp" | "Website" | "Facebook"
// FollowUpState: "set" | "overdue" | "missing"
// ModalType: "call" | "whatsapp" | "note" | "followup" | "addlead" | "stageconfirm" | null

// ─── INITIAL STATE (kept as placeholder; API data replaces on load) ──────────

const STAGES_FALLBACK = ["New Lead", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won"];

// Map a raw API record → LeadCard-compatible shape
function mapApiLead(item) {
  const firstName = (item.first_name || "").trim();
  const lastName = (item.last_name || "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "—";
  console.log(`item.labels${item.labels}`);
  return {
    id: item._id,
    uid: item._uid,
    name: fullName,
    phone: item.wa_id ? "+" + item.wa_id : "—",
    // Normalise source: "whatsappchat" / "whatsapp" → "WhatsApp", etc.
    source: (() => {
      const s = (item.created_from_source || "").toLowerCase();
      if (s.includes("whatsapp")) return "WhatsApp";
      if (s.includes("facebook")) return "Facebook";
      if (s.includes("website")) return "Website";
      return "WhatsApp"; // default
    })(),
    // Normalise priority: maintain Low/Medium/High fallback correctly
    priority: (() => {
      const p = (item.priority || "").toLowerCase();
      if (p === "high" || p === "hot") return "High";
      if (p === "low" || p === "cold") return "Low";
      return "Medium"; // Warm or anything else
    })(),
    lastActivity: item.created_from_source || "—",
    overDueCount: item.overDueCount,
    lastActivityTime: item.leadscreated_at
      ? new Date(item.leadscreated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "—",
    followUp: { state: "missing", label: "" },
    score: item.lead_score || 0,
    tags: item.labels || [],
    isNew: false,
    _status: item.lead_status || item.status || "",
  };
}

// ─── MODAL OVERLAY ─────────────────────────────────────────────────────────────

function ModalOverlay({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(17,24,39,0.45)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full mx-4"
        style={{ maxWidth: 480, boxShadow: "0px 20px 60px rgba(0,0,0,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "#E5E7EB" }}>
      <div>
        <h2 className="text-base font-bold text-[#111827]">{title}</h2>
        {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>
      <button
        onClick={onClose}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#374151] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function FormLabel({ children }) {
  return <label className="block text-xs font-semibold text-[#374151] mb-1">{children}</label>;
}

function SuccessToast({ message }) {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#111827] text-white text-sm font-medium shadow-xl">
      <CheckCircle2 className="w-4 h-4 text-green-400" />
      {message}
    </div>
  );
}

// ─── CALL MODAL ───────────────────────────────────────────────────────────────

function CallModal({ lead, onClose, onSave }) {
  const [status, setStatus] = useState("connected");
  const [followupDate, setFollowupDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const canSave = status !== "" && notes.trim() !== "";

  // Validation errors
  const errors = {
    status: status === "" ? "Call status is required" : "",
    notes: notes.trim() === "" ? "Notes are required" : ""
  };

  const statusOptions = [
    { value: "Connected", label: "Connected", icon: <PhoneCall className="w-4 h-4" />, color: "#16A34A" },
    { value: "No Answer", label: "No Answer", icon: <PhoneMissed className="w-4 h-4" />, color: "#F59E0B" },
    { value: "Busy", label: "Busy", icon: <PhoneOff className="w-4 h-4" />, color: "#DC2626" },
  ];

  const handleSave = async () => {
    if (!canSave) return;

    setLoading(true);

    const callData = {
      leadId: lead.id,
      status: status,
      follow_up_date: followupDate || null,
      notes: notes || "",
      userId: USER_ID
    };

    try {
      const response = await fetch(`${BASE_URI}/api/add-lead-calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(callData)
      });

      const data = await response.json();
      if (data.status === true) {
        onSave("Call logged successfully");
      } else {
        alert(data.message || "Failed to log call");
      }
    } catch (error) {
      console.error("Error logging call:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Log Call" subtitle={`${lead.name} · ${lead.phone}`} onClose={onClose} />
      <div className="px-6 py-4 space-y-4">
        {/* Call Status */}
        <div>
          <FormLabel>
            <span className="flex items-center gap-2">
              Call Status
              <span className="text-red-500 font-bold">*</span>
            </span>
          </FormLabel>
          <div className="grid grid-cols-3 gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${errors.status ? 'border-red-300 bg-red-50' : ''
                  }`}
                style={{
                  borderColor: status === opt.value ? opt.color : errors.status ? "#FCA5A5" : "#E5E7EB",
                  background: status === opt.value ? `${opt.color}10` : errors.status ? "#FEF2F2" : "#fff",
                  color: status === opt.value ? opt.color : errors.status ? "#DC2626" : "#6B7280",
                }}
              >
                <span style={{ color: status === opt.value ? opt.color : errors.status ? "#DC2626" : "#9CA3AF" }}>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
          {errors.status && (
            <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.status}
            </p>
          )}
        </div>

        {/* Follow-up Date */}
        <div>
          <FormLabel>Follow-up Date</FormLabel>
          <input
            type="date"
            className="w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none focus:border-[#2563EB] transition-colors"
            style={{ borderColor: "#E5E7EB" }}
            value={followupDate}
            onChange={(e) => setFollowupDate(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <FormLabel>
            <span className="flex items-center gap-2">
              Notes
              <span className="text-red-500 font-bold">*</span>
            </span>
          </FormLabel>
          <textarea
            className={`w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none resize-none transition-colors ${errors.notes ? 'border-red-500 bg-red-50 focus:border-red-500' : 'focus:border-[#2563EB]'
              }`}
            style={{ borderColor: errors.notes ? "#FCA5A5" : "#E5E7EB" }}
            rows={3}
            placeholder="Add call notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {errors.notes && (
            <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.notes}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-6 pb-5">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-[#374151] border hover:bg-[#F9FAFB] transition-colors"
          style={{ borderColor: "#E5E7EB" }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave || loading}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all flex items-center gap-2"
          style={{
            background: canSave && !loading ? "#2563EB" : "#D1D5DB",
            cursor: canSave && !loading ? "pointer" : "not-allowed",
          }}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            "Save Call Log"
          )}
        </button>
      </div>
    </ModalOverlay>
  );
}

// ─── WHATSAPP MODAL ─────────────────────────────────────────────────────────--

function WhatsAppModal({ lead, onClose, onSave }) {
  const templates = [
    "Hi {name}, this is a follow-up regarding your inquiry. Are you still interested?",
    "Hello {name}! Just checking in – would you like to schedule a quick call?",
    "Hi {name}, I wanted to share more details about our offer. When's a good time?",
  ];
  const [message, setMessage] = useState(templates[0].replace("{name}", lead.name.split(" ")[0]));

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Send WhatsApp" subtitle={`${lead.name} · ${lead.phone}`} onClose={onClose} />
      <div className="px-6 py-4 space-y-4">
        {/* Templates */}
        <div>
          <FormLabel>Quick Templates</FormLabel>
          <div className="space-y-2">
            {templates.map((t, i) => {
              const filled = t.replace("{name}", lead.name.split(" ")[0]);
              return (
                <button
                  key={i}
                  onClick={() => setMessage(filled)}
                  className="w-full text-left px-3 py-2.5 rounded-xl border text-xs text-[#374151] leading-relaxed transition-all hover:border-[#2563EB] hover:bg-[#EFF6FF]"
                  style={{ borderColor: message === filled ? "#2563EB" : "#E5E7EB", background: message === filled ? "#EFF6FF" : "#fff" }}
                >
                  {filled}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message composer */}
        <div>
          <FormLabel>Message</FormLabel>
          <textarea
            className="w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none focus:border-[#2563EB] resize-none transition-colors"
            style={{ borderColor: "#E5E7EB" }}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className="text-[11px] text-[#9CA3AF] mt-1">{message.length} characters</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-6 pb-5">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-[#374151] border hover:bg-[#F9FAFB] transition-colors"
          style={{ borderColor: "#E5E7EB" }}
        >
          Cancel
        </button>
        <button
          onClick={() => message.trim() && onSave("WhatsApp message sent")}
          disabled={!message.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: message.trim() ? "#16A34A" : "#D1D5DB", cursor: message.trim() ? "pointer" : "not-allowed" }}
        >
          <Send className="w-3.5 h-3.5" />
          Send Message
        </button>
      </div>
    </ModalOverlay>
  );
}

// ─── NOTE MODAL ─────────────────────────────────────────────────────────────--

function NoteModal({ lead, onClose, onSave }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const canSave = note.trim() !== "";
  const error = note.trim() === "" ? "Note is required" : "";

  const handleSave = async () => {
    if (!canSave) return;

    setLoading(true);

    const noteData = {
      leadId: lead.id,
      vendorId: VENDOR_ID,
      userId: USER_ID,
      notes: note.trim()
    };

    try {
      const response = await fetch(`${BASE_URI}/api/add-lead-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(noteData)
      });

      const data = await response.json();
      if (data.status === true) {
        onSave("Note saved successfully");
      } else {
        alert(data.message || "Failed to save note");
      }
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Add Note" subtitle={lead.name} onClose={onClose} />
      <div className="px-6 py-4">
        <FormLabel>
          <span className="flex items-center gap-2">
            Note
            <span className="text-red-500 font-bold">*</span>
          </span>
        </FormLabel>
        <textarea
          className={`w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none resize-none transition-colors ${error ? 'border-red-500 bg-red-50 focus:border-red-500' : 'focus:border-[#2563EB]'
            }`}
          style={{ borderColor: error ? "#FCA5A5" : "#E5E7EB" }}
          rows={5}
          placeholder="Write a note about this lead..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoFocus
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-[11px] text-[#9CA3AF]">{note.length} characters</p>
          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-6 pb-5">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-[#374151] border hover:bg-[#F9FAFB] transition-colors"
          style={{ borderColor: "#E5E7EB" }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave || loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{
            background: canSave && !loading ? "#2563EB" : "#D1D5DB",
            cursor: canSave && !loading ? "pointer" : "not-allowed"
          }}
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <StickyNote className="w-3.5 h-3.5" />
              Save Note
            </>
          )}
        </button>
      </div>
    </ModalOverlay>
  );
}

// ─── FOLLOW-UP MODAL ────────────────────────────────────────────────────────

function FollowUpModal({ lead, onClose, onSave }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [actionType, setActionType] = useState("Call");
  const [reason, setReason] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);

  const canSave = date !== "" && time !== "";

  const errors = {
    date: date === "" ? "Date is required" : "",
    time: time === "" ? "Time is required" : ""
  };

  const handleSave = async () => {
    if (!canSave) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('leadId', lead.id);
    formData.append('date', date);
    formData.append('title', actionType); // Action Type becomes title
    formData.append('time', time || '');
    formData.append('note', reason || '');
    formData.append('userId', USER_ID);

    // Only append attachment if a file is selected
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      const response = await fetch(`${BASE_URI}/api/add-lead-followup`, {
        method: "POST",
        body: formData // Don't set Content-Type header for FormData
      });

      const data = await response.json();
      if (data.status === true) {
        onSave("Follow-up scheduled successfully");
      } else {
        alert(data.message || "Failed to schedule follow-up");
      }
    } catch (error) {
      console.error("Error scheduling follow-up:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    // Reset the file input
    const fileInput = document.getElementById('followup-attachment');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Set Follow-up" subtitle={lead.name} onClose={onClose} />
      <div className="px-6 py-4 space-y-4">
        {/* Action type */}
        <div>
          <FormLabel>Action Type</FormLabel>
          <div className="grid grid-cols-2 gap-2">
            {(["Call", "WhatsApp"]).map((type) => (
              <button
                key={type}
                onClick={() => setActionType(type)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
                style={{
                  borderColor: actionType === type ? "#2563EB" : "#E5E7EB",
                  background: actionType === type ? "#EFF6FF" : "#fff",
                  color: actionType === type ? "#2563EB" : "#6B7280",
                }}
              >
                {type === "Call" ? <Phone className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FormLabel>
              <span className="flex items-center gap-2">
                Date <span className="text-red-500 font-bold">*</span>
              </span>
            </FormLabel>
            <input
              type="date"
              className={`w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none transition-colors ${errors.date ? 'border-red-500 bg-red-50 focus:border-red-500' : 'focus:border-[#2563EB]'
                }`}
              style={{ borderColor: errors.date ? "#FCA5A5" : "#E5E7EB" }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.date}
              </p>
            )}
          </div>
          <div>
            <FormLabel>
              <span className="flex items-center gap-2">
                Time <span className="text-red-500 font-bold">*</span>
              </span>
            </FormLabel>
            <input
              type="time"
              className={`w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none transition-colors ${errors.time ? 'border-red-500 bg-red-50 focus:border-red-500' : 'focus:border-[#2563EB]'
                }`}
              style={{ borderColor: errors.time ? "#FCA5A5" : "#E5E7EB" }}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            {errors.time && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.time}
              </p>
            )}
          </div>
        </div>

        {/* Reason */}
        <div>
          <FormLabel>Reason / Notes</FormLabel>
          <textarea
            className="w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none focus:border-[#2563EB] resize-none transition-colors"
            style={{ borderColor: "#E5E7EB" }}
            rows={3}
            placeholder="Why is this follow-up needed?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Attachment */}
        <div>
          <FormLabel>Attachment</FormLabel>
          <div className="space-y-2">
            <input
              type="file"
              id="followup-attachment"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            />
            <label
              htmlFor="followup-attachment"
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-[#2563EB] hover:bg-[#F8FAFC]"
              style={{ borderColor: "#E5E7EB" }}
            >
              <Paperclip className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {attachment ? attachment.name : "Click to upload file"}
              </span>
            </label>
            {attachment && (
              <button
                onClick={clearAttachment}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors"
              >
                <X className="w-3 h-3" />
                Remove file
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-6 pb-5">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-[#374151] border hover:bg-[#F9FAFB] transition-colors"
          style={{ borderColor: "#E5E7EB" }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave || loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{
            background: canSave && !loading ? "#2563EB" : "#D1D5DB",
            cursor: canSave && !loading ? "pointer" : "not-allowed"
          }}
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Scheduling...
            </>
          ) : (
            <>
              <CalendarPlus className="w-3.5 h-3.5" />
              Schedule
            </>
          )}
        </button>
      </div>
    </ModalOverlay>
  );
}

// ─── ADD LEAD MODAL ─────────────────────────────────────────────────────────--

function AddLeadModal({ onClose, onSave, stageOptions = [], sourceOptions = [], priorityOptions = [], initialStage }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  const COUNTRY_CODES = [
    { code: "+91", flag: "🇮🇳", name: "IN" },
    { code: "+1", flag: "🇺🇸", name: "US" },
    { code: "+44", flag: "🇬🇧", name: "GB" },
    { code: "+61", flag: "🇦🇺", name: "AU" },
    { code: "+971", flag: "🇦🇪", name: "AE" },
    { code: "+966", flag: "🇸🇦", name: "SA" },
    { code: "+65", flag: "🇸🇬", name: "SG" },
    { code: "+60", flag: "🇲🇾", name: "MY" },
    { code: "+880", flag: "🇧🇩", name: "BD" },
    { code: "+92", flag: "🇵🇰", name: "PK" },
    { code: "+63", flag: "🇵🇭", name: "PH" },
    { code: "+49", flag: "🇩🇪", name: "DE" },
    { code: "+33", flag: "🇫🇷", name: "FR" },
    { code: "+81", flag: "🇯🇵", name: "JP" },
    { code: "+86", flag: "🇨🇳", name: "CN" },
  ];
  const [source, setSource] = useState(typeof sourceOptions[0] === 'string' ? sourceOptions[0] : (sourceOptions[0]?.name || "whatsappchat"));
  const [score, setScore] = useState("");
  const [stage, setStage] = useState(initialStage?.id || stageOptions[0]?.id || "90");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getScoreLevel = (val) => {
    const n = Number(val);
    if (val === "" || isNaN(n)) return null;
    if (n < 30) return { label: "Low", bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" };
    if (n < 60) return { label: "Medium", bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" };
    return { label: "High", bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" };
  };

  const validatePhone = (p) => /^[0-9]{10}$/.test(p.replace(/[^0-9]/g, ''));

  const canSave = name.trim() !== "" && phone.trim() !== "" && validatePhone(phone) && !isLoading;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Full name is required");
      return;
    }

    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    if (!validatePhone(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URI}/api/add-lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          vendorId: VENDOR_ID,
          userId: USER_ID,
          full_name: name.trim(),
          phone: `${countryCode.replace('+', '')}${phone.replace(/[^0-9]/g, '')}`,
          source: source.toLowerCase(),
          score: score !== "" ? Number(score) : 0,
          stage: stage
        })
      });

      const data = await response.json();

      if (data.status === true) {
        onSave(`Lead created successfully with ID: ${data.lead_id}`, true); // Pass true to indicate refresh needed
      } else {
        setError(data.message || "Failed to create lead");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'name') setName(value);
    if (field === 'phone') setPhone(value);
    if (field === 'source') setSource(value);
    if (field === 'score') setScore(value);
    if (field === 'stage') setStage(value);
    setError("");
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Add New Lead" onClose={onClose} />
      <div className="px-6 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FormLabel>Full Name *</FormLabel>
            <input
              className={`w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none transition-colors ${error && error.toLowerCase().includes('name') ? "border-red-500 focus:border-red-500" : "focus:border-[#2563EB]"
                }`}
              style={{ borderColor: error && error.toLowerCase().includes('name') ? "#EF4444" : "#E5E7EB" }}
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              autoFocus
              disabled={isLoading}
            />
          </div>
          <div>
            <FormLabel>Phone *</FormLabel>
            <div
              className="flex rounded-lg border overflow-hidden transition-colors"
              style={{ borderColor: error && error.toLowerCase().includes('phone') ? "#EF4444" : "#E5E7EB" }}
            >
              {/* Country code picker */}
              <div className="relative flex-shrink-0">
                <select
                  className="h-full pl-2 pr-6 py-2 text-sm font-semibold text-[#374151] bg-[#F9FAFB] border-r outline-none appearance-none cursor-pointer hover:bg-[#F3F4F6] transition-colors"
                  style={{ borderColor: "#E5E7EB" }}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={isLoading}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-[#9CA3AF] pointer-events-none" />
              </div>
              {/* 10-digit number */}
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className="flex-1 px-3 py-2 text-sm text-[#111827] outline-none bg-white"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => handleInputChange('phone', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                disabled={isLoading}
              />
              {phone.length > 0 && (
                <span className={`flex items-center pr-2 text-xs font-semibold ${phone.length === 10 ? 'text-green-500' : 'text-gray-400'
                  }`}>
                  {phone.length}/10
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Source */}
          <div>
            <FormLabel>Source</FormLabel>
            <div className="relative">
              <select
                className="w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none focus:border-[#2563EB] appearance-none bg-white transition-colors"
                style={{ borderColor: "#E5E7EB" }}
                value={source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                disabled={isLoading}
              >
                {sourceOptions.length > 0
                  ? sourceOptions.map((s) => <option key={typeof s === 'string' ? s : (s.id || s.name)} value={typeof s === 'string' ? s : (s.name || s)}>{typeof s === 'string' ? s : (s.name || s)}</option>)
                  : <option value="">Loading…</option>
                }
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>

          {/* Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FormLabel style={{ marginBottom: 0 }}>Score</FormLabel>
              {(() => {
                const lvl = getScoreLevel(score);
                return lvl ? (
                  <span
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: lvl.bg, color: lvl.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: lvl.dot }} />
                    {lvl.label}
                  </span>
                ) : null;
              })()}
            </div>
            <input
              type="number"
              className="w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none focus:border-[#2563EB] transition-colors"
              style={{ borderColor: "#E5E7EB" }}
              placeholder="e.g. 80"
              value={score}
              onChange={(e) => handleInputChange('score', e.target.value)}
              disabled={isLoading}
              min="0"
            />
          </div>

          {/* Stage */}
          <div>
            <FormLabel>Stage</FormLabel>
            <div className="relative">
              <select
                className="w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none focus:border-[#2563EB] appearance-none bg-white transition-colors"
                style={{ borderColor: "#E5E7EB" }}
                value={stage}
                onChange={(e) => handleInputChange('stage', e.target.value)}
                disabled={isLoading}
              >
                {stageOptions.length > 0
                  ? stageOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
                  : <option value="">Loading…</option>
                }
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 px-6 pb-5">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-[#374151] border hover:bg-[#F9FAFB] transition-colors"
          style={{ borderColor: "#E5E7EB" }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-white transition-all"
          style={{
            background: canSave ? "#2563EB" : "#D1D5DB",
            cursor: canSave ? "pointer" : "not-allowed",
          }}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding...
            </div>
          ) : (
            <>
              <User className="w-3.5 h-3.5" />
              Add Lead
            </>
          )}
        </button>
      </div>
    </ModalOverlay>
  );
}

// ─── STAGE CONFIRM MODAL ─────────────────────────────────────────────────────

function StageConfirmModal({
  stages,
  fromStage,
  toStage,
  lead,
  onConfirm,
  onClose,
}) {
  const skipped = stages.slice(stages.indexOf(fromStage) + 1, stages.indexOf(toStage));
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Skip Stage?" subtitle={lead.name} onClose={onClose} />
      <div className="px-6 py-4 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F3F4F6] text-[#374151]">{fromStage}</span>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB]">{toStage}</span>
        </div>
        <p className="text-sm text-[#374151]">
          You are skipping <strong>{skipped.length}</strong> stage{skipped.length !== 1 ? "s" : ""}:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {skipped.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200 font-medium">
              {s}
            </span>
          ))}
        </div>
        <p className="text-xs text-[#6B7280]">Are you sure you want to move this lead directly to <strong>{toStage}</strong>?</p>
      </div>
      <div className="flex items-center justify-end gap-2 px-6 pb-5">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-[#374151] border hover:bg-[#F9FAFB] transition-colors"
          style={{ borderColor: "#E5E7EB" }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors"
        >
          Yes, Move Lead
        </button>
      </div>
    </ModalOverlay>
  );
}

// ─── ADD STAGE MODAL ─────────────────────────────────────────────────────────

function AddStageModal({ onClose, onSave }) {
  const [stageName, setStageName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canSave = stageName.trim() !== "" && !isLoading;

  const handleSubmit = async () => {
    if (!stageName.trim()) {
      setError("Stage name is required");
      return;
    }

    if (stageName.trim().length < 2) {
      setError("Stage name must be at least 2 characters");
      return;
    }

    if (stageName.trim().length > 50) {
      setError("Stage name must be less than 50 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URI}/api/add-menus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          header_name: stageName.trim(),
          vendorId: VENDOR_ID,
          userId: USER_ID
        })
      });

      const data = await response.json();

      if (data.status === "success") {
        onSave(stageName.trim(), data.data, true); // Pass true to indicate refresh needed
      } else {
        setError(data.message || "Failed to create stage");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setStageName(e.target.value);
    setError("");
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Add New Stage" onClose={onClose} />
      <div className="px-6 py-5">
        <FormLabel>Stage Name *</FormLabel>
        <input
          className={`w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none transition-colors ${error ? "border-red-500 focus:border-red-500" : "focus:border-[#2563EB]"
            }`}
          style={{ borderColor: error ? "#EF4444" : "#E5E7EB" }}
          placeholder="e.g. Qualified, Negotiation…"
          value={stageName}
          onChange={handleInputChange}
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && canSave && handleSubmit()}
          disabled={isLoading}
        />
        {error && (
          <div className="mt-2 flex items-center gap-2 text-red-600 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        )}
        <div className="mt-2 text-xs text-gray-500">
          {stageName.length}/50 characters
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-6 pb-5">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-[#374151] border hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: "#E5E7EB" }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSave}
          className="px-4 py-2 rounded-md text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: canSave ? "linear-gradient(135deg,#2563EB 0%,#1d4ed8 100%)" : "#D1D5DB",
            cursor: canSave ? "pointer" : "not-allowed",
          }}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding...
            </div>
          ) : (
            "Add Stage"
          )}
        </button>
      </div>
    </ModalOverlay>
  );
}

function DeleteStageModal({ stage, onClose, onSave }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URI}/api/deleteStage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          stageId: stage.id,
          vendorId: VENDOR_ID
        })
      });

      const data = await response.json();
      if (data.status === "success" || data.status === true) {
        onSave(`Stage "${stage.name}" and all internal leads deleted permanently`, true);
      } else {
        alert(data.message || "Failed to delete stage");
      }
    } catch (error) {
      console.error("Error deleting stage:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Delete Stage" onClose={onClose} />
      <div className="px-6 py-6 space-y-4">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-[#111827]">
            Delete stage "{stage.name}"?
          </p>
          <p className="text-xs text-red-600 font-semibold mt-2 px-4">
            Warning: This will delete the stage and all leads inside it permanently.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-6 pb-5">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-[#374151] border hover:bg-[#F9FAFB] transition-colors"
          style={{ borderColor: "#E5E7EB" }}
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete Stage & Leads"
          )}
        </button>
      </div>
    </ModalOverlay>
  );
}

function DeleteLeadModal({ lead, onClose, onSave }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URI}/api/deleteLead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          leadId: lead.id,
          vendorId: VENDOR_ID
        })
      });

      const data = await response.json();
      if (data.status === "success" || data.status === true) {
        onSave(`${lead.name} deleted successfully`, true);
      } else {
        alert(data.message || "Failed to delete lead");
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Delete Lead" onClose={onClose} />
      <div className="px-6 py-6 space-y-4">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <div className="text-center">
          <p className="text-sm text-[#374151]">
            Are you sure you want to delete <strong>{lead.name}</strong>?
          </p>
          <p className="text-xs text-[#6B7280] mt-2">
            This action cannot be undone. All data associated with this lead will be permanently removed.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-6 pb-5">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-[#374151] border hover:bg-[#F9FAFB] transition-colors"
          style={{ borderColor: "#E5E7EB" }}
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete Lead"
          )}
        </button>
      </div>
    </ModalOverlay>
  );
}

// ─── CUSTOM FIELD MODAL ──────────────────────────────────────────────────────

function CustomFieldModal({ onClose }) {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [fields, setFields] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    fetchCustomFields();
  }, []);

  const fetchCustomFields = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URI}/api/listLeadCustomFields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: VENDOR_ID })
      });
      const data = await response.json();
      if (data.status && Array.isArray(data.data)) {
        setFields(data.data);
      }
    } catch (error) {
      console.error("Error fetching custom fields:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddField = async () => {
    if (!fieldName.trim()) {
      alert("Field Name is required");
      return;
    }

    setIsAdding(true);
    try {
      const url = editingField ? `${BASE_URI}/api/updateLeadCustomFields` : `${BASE_URI}/api/addLeadCustomFields`;
      const body = {
        vendorId: VENDOR_ID,
        lead_custom_field_name: fieldName.trim(),
        dataType: fieldType.toLowerCase()
      };

      if (editingField) {
        body.id = editingField.id || editingField._id;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (data.status) {
        setFieldName("");
        setFieldType("text");
        setEditingField(null);
        fetchCustomFields();
      } else {
        alert(data.message || `Failed to ${editingField ? 'update' : 'add'} field`);
      }
    } catch (error) {
      console.error(`Error ${editingField ? 'updating' : 'adding'} custom field:`, error);
      alert("Network error. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditClick = (field) => {
    setEditingField(field);
    setFieldName(field.lead_custom_field_name || field.name || "");
    setFieldType(field.dataType || field.type || "text");
  };

  const cancelEdit = () => {
    setEditingField(null);
    setFieldName("");
    setFieldType("text");
  };

  const handleDeleteField = async (id) => {
    if (!window.confirm("Are you sure you want to delete this field?")) return;
    try {
      const response = await fetch(`${BASE_URI}/api/deleteLeadCustomFields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: VENDOR_ID, fieldId: id })
      });
      const data = await response.json();
      if (data.status) {
        fetchCustomFields();
      }
    } catch (error) {
      console.error("Error deleting field:", error);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Custom Fields" onClose={onClose} />

      <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {/* Add/Edit Field Section */}
        <div className="p-5 bg-[#F9FAFB] border border-gray-200 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#111827]">{editingField ? "Update Custom Field" : "Create New Custom Field"}</h4>
            {editingField && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded italic">Editing mode</span>
                <button
                  onClick={cancelEdit}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                  title="Cancel Edit"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-tight">Field Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g. plan_type"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="w-full h-10 px-3 text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm bg-white"
                disabled={isAdding}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-tight">Data Type</label>
              <div className="relative">
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 text-sm border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm"
                  disabled={isAdding}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="md:col-span-3">
              <button
                onClick={handleAddField}
                disabled={isAdding || !fieldName.trim()}
                className={`w-full flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg text-white text-sm font-bold transition-all shadow-sm disabled:opacity-50 ${editingField ? "bg-blue-600 hover:bg-blue-700 ring-offset-1 focus:ring-2 ring-blue-500" : "bg-[#067252] hover:bg-[#055d43] ring-offset-1 focus:ring-2 ring-[#067252]"}`}
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : editingField ? (
                  <RefreshCw className="w-4 h-4 text-white" />
                ) : (
                  <Plus className="w-4 h-4 text-white" />
                )}
                {editingField ? "Update" : "Add Field"}
              </button>
            </div>
          </div>
        </div>

        {/* Fields List Table */}
        <div className="border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F9FAFB] border-b">
              <tr>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Field Name</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan="2" className="px-4 py-8 text-center text-xs text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading custom fields...
                  </td>
                </tr>
              ) : fields.length === 0 ? (
                <tr>
                  <td colSpan="2" className="px-4 py-8 text-center text-xs text-gray-500 italic">
                    No custom fields added yet.
                  </td>
                </tr>
              ) : (
                fields.map((field) => (
                  <tr key={field.id || field._id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">
                      {field.lead_custom_field_name || field.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#4B5563] capitalize">
                      {field.dataType || field.type}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(field)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Field"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteField(field.id || field._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Field"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-6 py-2 border rounded-lg text-sm font-bold text-[#374151] hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </ModalOverlay>
  );
}

// ─── PRIORITY FILTER MODAL ──────────────────────────────────────────────────

function PriorityFilterModal({ currentFilter, onSelect, onClose }) {
  const options = [
    { label: "All Priorities", value: "all" },
    { label: "Hot (High)", value: "High" },
    { label: "Warm (Medium)", value: "Medium" },
    { label: "Cold (Low)", value: "Low" },
  ];

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Filter by Priority" onClose={onClose} />
      <div className="px-6 py-4 space-y-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { onSelect(opt.value); onClose(); }}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${currentFilter === opt.value
              ? "border-[#EA580C] bg-[#FFF7ED] text-[#EA580C]"
              : "border-gray-100 hover:bg-gray-50 text-gray-700"
              }`}
          >
            <div className="flex items-center justify-between">
              <span>{opt.label}</span>
              {currentFilter === opt.value && (
                <CheckCircle2 className="w-4 h-4 text-[#EA580C]" />
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="px-6 pb-6 pt-2 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 border rounded-lg text-sm font-bold text-[#374151] hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </ModalOverlay>
  );
}

// ─── PRIORITY SUMMARY CARD ──────────────────────────────────────────────────

function PrioritySummaryCard({ label, count, color, subtitle, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-2 border rounded-xl flex flex-col cursor-pointer transition-all duration-200 ${isActive
        ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20'
        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
        }`}
      style={{ minWidth: 155 }}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="text-[11px] font-bold text-[#374151] whitespace-nowrap">
          {label} <span className="hidden xl:inline">Priority</span>
        </span>
      </div>
      <div className="text-[9px] text-gray-400 font-medium mb-1">{subtitle}</div>
      <div className="flex items-baseline gap-1 mt-auto">
        <span className="text-xl font-extrabold leading-none" style={{ color: color }}>{count}</span>
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">leads</span>
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ─────────────────────────────────────────────────────────--

function PriorityBadge({ priority }) {

  const map = {
    Low: { cls: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
    Medium: { cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
    High: { cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  };
  const { cls, dot } = map[priority] || map["Medium"];   // safe fallback
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`} style={{ height: 18 }}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {priority}
    </span>
  );
}

function SourceIcon({ source }) {
  const map = {
    WhatsApp: { icon: <MessageCircle className="w-3 h-3" />, label: "WhatsApp", cls: "text-green-600" },
    Website: { icon: <Globe className="w-3 h-3" />, label: "Website", cls: "text-slate-500" },
    Facebook: { icon: <Facebook className="w-3 h-3" />, label: "Facebook", cls: "text-blue-600" },
  };
  const { icon, label, cls } = map[source] || map["WhatsApp"];  // safe fallback
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${cls}`}>
      {icon}
      {label}
    </span>
  );
}

function FollowUpRow({ followUp }) {
  if (followUp.state === "missing") {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold">
        <AlertCircle className="w-3 h-3 shrink-0" />
        Follow-up required
      </div>
    );
  }
  if (followUp.state === "overdue") {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[11px] font-semibold">
        <AlertCircle className="w-3 h-3 shrink-0" />
        Overdue · {followUp.label}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-[#2563EB] font-medium">
      <Clock className="w-3 h-3 shrink-0" />
      {followUp.label}
    </div>
  );
}

function TagPill({ label }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-[#E5E7EB] text-[#374151] bg-white">
      {label}
    </span>
  );
}

function ActionButton({
  icon,
  tooltip,
  color = "#6B7280",
  onClick,
}) {
  return (
    <button
      title={tooltip}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F3F4F6] transition-colors"
      style={{ color }}
    >
      {icon}
    </button>
  );
}

function LeadCard({
  lead,
  stage,
  onAction,
  onDragStart,
  isDragging,
}) {
  const navigate = useNavigate();
  const didDrag = React.useRef(false);
  const isOverdue = lead.followUp.state === "overdue";
  const isMissing = lead.followUp.state === "missing";
  const visibleTags = (lead.tags || []).slice(0, 5);
  const extraTags = (lead.tags || []).length - 5;
  const [showAllTags, setShowAllTags] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        didDrag.current = true;
        e.dataTransfer.effectAllowed = "move";
        onDragStart(lead);
      }}
      onDragEnd={() => {
        // reset after a short delay so click handler can check
        setTimeout(() => { didDrag.current = false; }, 100);
      }}
      onClick={() => {
        if (!didDrag.current) navigate("/whatsuplead/leaddetails", { state: { lead } });
      }}
      className="group relative bg-white rounded-xl border transition-all duration-150 hover:shadow-md hover:border-[#2563EB]"
      style={{
        borderColor: isOverdue || isMissing ? "#E5E7EB" : "#E5E7EB",
        borderTopWidth: isOverdue || isMissing ? 2 : 1,
        borderTopColor: isOverdue || isMissing ? "#26dc6c" : lead.isNew ? "#2563EB" : "#E5E7EB",
        borderLeftWidth: lead.isNew ? 3 : 1,
        borderLeftColor: lead.isNew ? "#2563EB" : "#E5E7EB",
        boxShadow: isDragging ? "0px 8px 24px rgba(37,99,235,0.18)" : "0px 2px 6px rgba(0,0,0,0.05)",
        padding: "12px 12px 8px 12px",
        height: "auto",
        opacity: isDragging ? 0.5 : lead.isConverted ? 0.6 : 1,
        cursor: isDragging ? "grabbing" : "pointer",
        transform: isDragging ? "rotate(1.5deg)" : undefined,
      }}
    >
      {/* Drag handle */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none">
        <GripVertical className="w-4 h-4 text-[#9CA3AF]" />
      </div>

      {/* Row 1 – Name + Priority */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span
          className="text-sm font-semibold text-[#111827] leading-snug truncate hover:text-[#2563EB] transition-colors"
          style={{ maxWidth: "calc(100% - 64px)" }}
        >
          {lead.name}
        </span>

        <PriorityBadge priority={lead.priority} />
      </div>

      {/* Row 2 – Phone + Source */}
      <div className="flex items-center gap-3 mb-2.5">
        <span className="text-[11px] text-[#6B7280] font-medium">{lead.phone}</span>
        <SourceIcon source={lead.source} />
      </div>

      {/* Divider */}
      <div className="h-px bg-[#F3F4F6] mb-2.5" />

      {/* Row 3 – Last Activity */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[11px] text-[#9CA3AF]">Last:</span>
        <span className="text-[11px] text-[#374151] font-medium">{lead.lastActivity}</span>
        <span className="text-[11px] text-[#9CA3AF] ml-auto">{lead.lastActivityTime}</span>
      </div>

      {/* Row 4 – Follow-up */}
      {lead.overDueCount != 0 && (
        <div className="mb-2.5">
          <FollowUpRow followUp={lead.followUp} />
        </div>
      )}
      <h1>{lead.labels}</h1>
      {/* Row 5 – Tags */}
      {lead.tags && lead.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {(showAllTags ? lead.tags : visibleTags).map((label) => (
            <span
              key={label._id}
              className="border rounded-[20px] text-[11px] px-3 py-0.5"
              style={{
                color: label.text_color || "#374151",
                backgroundColor: label.bg_color || "#F3F4F6",
                borderColor: label.bg_color || "#D1D5DB"
              }}
            >
              {label.title}
            </span>
          ))}
          {extraTags > 0 && (
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className="border rounded-[20px] text-[11px] px-3 py-0.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              style={{
                borderColor: "#D1D5DB"
              }}
            >
              {showAllTags ? "Show less" : `+${extraTags} more`}
            </button>
          )}
        </div>
      )}

      {/* Row 6 – Score & Action icons */}
      <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6] mt-2">
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50/50 border border-blue-100/30">
          <TrendingUp className="w-3 h-3 text-blue-600" />
          <span className="text-[11px] font-black text-blue-700">+{lead.score}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <ActionButton
            icon={<Phone className="w-3.5 h-3.5" />}
            tooltip="Log Call"
            color="#2563EB"
            onClick={() => onAction("call", lead)}
          />
          <ActionButton
            icon={<StickyNote className="w-3.5 h-3.5" />}
            tooltip="Add Note"
            onClick={() => onAction("note", lead)}
          />
          <ActionButton
            icon={<CalendarPlus className="w-3.5 h-3.5" />}
            tooltip="Set Follow-up"
            onClick={() => onAction("followup", lead)}
          />
          <ActionButton
            icon={<Trash2 className="w-3.5 h-3.5" />}
            tooltip="Delete Lead"
            color="#DC2626"
            onClick={() => onAction("delete", lead)}
          />
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  stage,
  stageId,
  leads,
  overdueCount,
  onAction,
  onDragStart,
  onDrop,
  onDragEnter,
  isDragOver,
  draggingLeadId,
  onLoadMore,
  pagination,
  loadingStages
}) {
  return (
    <div className="flex flex-col shrink-0 h-full" style={{ width: 280 }}>
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-[#111827]">{stage}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F3F4F6] text-[#6B7280]">
            {leads.length}

          </span>
          {overdueCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600">
              {overdueCount} overdue
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            title="Delete stage"
            onClick={() => onAction("deletestage", { id: stageId, name: stage })}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#DC2626] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
          {/* <button
            title="Column options"
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#F3F4F6] text-[#9CA3AF] transition-colors"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button> */}
        </div>
      </div>

      {/* Drop zone */}
      <div
        className="flex flex-col gap-3 flex-1 overflow-y-auto rounded-xl p-2 min-h-[200px] transition-all duration-150 custom-scrollbar"
        style={{
          background: isDragOver ? "#EFF6FF" : "#F3F4F6",
          borderWidth: isDragOver ? 2 : 0,
          borderStyle: "dashed",
          borderColor: isDragOver ? "#2563EB" : "transparent",
          outline: "none",
        }}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
        onDragEnter={(e) => { e.preventDefault(); onDragEnter(stage); }}
        onDrop={(e) => { e.preventDefault(); onDrop(stage); }}
      >
        {leads.map((lead, index) => (
          <LeadCard
            key={`${lead.id}-${index}`}
            lead={lead}
            stage={stage}
            onAction={onAction}
            onDragStart={(l) => onDragStart(l, stage)}
            isDragging={draggingLeadId === lead.id}
          />
        ))}

        {/* Load More Button */}
        {pagination[stage] && pagination[stage].total_leads > 10 && leads.length < pagination[stage].total_leads && (
          <div className="flex justify-center py-3">
            <button
              onClick={() => onLoadMore(stage)}
              disabled={loadingStages[stage]}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingStages[stage] ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Load More
                </>
              )}
            </button>
          </div>
        )}
        {isDragOver && (
          <div
            className="flex items-center justify-center py-4 rounded-xl border-2 border-dashed border-[#93C5FD] text-[#2563EB] text-xs font-semibold"
            style={{ background: "rgba(37,99,235,0.04)" }}
          >
            Drop here to move to {stage}
          </div>
        )}
        {leads.length === 0 && !isDragOver && (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-xs text-[#9CA3AF]">No leads</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ARRANGE ORDER MODAL ───────────────────────────────────────────────────────

function ArrangeOrderModal({ onClose, onSave }) {
  const [stageList, setStageList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        setLoading(true);
        const form = new FormData();
        form.append("vendorId", VENDOR_ID);
        const res = await fetch(`${BASE_URI}/api/get-columns`, { method: "POST", body: form });
        const json = await res.json();

        if (json.status === "success" || json.status === true || Array.isArray(json.data)) {
          if (Array.isArray(json.data)) {
            // Sort by order_menu
            const sortedStages = json.data
              .filter(item => item.header_name)
              .sort((a, b) => (a.order_menu || 0) - (b.order_menu || 0));
            setStageList(sortedStages);
          }
        }
      } catch (err) {
        setError("Failed to load stages");
        console.error("Error fetching stages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStages();
  }, []);

  const moveStage = (index, direction) => {
    const newList = [...stageList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newList.length) {
      // Swap items
      [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];

      // Update order_menu values
      newList.forEach((item, idx) => {
        item.order_menu = idx + 1;
      });

      setStageList(newList);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newList = [...stageList];
    const draggedItem = newList[draggedIndex];

    // Remove dragged item from its original position
    newList.splice(draggedIndex, 1);

    // Insert dragged item at the new position
    newList.splice(dropIndex, 0, draggedItem);

    // Update order_menu values
    newList.forEach((item, idx) => {
      item.order_menu = idx + 1;
    });

    setStageList(newList);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Create ids string in the format: statusid-ordernumber,statusid-ordernumber
      const ids = stageList.map((stage, index) => {
        return `${stage.id}-${index + 1}`;
      }).join(',');

      const response = await fetch(`${BASE_URI}/api/filter-leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          ids: ids,
          vendorId: VENDOR_ID,
          userId: USER_ID
        })
      });

      const data = await response.json();
      if (data.status === true || data.status === "success") {
        onSave("Stage order updated successfully!", true);
      } else {
        setError(data.message || "Failed to update stage order");
      }
    } catch (err) {
      setError("Failed to update stage order");
      console.error("Error updating order:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Arrange Order" subtitle="Drag to reorder stages" onClose={onClose} />
      <div className="px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stageList.map((stage, index) => (
              <div
                key={stage.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-3 bg-white border rounded-lg transition-all cursor-move ${draggedIndex === index ? 'opacity-50' : ''
                  } ${dragOverIndex === index ? 'border-blue-500 border-2 bg-blue-50' : ''
                  }`}
                style={{
                  borderColor: dragOverIndex === index ? '#2563EB' : '#E5E7EB',
                  transform: draggedIndex === index ? 'rotate(2deg)' : 'none'
                }}
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveStage(index, 'up')}
                    disabled={index === 0}
                    className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveStage(index, 'down')}
                    disabled={index === stageList.length - 1}
                    className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                <GripVertical className="w-4 h-4 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium text-[#111827]">{stage.header_name}</p>
                  <p className="text-xs text-[#6B7280]">Order: {index + 1}</p>
                </div>
                {draggedIndex === index && (
                  <div className="text-xs text-blue-600 font-medium">
                    Dragging...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 px-6 pb-5">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Order
        </button>
      </div>
    </ModalOverlay>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function LeadPiplineleadpage() {
  // ── API state ─────────────────────────────────────────────────────────────
  const [columns, setColumns] = useState({});
  const [stages, setStages] = useState([]);
  const [sourceOptions, setSourceOptions] = useState([]);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [draggedLead, setDraggedLead] = useState(null);
  const [overdueCounts, setOverdueCounts] = useState({});
  const [dragOverStage, setDragOverStage] = useState(null);
  const [modal, setModal] = useState({ type: null, lead: null });
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [pagination, setPagination] = useState({}); // Store pagination data for each stage
  const [loadingStages, setLoadingStages] = useState({}); // Track loading state for each stage
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Priority counts from API
  const [leadPriority, setLeadPriority] = useState({ High: 0, Medium: 0, Low: 0 });

  const [toast, setToast] = useState(null);
  const [dragState, setDragState] = useState(null);

  // ── Fetch columns (stage names) from get-columns ───────────────────────────
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const form = new FormData();
        form.append("vendorId", VENDOR_ID);
        const res = await fetch(`${BASE_URI}/api/get-columns`, { method: "POST", body: form });
        const json = await res.json();
        console.log("Raw API Response:", json);
        console.log("Response status:", json.status);

        // Handle different response status formats and ensure stages are loaded
        if (json.status === "success" || json.status === true || Array.isArray(json.data)) {
          console.log("API Response Data:", json);
          if (Array.isArray(json.data)) {
            const stageObjects = json.data.map((c) => ({
              id: c.id || c.header_name,
              name: c.header_name
            })).filter(item => item.name);
            console.log("Extracted stage objects:", stageObjects);

            // Fallback: If no stages extracted, try to extract from response directly
            if (stageObjects.length === 0 && json.data.length > 0) {
              const fallbackObjects = json.data.map(item => {
                const name = item.header_name || item.name;
                return name ? { id: item.id || name, name } : null;
              }).filter(Boolean);
              console.log("Fallback extracted stage objects:", fallbackObjects);
              if (fallbackObjects.length > 0) {
                setStages(fallbackObjects);
              }
            } else if (stageObjects.length) {
              setStages(stageObjects);
            }
          }
          if (Array.isArray(json.source)) {
            setSourceOptions(json.source);
          }
          if (Array.isArray(json.priority)) {
            setPriorityOptions(json.priority);
          }
        } else {
          console.log("API response status not successful:", json.status);
          // Try to load stages anyway if data exists
          if (Array.isArray(json.data)) {
            const stageObjects = json.data.map((c) => ({
              id: c.id || c.header_name,
              name: c.header_name
            })).filter(item => item.name);
            console.log("Force extracted stage objects:", stageObjects);
            if (stageObjects.length) setStages(stageObjects);
          }
        }
      } catch (e) {
        console.error("get-columns failed:", e);
      }
    };
    fetchColumns();
  }, []);

  // ── Fetch leads from get-kanban-leads ─────────────────────────────────────
  useEffect(() => {
    const fetchLeads = async () => {
      setApiLoading(true);
      setApiError(null);
      try {
        const form = new FormData();
        form.append("status", "allLeads");
        form.append("vendorId", VENDOR_ID);
        form.append("userId", USER_ID);
        const res = await fetch(`${BASE_URI}/api/get-kanban-leads`, { method: "POST", body: form });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (json.status === "success" && Array.isArray(json.data)) {
          const grouped = {};
          const paginationData = {};
          const overdueCounts = {};
          const stageObjects = [];

          json.data.forEach((stageObj) => {
            const stageName = stageObj.header_name;
            const stageId = stageObj.id;

            if (stageName) {
              // Extract stage metadata
              stageObjects.push({
                id: stageId || stageName,
                name: stageName,
                order: stageObj.order_menu
              });

              const leadsRaw = Array.isArray(stageObj[stageName]) ? stageObj[stageName] : [];
              grouped[stageName] = leadsRaw.map((item) => {
                const mapped = mapApiLead(item);
                mapped._status = stageName;
                return mapped;
              });

              // Store pagination data for this stage
              if (stageObj.pagination) {
                paginationData[stageName] = stageObj.pagination;
              }

              // Store overdue count for this stage
              overdueCounts[stageName] = stageObj.overDueCount || 0;
            }
          });

          // Sort stages by order_menu
          stageObjects.sort((a, b) => (a.order || 0) - (b.order || 0));

          setStages(stageObjects);
          setColumns(grouped);
          setPagination(paginationData);
          setOverdueCounts(overdueCounts);

          // Set priority counts from API
          if (json.leadPriority) {
            setLeadPriority({
              High: json.leadPriority.high || 0,
              Medium: json.leadPriority.medium || 0,
              Low: json.leadPriority.low || 0
            });
          }
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (err) {
        setApiError(err.message || "Failed to load leads");
      } finally {
        setApiLoading(false);
      }
    };
    fetchLeads();
  }, []);

  // ── Load more leads for a specific stage ───────────────────────────────────
  const loadMoreLeads = async (stageName) => {
    const stagePagination = pagination[stageName];
    if (!stagePagination || stagePagination.current_page >= stagePagination.last_page) {
      return; // No more pages to load
    }

    setLoadingStages(prev => ({ ...prev, [stageName]: true }));

    try {
      const form = new FormData();
      form.append("vendorId", VENDOR_ID);
      form.append("menuId", stages.find(s => s.name === stageName)?.id || '');
      form.append("page", stagePagination.current_page + 1);

      const res = await fetch(`${BASE_URI}/api/menu-pagination`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.status === "success" && Array.isArray(json.data)) {
        // The API returns leads directly in data array
        const newLeads = json.data.map((item) => {
          const mapped = mapApiLead(item);
          mapped._status = stageName;
          return mapped;
        });

        // Append new leads to existing ones
        setColumns(prev => ({
          ...prev,
          [stageName]: [...(prev[stageName] || []), ...newLeads]
        }));

        // Update pagination data - increment current page
        setPagination(prev => ({
          ...prev,
          [stageName]: {
            ...prev[stageName],
            current_page: (prev[stageName]?.current_page || 1) + 1,
            total_leads: (prev[stageName]?.total_leads || 0) + newLeads.length
          }
        }));
      }
    } catch (err) {
      console.error("Failed to load more leads:", err);
    } finally {
      setLoadingStages(prev => ({ ...prev, [stageName]: false }));
    }
  };

  const totalLeads = Object.values(columns).reduce((sum, arr) => sum + arr.length, 0);
  const totalOverdue = 0;

  const openModal = (type, lead) => setModal({ type, lead });
  const closeModal = () => setModal({ type: null, lead: null });

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = (message, shouldRefresh = false) => {
    closeModal();
    showToast(message);
    if (shouldRefresh) {
      // Refresh the page to show the new lead
      window.location.reload();
    }
  };

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragStart = (lead, fromStage) => {
    setDragState({ lead, fromStage });
  };

  const handleDrop = (toStage) => {
    setDragOverStage(null);
    if (!dragState) return;
    const { lead, fromStage } = dragState;
    if (fromStage === toStage) { setDragState(null); return; }

    const fromIdx = stages.indexOf(fromStage);
    const toIdx = stages.indexOf(toStage);
    const stagesSkipped = toIdx - fromIdx - 1;

    if (stagesSkipped >= 1) {
      // Show confirmation for stage skips
      setModal({ type: "stageconfirm", lead, stageConfirm: { lead, fromStage, toStage } });
    } else {
      moveLead(lead, fromStage, toStage);
    }
    setDragState(null);
  };

  const moveLead = async (lead, fromStage, toStage) => {
    try {
      // Find the stage ID for the toStage
      const toStageObj = stages.find(s => s.name === toStage);
      const stageId = toStageObj ? toStageObj.id : toStage;
      console.log("Moving lead:", lead);
      // Call the update-lead-status API
      const response = await fetch(`${BASE_URI}/api/update-lead-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          lead_id: lead.id,
          status: stageId, // Pass stage ID instead of stage name
          vendorId: VENDOR_ID
        })
      });

      const data = await response.json();

      if (data.status === "success") {
        // Update the local state only after successful API call
        setColumns((prev) => {
          const next = { ...prev };
          next[fromStage] = (next[fromStage] || []).filter((l) => l.id !== lead.id);
          next[toStage] = [{ ...lead, isNew: false }, ...(next[toStage] || [])];
          return next;
        });
        showToast(`${lead.name} moved to ${toStage}`);
      } else {
        showToast(`Failed to update lead status: ${data.message || 'Unknown error'}`);
        // Optionally, you could revert the UI state here if needed
      }
    } catch (err) {
      console.error("API Error:", err);
      showToast("Network error. Failed to update lead status.");
    }
  };

  return (
    <div className="h-screen flex flex-col font-sans" style={{ background: "#F9FAFB", color: "#111827" }}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <header
        className="z-40 bg-white/80 backdrop-blur-xl border-b shrink-0"
        style={{ borderColor: "rgba(229,231,235,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}
      >
        <div className="mx-auto px-2 sm:px-4 py-2 flex items-center justify-between gap-1 sm:gap-4 flex-nowrap overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-6 flex-nowrap flex-shrink-0">

            <div>
              <h1 className="text-xl font-bold text-[#111827] tracking-tight">Lead Board</h1>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {apiLoading ? "Loading leads…" : `${totalLeads} total leads`}
              </p>
            </div>

            <div className="h-8 w-px bg-gray-200 hidden md:block mx-1 flex-shrink-0" />

            <div className="flex items-center gap-3 flex-shrink-0">
              <PrioritySummaryCard
                label="High"
                count={leadPriority.High}
                color="#DC2626"
                subtitle="Hot Leads"
                isActive={priorityFilter === "High"}
                onClick={() => setPriorityFilter(priorityFilter === "High" ? "all" : "High")}
              />
              <PrioritySummaryCard
                label="Medium"
                count={leadPriority.Medium}
                color="#EA580C"
                subtitle="Warm Leads"
                isActive={priorityFilter === "Medium"}
                onClick={() => setPriorityFilter(priorityFilter === "Medium" ? "all" : "Medium")}
              />
              <PrioritySummaryCard
                label="Low"
                count={leadPriority.Low}
                color="#16A34A"
                subtitle="Cold Leads"
                isActive={priorityFilter === "Low"}
                onClick={() => setPriorityFilter(priorityFilter === "Low" ? "all" : "Low")}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="h-8 w-px bg-gray-200 hidden lg:block flex-shrink-0" />
            <div className="flex items-center gap-2 flex-nowrap">
              {/* <button
                onClick={() => openModal("priorityfilter", null)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
                style={{ background: "#EA580C" }}
              >
                <Filter className="w-4 h-4" />
                Priority Filter
              </button> */}
              <button
                onClick={() => openModal("customfield", null)}
                className="flex items-center gap-1.5 px-3 2xl:px-5 py-2 rounded-md text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg flex-shrink-0"
                style={{ background: "#2563EB" }}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden 2xl:inline">Custom Field</span>
              </button>
              <button
                onClick={() => openModal("arrangeorder", null)}
                className="flex items-center gap-1.5 px-3 2xl:px-5 py-2 rounded-md text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg flex-shrink-0"
                style={{ background: "#16A34A" }}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden 2xl:inline">Filter</span>
              </button>
              <button
                onClick={() => openModal("addstage", null)}
                className="flex items-center gap-1.5 px-3 2xl:px-5 py-2 rounded-md text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg flex-shrink-0"
                style={{ background: "#16A34A" }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden 2xl:inline">Add Stage</span>
              </button>
              <button
                onClick={() => openModal("addlead", null)}
                className="flex items-center gap-1.5 px-3 2xl:px-5 py-2 rounded-md text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg flex-shrink-0"
                style={{ background: "#16A34A" }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden 2xl:inline">Add Lead</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── KANBAN BOARD ────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar"
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOverStage(null);
          }
        }}
      >
        <div className="flex gap-4 p-6 h-full" style={{ minWidth: "max-content" }}>
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id || stage.name}
              stage={stage.name}
              stageId={stage.id}
              leads={(columns[stage.name] || []).filter(l => priorityFilter === 'all' || l.priority === priorityFilter)}
              overdueCount={overdueCounts[stage.name] || 0}
              onAction={openModal}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onDragEnter={(s) => setDragOverStage(s)}
              isDragOver={dragOverStage === stage.name && dragState?.fromStage !== stage.name}
              draggingLeadId={dragState?.lead?.id ?? null}
              onLoadMore={loadMoreLeads}
              pagination={pagination}
              loadingStages={loadingStages}
            />
          ))}
        </div>
      </div>



      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      {modal.type === "call" && modal.lead && (
        <CallModal lead={modal.lead} onClose={closeModal} onSave={handleSave} />
      )}
      {modal.type === "whatsapp" && modal.lead && (
        <WhatsAppModal lead={modal.lead} onClose={closeModal} onSave={handleSave} />
      )}
      {modal.type === "note" && modal.lead && (
        <NoteModal lead={modal.lead} onClose={closeModal} onSave={handleSave} />
      )}
      {modal.type === "followup" && modal.lead && (
        <FollowUpModal lead={modal.lead} onClose={closeModal} onSave={handleSave} />
      )}
      {modal.type === "addstage" && (
        <AddStageModal
          onClose={closeModal}
          onSave={(name, apiData, shouldRefresh = false) => {
            setStages((prev) => [...prev, name]);
            setColumns((prev) => ({ ...prev, [name]: [] }));
            handleSave(`Stage "${name}" added successfully!`, shouldRefresh);
          }}
        />
      )}
      {modal.type === "arrangeorder" && (
        <ArrangeOrderModal
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
      {modal.type === "addlead" && (
        <AddLeadModal
          onClose={closeModal}
          onSave={handleSave}
          stageOptions={stages}
          sourceOptions={sourceOptions}
          priorityOptions={priorityOptions}
          initialStage={modal.lead?.stage?.id || modal.lead?.stage}
        />
      )}
      {modal.type === "delete" && modal.lead && (
        <DeleteLeadModal lead={modal.lead} onClose={closeModal} onSave={handleSave} />
      )}
      {modal.type === "deletestage" && modal.lead && (
        <DeleteStageModal stage={modal.lead} onClose={closeModal} onSave={handleSave} />
      )}
      {modal.type === "stageconfirm" && modal.stageConfirm && (
        <StageConfirmModal
          stages={stages.map(s => s.name)}
          lead={modal.stageConfirm.lead}
          fromStage={modal.stageConfirm.fromStage}
          toStage={modal.stageConfirm.toStage}
          onConfirm={() => {
            moveLead(modal.stageConfirm.lead, modal.stageConfirm.fromStage, modal.stageConfirm.toStage);
            closeModal();
          }}
          onClose={closeModal}
        />
      )}

      {modal.type === "priorityfilter" && (
        <PriorityFilterModal
          currentFilter={priorityFilter}
          onSelect={setPriorityFilter}
          onClose={closeModal}
        />
      )}

      {modal.type === "customfield" && (
        <CustomFieldModal
          onClose={closeModal}
        />
      )}

      {/* ── TOAST ───────────────────────────────────────────────────────── */}
      {toast && <SuccessToast message={toast} />}
    </div>
  );
}
