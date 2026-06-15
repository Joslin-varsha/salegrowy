import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Plus,
    ChevronDown,
    Upload,
    X,
    Check,
    Eye,
    User,
    Download,
    CheckCircle2,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const BASE_URI = import.meta.env.VITE_BASE_URI;
const VENDOR_ID = localStorage.getItem('vendor_id');
const USER_ID = localStorage.getItem('user_id');

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Status → pill color palette (cycles through a set for unknown statuses)
const STATUS_COLORS = [
    "210 80% 56%",
    "262 80% 60%",
    "35 95% 55%",
    "280 70% 60%",
    "16 85% 55%",
    "142 70% 45%",
    "190 80% 45%",
    "330 75% 55%",
];

function getStatusColor(status, allStatuses) {
    const idx = allStatuses.indexOf(status);
    return STATUS_COLORS[idx % STATUS_COLORS.length] || "210 80% 56%";
}

function getStatusStyle(status, allStatuses) {
    const c = getStatusColor(status, allStatuses);
    return {
        background: `hsl(${c} / 0.15)`,
        color: `hsl(${c})`,
        border: `1px solid hsl(${c} / 0.35)`,
    };
}

function sourcePill(source) {
    const src = (source || "").toLowerCase();
    if (src.includes("facebook")) return { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", label: "Facebook" };
    if (src.includes("website")) return { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe", label: "Website" };
    if (src.includes("whatsapp")) return { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "WhatsApp" };
    return { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb", label: source || "—" };
}

function priorityBadge(priority) {
    const p = (priority || "").toLowerCase();
    if (p === "high" || p === "hot") return { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" };
    if (p === "low" || p === "cold") return { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" };
    if (p === "medium" || p === "warm") return { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" };
    return { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" }; // fallback
}

function mapLead(item) {
    const firstName = (item.first_name || "").trim();
    const lastName = (item.last_name || "").trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || "—";
    
    // Check both new and old properties just in case
    const rawPhone = item.phone_number || item.wa_id;
    
    return {
        id: item._id,
        uid: item._uid,
        name: fullName,
        email: item.email || null,
        phone: rawPhone ? "+" + rawPhone : "—",
        source: item.created_from_source || "—",
        status: item.lead_status || item.status || "—",
        priority: item.priority || "—",
        agentName: item.assigned_user_name || item.full_name || "—",
        createdAt: item.leadscreated_at || item.created_at || null,
    };
}

// ─── MODAL COMPONENTS ────────────────────────────────────────────────────────

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

function ModalHeader({ title, onClose }) {
    return (
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "#E5E7EB" }}>
            <h2 className="text-base font-bold text-[#111827]">{title}</h2>
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

function AddLeadModal({ onClose, onSave, stageOptions = [], sourceOptions = [], priorityOptions = [], initialStage }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState(typeof sourceOptions[0] === 'string' ? sourceOptions[0] : (sourceOptions[0]?.name || "whatsappchat"));
  const [priority, setPriority] = useState(typeof priorityOptions[0] === 'string' ? priorityOptions[0] : (priorityOptions[0]?.name || "Medium"));
  const [stage, setStage] = useState(initialStage?.id || stageOptions[0]?.id || stageOptions[0] || "90");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10,15}$/;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return phoneRegex.test(cleanPhone);
  };

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
      setError("Please enter a valid phone number (10-15 digits)");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Find the stage ID from the selected stage value
      let stageId = stage;
      if (typeof stageOptions[0] === 'object' && stageOptions[0]?.id) {
        // If stageOptions are objects, stage is already the ID
        stageId = stage;
      } else {
        // If stageOptions are strings, find the corresponding column ID
        const selectedColumn = stageOptions.find(col => {
          const colName = typeof col === 'string' ? col : (col.name || col);
          return colName === stage;
        });
        stageId = selectedColumn?.id || stage;
      }

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
          phone: phone.replace(/[^0-9]/g, ''),
          source: source.toLowerCase(),
          priority: priority,
          stage: stageId
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
    if (field === 'priority') setPriority(value);
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
              className={`w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none transition-colors ${
                error && error.toLowerCase().includes('name') ? "border-red-500 focus:border-red-500" : "focus:border-[#2563EB]"
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
            <input
              className={`w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none transition-colors ${
                error && error.toLowerCase().includes('phone') ? "border-red-500 focus:border-red-500" : "focus:border-[#2563EB]"
              }`}
              style={{ borderColor: error && error.toLowerCase().includes('phone') ? "#EF4444" : "#E5E7EB" }}
              placeholder="919876543210"
              value={phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={isLoading}
            />
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

          {/* Priority */}
          <div>
            <FormLabel>Priority</FormLabel>
            <div className="relative">
              <select
                className="w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none focus:border-[#2563EB] appearance-none bg-white transition-colors"
                style={{ borderColor: "#E5E7EB" }}
                value={priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                disabled={isLoading}
              >
                {priorityOptions.length > 0
                  ? priorityOptions.map((p) => <option key={typeof p === 'string' ? p : (p.id || p.name)} value={typeof p === 'string' ? p : (p.name || p)}>{typeof p === 'string' ? p : (p.name || p)}</option>)
                  : <option value="">Loading…</option>
                }
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
            </div>
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
                  ? stageOptions.map((s) => {
                    const stageValue = typeof s === 'string' ? s : (s.id || s);
                    const stageName = typeof s === 'string' ? s : (s.name || s);
                    return (
                      <option key={stageValue} value={stageValue}>{stageName}</option>
                    );
                  })
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
                    className={`w-full px-3 py-2 rounded-lg border text-sm text-[#111827] outline-none transition-colors ${
                        error ? "border-red-500 focus:border-red-500" : "focus:border-[#2563EB]"
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
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function LeadPipline() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sourceOptions, setSourceOptions] = useState([]);
    const [priorityOptions, setPriorityOptions] = useState([]);
    const [columns, setColumns] = useState([]);          // from get-columns API
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [pagination, setPagination] = useState({
        total: 0,
        last_page: 1
    });
    const [sortField, setSortField] = useState("name");
    const [sortDir, setSortDir] = useState("asc");
    const [dropOpen, setDropOpen] = useState(false);
    const [priorityDropOpen, setPriorityDropOpen] = useState(false);
    const [showAddLead, setShowAddLead] = useState(false);
    const [showAddStage, setShowAddStage] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importLoading, setImportLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    // ── Fetch columns (status list) from API ──────────────────────────────────
    useEffect(() => {
        const fetchColumns = async () => {
            try {
                const colForm = new FormData();
                colForm.append("vendorId", VENDOR_ID);
                const res = await fetch(`${BASE_URI}/api/get-columns`, { method: "POST", body: colForm });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                console.log("Pipeline Raw API Response:", json);
                console.log("Pipeline Response status:", json.status);
                
                // Handle different response status formats and ensure stages are loaded
                if (json.status === true || json.status === true || Array.isArray(json.data)) {
                    console.log("Pipeline API Response Data:", json);
                    if (Array.isArray(json.data)) {
                        const stageObjects = json.data.map((col) => ({
                          id: col.id || col.header_name,
                          name: col.header_name
                        })).filter(item => item.name);
                        console.log("Pipeline Extracted stage objects:", stageObjects);
                        
                        // Fallback: If no stages extracted, try to extract from response directly
                        if (stageObjects.length === 0 && json.data.length > 0) {
                            const fallbackObjects = json.data.map(item => {
                                const name = item.header_name || item.name;
                                return name ? { id: item.id || name, name } : null;
                            }).filter(Boolean);
                            console.log("Pipeline Fallback extracted stage objects:", fallbackObjects);
                            if (fallbackObjects.length > 0) {
                                setColumns(fallbackObjects);
                            }
                        } else if (stageObjects.length) {
                            setColumns(stageObjects);
                        }
                    }
                    if (Array.isArray(json.source)) {
                        setSourceOptions(json.source);
                    }
                    if (Array.isArray(json.priority)) {
                        setPriorityOptions(json.priority);
                    }
                } else {
                    console.log("Pipeline API response status not successful:", json.status);
                    // Try to load stages anyway if data exists
                    if (Array.isArray(json.data)) {
                        const stageObjects = json.data.map((col) => ({
                          id: col.id || col.header_name,
                          name: col.header_name
                        })).filter(item => item.name);
                        console.log("Pipeline Force extracted stage objects:", stageObjects);
                        if (stageObjects.length) setColumns(stageObjects);
                    }
                }
            } catch (err) {
                console.error("Failed to load columns:", err);
            }
        };
        fetchColumns();
    }, []);

    // ── Fetch leads from API ──────────────────────────────────────────────────
    // ── Debounce search input ────────────────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ── Fetch leads from API ──────────────────────────────────────────────────
    useEffect(() => {
        const fetchLeads = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = `${BASE_URI}/api/lead-list-table-view`;
                const formData = new FormData();
                formData.append("vendorId", VENDOR_ID);
                formData.append("userId", USER_ID);
                formData.append("Per_page", perPage);
                formData.append("page_no", currentPage);
                console.log("statusFilter:", statusFilter);
                if (statusFilter !== "all") {
                    formData.append("stage", statusFilter);
                }
                if (priorityFilter !== "all") {
                    formData.append("priority", priorityFilter);
                }
                if (debouncedSearch) {
                    formData.append("Search", debouncedSearch);
                }

                const res = await fetch(url, { method: "POST", body: formData });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                if (json.status === true && Array.isArray(json.data)) {
                    setLeads(json.data.map(mapLead));
                    if (json.pagination) {
                        setPagination({
                            total: json.pagination.total,
                            last_page: json.pagination.last_page
                        });
                    }
                } else {
                    throw new Error("Unexpected response format");
                }
            } catch (err) {
                setError(err.message || "Failed to load leads");
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, [currentPage, perPage, statusFilter, priorityFilter, debouncedSearch]);

    // ── Fallback: derive status list from leads if columns not loaded yet ──────
    const allStatuses = columns.length > 0
        ? columns.map(col => typeof col === 'string' ? col : col.name)
        : [...new Set(leads.map((l) => l.status))].sort();

    function handleAddLeadSave(message, shouldRefresh = false) {
        setShowAddLead(false);
        setToast(message);
        setTimeout(() => setToast(null), 3000);
        if (shouldRefresh) {
            // Refresh the page to show the new lead
            window.location.reload();
        }
    }

    const handleImportLeads = async () => {
        if (!importFile) {
            setToast("Please select a file to import");
            setTimeout(() => setToast(null), 3000);
            return;
        }

        setImportLoading(true);
        const formData = new FormData();
        formData.append('vendorId', VENDOR_ID);
        formData.append('userId', USER_ID);
        formData.append('file', importFile);

        try {
            const response = await fetch(`${BASE_URI}/api/import-leads`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.status) {
                setToast(result.message || "Leads imported successfully!");
                setShowImportModal(false);
                setImportFile(null);
                setTimeout(() => {
                    setToast(null);
                    // Refresh the page to show imported leads
                    window.location.reload();
                }, 2000);
            } else {
                setToast(result.message || "Failed to import leads");
                setTimeout(() => setToast(null), 3000);
            }
        } catch (error) {
            console.error("Error importing leads:", error);
            setToast("Network error. Please try again.");
            setTimeout(() => setToast(null), 3000);
        } finally {
            setImportLoading(false);
        }
    };

    // ── Data handles ──────────────────────────────────────────────────────────
    // Server-side filtered and sorted results (we can still do client-side sort on the current page for UX)
    const sorted = [...leads].sort((a, b) => {
        let av = a[sortField] ?? "";
        let bv = b[sortField] ?? "";
        if (typeof av === "string") av = av.toLowerCase();
        if (typeof bv === "string") bv = bv.toLowerCase();
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
    });

    function handleSort(field) {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    }

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <span style={{ opacity: 0.3, fontSize: 10 }}>⇅</span>;
        return <span style={{ fontSize: 10 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
    };

    // ── Status counts ─────────────────────────────────────────────────────────
    const statusCounts = {};
    leads.forEach((l) => {
        statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
    });

    return (
        <div
            className="min-h-screen font-sans"
            style={{ background: "linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%)", color: "#111827" }}
        >
            {/* ── HEADER ────────────────────────────────────────────────────── */}
            <header
                className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b"
                style={{ borderColor: "rgba(229,231,235,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}
            >
                <div className="ml-10 mr-10 mx-auto px-3 py-2 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold text-[#111827] tracking-tight">Lead Pipeline</h1>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                            {pagination.total} total leads · Showing page {currentPage} of {pagination.last_page}
                        </p>
                    </div>
                    {loading && (
                        <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                        </span>
                    )}
                    <div className="flex items-center gap-2">

                        <button
                            onClick={() => setShowAddStage(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
                            style={{ background: "#16A34A" }}
                        >
                            <Plus className="w-4 h-4" />
                            Add Stage
                        </button>

                        <button
                            className="flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
                            style={{ background: "#16A34A" }}
                            onClick={() => setShowAddLead(true)}
                        >
                            + Add Lead
                        </button>

                        <button
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold text-[#374151] hover:bg-[#f9fafb] transition-all"
                            style={{ borderColor: "#E5E7EB" }}
                            onClick={() => setShowImportModal(true)}
                        >
                            <Upload className="w-3.5 h-3.5" /> Import
                        </button>
                         {/* <button
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold text-[#374151] hover:bg-[#f9fafb] transition-all"
                            style={{ borderColor: "#E5E7EB" }}
                        >
                            <Download className="w-3.5 h-3.5" /> Export
                        </button> */}
                    </div>
                </div>
            </header>

            {/* ── ADD LEAD MODAL ──────────────────────────────────── */}
            {showAddLead && (
                <AddLeadModal
                    onClose={() => setShowAddLead(false)}
                    onSave={handleAddLeadSave}
                    stageOptions={columns}
                    sourceOptions={sourceOptions}
                    priorityOptions={priorityOptions}
                />
            )}

            {/* ── ADD STAGE MODAL ─────────────────────────────────── */}
            {showAddStage && (
                <AddStageModal
                    onClose={() => setShowAddStage(false)}
                    onSave={(name, apiData, shouldRefresh = false) => {
                        // Add as stage object to maintain consistency
                        const newStage = { id: apiData?.id || name, name: name };
                        setColumns((prev) => [...prev, newStage]);
                        setShowAddStage(false);
                        setToast(`Stage "${name}" added successfully!`);
                        setTimeout(() => setToast(null), 3000);
                        if (shouldRefresh) {
                            // Refresh the page to show the new stage
                            window.location.reload();
                        }
                    }}
                />
            )}

            {/* ── IMPORT LEADS MODAL ─────────────────────────────── */}
            {showImportModal && (
                <ModalOverlay onClose={() => setShowImportModal(false)}>
                    <ModalHeader title="Import Leads" onClose={() => setShowImportModal(false)} />
                    <div className="px-6 py-4 space-y-4">
                        <div>
                            <FormLabel>Select File</FormLabel>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        setImportFile(file);
                                    }}
                                    className="w-full px-4 py-3 border rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#16A34A] file:text-white hover:file:bg-[#15803D]"
                                    style={{ borderColor: "#E5E7EB" }}
                                />
                                {importFile && (
                                    <div className="mt-2 flex items-center gap-2 text-xs text-[#6B7280]">
                                        <Check className="w-3 h-3 text-green-600" />
                                        {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                                    </div>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-[#6B7280]">
                                Supported formats: CSV, Excel (.xlsx, .xls)
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={() => {
                                    setShowImportModal(false);
                                    setImportFile(null);
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border hover:bg-[#F3F4F6]"
                                style={{ borderColor: "#E5E7EB", color: "#374151" }}
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                onClick={handleImportLeads}
                                disabled={!importFile || importLoading}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                                style={{ background: "#16A34A" }}
                            >
                                {importLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Import Leads
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* ── SUCCESS TOAST ───────────────────────────────────── */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-full bg-[#111827] text-white text-sm font-medium shadow-xl">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    {toast}
                </div>
            )}

            <div className="ml-10 mr-10 mx-auto px-6 py-6 space-y-5">

                {/* ── STATUS PILLS ──────────────────────────────────────────── */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
                        className="px-4 py-1.5 rounded-full text-xs font-bold border transition-all"
                        style={{
                            background: statusFilter === "all" ? "#111827" : "#fff",
                            color: statusFilter === "all" ? "#fff" : "#374151",
                            borderColor: statusFilter === "all" ? "#111827" : "#E5E7EB",
                        }}
                    >
                        All <span style={{ opacity: 0.7, marginLeft: 4 }}>{leads.length}</span>
                    </button>
                    {allStatuses.map((st, i) => {
                        const active = statusFilter === st;
                        const c = getStatusColor(st, allStatuses);
                        // Find the corresponding stage ID from columns
                        const stageId = columns.find(col => {
                            const colName = typeof col === 'string' ? col : (col.name || col);
                            return colName === st;
                        })?.id || st;
                        
                        return (
                            <button
                                key={st}
                                onClick={() => { setStatusFilter(stageId); setCurrentPage(1); }}
                                className="px-4 py-1.5 rounded-full text-xs font-bold border transition-all"
                                style={{
                                    background: active ? `hsl(${c})` : `hsl(${c} / 0.1)`,
                                    color: active ? "#fff" : `hsl(${c})`,
                                    borderColor: active ? `hsl(${c})` : `hsl(${c} / 0.3)`,
                                }}
                            >
                                {st}
                            </button>
                        );
                    })}
                </div>

                {/* ── TOOLBAR ───────────────────────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                            style={{ width: 15, height: 15 }}
                        />
                        <input
                            placeholder="Search by name, phone, email…"
                            className="w-full pl-9 pr-4 h-9 rounded-xl border bg-white text-sm outline-none focus:border-[#2563EB] transition-colors"
                            style={{ borderColor: "#E5E7EB" }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]"
                                onClick={() => setSearchQuery("")}
                            >
                                <X style={{ width: 13, height: 13 }} />
                            </button>
                        )}
                    </div>

                    {/* Priority filter dropdown */}
                    <div className="relative">
                        <button
                            className="flex items-center gap-2 h-9 px-4 rounded-xl border bg-white text-sm font-medium text-[#374151] hover:border-[#2563EB] transition-colors"
                            style={{ borderColor: "#E5E7EB" }}
                            onClick={() => setPriorityDropOpen((o) => !o)}
                        >
                            <Filter style={{ width: 13, height: 13 }} />
                            {priorityFilter === "all" ? "All Priorities" : priorityFilter}
                            <ChevronDown
                                style={{ width: 13, height: 13, transition: "transform 0.2s", transform: priorityDropOpen ? "rotate(180deg)" : "rotate(0)" }}
                            />
                        </button>
                        {priorityDropOpen && (
                            <div
                                className="absolute top-11 left-0 z-50 bg-white rounded-xl shadow-xl border py-1 min-w-[170px]"
                                style={{ borderColor: "#E5E7EB" }}
                            >
                                {[{ id: "all", name: "All Priorities" }, ...priorityOptions.map((p) => ({ id: p, name: p }))].map((s) => (
                                    <button
                                        key={s.id}
                                        className="w-full text-left flex items-center justify-between gap-2 px-4 py-2 text-sm font-medium hover:bg-[#f3f4f6] transition-colors"
                                        style={{ color: priorityFilter === s.id ? "#2563EB" : "#374151" }}
                                        onClick={() => { setPriorityFilter(s.id); setPriorityDropOpen(false); setCurrentPage(1); }}
                                    >
                                        {s.name}
                                        {priorityFilter === s.id && <Check style={{ width: 13, height: 13 }} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Status filter dropdown */}
                    {/* <div className="relative">
                        <button
                            className="flex items-center gap-2 h-9 px-4 rounded-xl border bg-white text-sm font-medium text-[#374151] hover:border-[#2563EB] transition-colors"
                            style={{ borderColor: "#E5E7EB" }}
                            onClick={() => setDropOpen((o) => !o)}
                        >
                            <Filter style={{ width: 13, height: 13 }} />
                            {statusFilter === "all" ? "All Statuses" : statusFilter}
                            <ChevronDown
                                style={{ width: 13, height: 13, transition: "transform 0.2s", transform: dropOpen ? "rotate(180deg)" : "rotate(0)" }}
                            />
                        </button>
                        {dropOpen && (
                            <div
                                className="absolute top-11 left-0 z-50 bg-white rounded-xl shadow-xl border py-1 min-w-[170px]"
                                style={{ borderColor: "#E5E7EB" }}
                            >
                                {[{ id: "all", name: "All Statuses" }, ...allStatuses.map((st) => ({ id: st, name: st }))].map((s) => (
                                    <button
                                        key={s.id}
                                        className="w-full text-left flex items-center justify-between gap-2 px-4 py-2 text-sm font-medium hover:bg-[#f3f4f6] transition-colors"
                                        style={{ color: statusFilter === s.id ? "#2563EB" : "#374151" }}
                                        onClick={() => { setStatusFilter(s.id); setDropOpen(false); }}
                                    >
                                        {s.name}
                                        {statusFilter === s.id && <Check style={{ width: 13, height: 13 }} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div> */}

                    <div className="ml-auto text-xs text-[#9ca3af] font-medium self-center">
                        {sorted.length} lead{sorted.length !== 1 ? "s" : ""}
                    </div>
                </div>

                {/* ── TABLE ─────────────────────────────────────────────────── */}
                <div
                    className="bg-white rounded-2xl border overflow-hidden"
                    style={{ borderColor: "rgba(229,231,235,0.6)", boxShadow: "0 12px 40px rgba(0,0,0,0.06)" }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr style={{ background: "linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)", borderBottom: "1px solid #e5e7eb" }}>
                                    {[
                                        { key: "name", label: "Name / Phone" },
                                        { key: "source", label: "Source" },
                                        { key: "status", label: "Status" },
                                        { key: "priority", label: "Priority" },
                                        { key: "agentName", label: "Assigned To" },
                                        { key: "createdAt", label: "Created" },
                                    ].map((col) => (
                                        <th
                                            key={col.key}
                                            className="text-left px-5 py-3 text-xs font-bold text-[#6B7280] uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-[#111827] transition-colors"
                                            onClick={() => handleSort(col.key)}
                                        >
                                            <span className="flex items-center gap-1.5">
                                                {col.label} <SortIcon field={col.key} />
                                            </span>
                                        </th>
                                    ))}
                                    <th className="px-5 py-3 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Loading skeleton */}
                                {loading && (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b" style={{ borderColor: "#f3f4f6" }}>
                                            {Array.from({ length: 7 }).map((__, j) => (
                                                <td key={j} className="px-5 py-4">
                                                    <div
                                                        className="h-3 rounded-full animate-pulse"
                                                        style={{ background: "#e5e7eb", width: j === 0 ? "70%" : "50%" }}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}

                                {/* Error state */}
                                {!loading && error && (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle className="w-8 h-8 text-red-400" />
                                                <p className="text-sm font-semibold text-red-500">{error}</p>
                                                <p className="text-xs text-[#9ca3af]">Check your network or API configuration.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {/* Empty state */}
                                {!loading && !error && sorted.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center text-[#9ca3af] text-sm">
                                            No leads match your search or filter.
                                        </td>
                                    </tr>
                                )}

                                {/* Data rows */}
                                {!loading && !error && sorted.map((lead, idx) => {
                                    const src = sourcePill(lead.source);
                                    const pb = priorityBadge(lead.priority);
                                    const initials = lead.agentName
                                        .split(" ")
                                        .slice(0, 2)
                                        .map((w) => w.charAt(0).toUpperCase())
                                        .join("");

                                    return (
                                        <tr
                                            key={lead.id}
                                            className="border-b transition-all group"
                                            style={{
                                                borderColor: "#f3f4f6",
                                                background: idx % 2 === 0 ? "#fff" : "#fafafa",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafafa")}
                                        >
                                            {/* Name / Phone */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                                                        style={{ background: `hsl(${getStatusColor(lead.status, allStatuses)})` }}
                                                    >
                                                        {lead.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p
                                                            className="font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors cursor-pointer"
                                                            onClick={() => navigate("/dashboard/whatsuplead/leaddetails", { state: { lead } })}
                                                        >
                                                            {lead.name}
                                                        </p>
                                                        <p className="text-xs text-[#9ca3af] mt-0.5">{lead.phone}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Source */}
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                                                    style={{ background: src.bg, color: src.color, border: `1px solid ${src.border}` }}
                                                >
                                                    {src.label}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                                                    style={getStatusStyle(lead.status, allStatuses)}
                                                >
                                                    {lead.status}
                                                </span>
                                            </td>

                                            {/* Priority */}
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                                                    style={{ background: pb.bg, color: pb.color, border: `1px solid ${pb.border}` }}
                                                >
                                                    {lead.priority}
                                                </span>
                                            </td>

                                            {/* Assigned To */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                                                        style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}
                                                    >
                                                        {initials}
                                                    </div>
                                                    <span className="text-sm font-medium text-[#374151]">{lead.agentName}</span>
                                                </div>
                                            </td>

                                            {/* Created */}
                                            <td className="px-5 py-3.5 text-xs text-[#9ca3af] whitespace-nowrap">
                                                {lead.createdAt
                                                    ? new Date(lead.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })
                                                    : "—"}
                                            </td>

                                            {/* Eye / View action */}
                                            <td className="px-5 py-3.5 text-center">
                                                <button
                                                    title="View details"
                                                    onClick={(e) => { e.stopPropagation(); navigate("/dashboard/whatsuplead/leaddetails", { state: { lead } }); }}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-110"
                                                    style={{ background: "#eff6ff", color: "#2563EB", border: "1px solid #bfdbfe" }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = "#2563EB"; e.currentTarget.style.color = "#fff"; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#2563EB"; }}
                                                >
                                                    <Eye style={{ width: 14, height: 14 }} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Pagination */}
                    <div
                        className="px-5 py-3 flex flex-wrap items-center justify-between gap-4"
                        style={{ borderTop: "1px solid #f3f4f6", background: "#fafafa" }}
                    >
                        <div className="flex flex-col gap-0.5">
                            <p className="text-xs text-[#374151] font-semibold">
                                Total {pagination.total} leads
                            </p>
                            <p className="text-[10px] text-[#9ca3af]">
                                Showing leads on page {currentPage}
                            </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || loading}
                                className="px-3 py-1.5 rounded-lg border bg-white text-xs font-bold text-[#374151] hover:bg-[#F9FAFB] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ borderColor: "#E5E7EB" }}
                            >
                                Previous
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === pagination.last_page || Math.abs(p - currentPage) <= 1)
                                    .map((p, i, arr) => {
                                        const showEllipsis = i > 0 && p !== arr[i-1] + 1;
                                        return (
                                            <React.Fragment key={p}>
                                                {showEllipsis && <span className="text-xs text-[#9ca3af]">...</span>}
                                                <button
                                                    onClick={() => setCurrentPage(p)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                                        currentPage === p
                                                            ? "bg-[#2563EB] text-white shadow-md shadow-blue-200"
                                                            : "text-[#374151] hover:bg-[#F3F4F6]"
                                                    }`}
                                                    disabled={loading}
                                                >
                                                    {p}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}
                            </div>

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
                                disabled={currentPage === pagination.last_page || loading}
                                className="px-3 py-1.5 rounded-lg border bg-white text-xs font-bold text-[#374151] hover:bg-[#F9FAFB] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ borderColor: "#E5E7EB" }}
                            >
                                Next
                            </button>
                        </div>

                        {loading && (
                            <span className="flex items-center gap-1.5 text-xs text-[#2563EB] font-medium animate-pulse">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating…
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
