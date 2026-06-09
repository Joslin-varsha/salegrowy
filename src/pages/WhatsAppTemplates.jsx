import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Megaphone, Eye, Edit, Link2, Trash2, CheckCircle2, ExternalLink, X } from 'lucide-react';



export default function WhatsAppTemplates() {
  const navigate = useNavigate();
  const [entriesCount, setEntriesCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [templatesData, setTemplatesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templatesData.filter(tpl =>
    (tpl.template_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tpl.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );


  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp/templates`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ page: currentPage, limit: entriesCount })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const result = await response.json();
          if (result?.success) {
            setTemplatesData(result.data);
            if (result.pagination) {
              setTotalRecords(result.pagination.total || 0);
              setTotalPages(result.pagination.total_pages || 1);
            } else if (result.recordsTotal !== undefined) {
              setTotalRecords(result.recordsTotal);
              setTotalPages(Math.ceil(result.recordsTotal / entriesCount) || 1);
            }
          } else {
            setTemplatesData([]);
          }
        } else {
          throw new Error("Expected JSON response but got something else");
        }
      } catch (err) {
        console.error("Error fetching templates:", err);
        setTemplatesData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [currentPage, entriesCount]);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, '...', totalPages);
      } else if (currentPage >= totalPages - 1) {
        pages.push(1, '...', totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return pages;
  };

  const handlePreview = async (id) => {
    setPreviewLoading(true);
    setSelectedTemplate({ loading: true });
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp/templates/view/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (result.success && result.data.__data?.template) {
          setSelectedTemplate(result.data.__data.template);
        } else {
          alert("Could not load template details");
          setSelectedTemplate(null);
        }
      } else {
        throw new Error("Expected JSON response but got something else");
      }
    } catch (err) {
      console.error("Error fetching template details:", err);
      alert("Failed to load template details. Server error.");
      setSelectedTemplate(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async (tpl) => {
    if (!window.confirm(`Are you sure you want to delete the template "${tpl.template_name}"?`)) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp/templates/delete`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ templateIdOrUid: tpl._uid || tpl._id })
      });
      const result = await response.json();
      if (result.success) {
        setTemplatesData(prev => prev.filter(t => t._id !== tpl._id));
      } else {
        alert(result.message || "Failed to delete template");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting template");
    }
  };

  return (
    <div style={{ width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--wa-green)', margin: 0 }}>
          WhatsApp Templates
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 600 }}
            onClick={() => navigate('/dashboard/whatsapp-templates/create')}
          >
            Create New Template
          </button>
          <button className="btn btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', width: 'auto' }}>Sync WhatsApp Templates</button>
          <button className="btn btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '0.35rem', alignItems: 'center', width: 'auto' }}>Manage Templates on Meta <ExternalLink size={14} /></button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: '1.5rem' }}>

        {/* Table Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Show
            <select
              value={entriesCount}
              onChange={(e) => setEntriesCount(Number(e.target.value))}
              style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Search:
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name or category..."
                className="form-input"
                style={{ padding: '0.35rem 0.75rem', width: '200px', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Language</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Template ID</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Loading templates...</td></tr>
              ) : filteredTemplates.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>No templates found.</td></tr>
              ) : filteredTemplates.map((tpl, idx) => {
                return (
                  <tr key={idx} className="data-table-row">
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>{tpl.template_name}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>{tpl.language}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>{tpl.category}</span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--wa-green)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: tpl.status === 'APPROVED' ? 'rgba(37, 211, 102, 0.1)' : '#fef08a', padding: '0.25rem 0.6rem', borderRadius: '12px', width: 'fit-content', color: tpl.status === 'APPROVED' ? 'var(--wa-green)' : '#854d0e' }}>
                        <CheckCircle2 size={14} /> {tpl.status}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>{tpl.template_id}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button 
                          style={{ backgroundColor: 'var(--wa-green)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37, 211, 102, 0.2)', transition: 'transform 0.1s' }} 
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'} 
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                          onClick={() => navigate('/dashboard/campaigns/create', { state: { selectedTemplate: tpl } })}
                        >
                          <Megaphone size={14} /> Campaign
                        </button>
                        <button className="icon-action-btn" title="Preview" onClick={() => handlePreview(tpl._id)}>
                          <Eye size={16} />
                        </button>
                        {tpl.status !== 'PENDING' && tpl.status !== 'IN_APPEAL' ? (
                          <button className="icon-action-btn" title="Edit" onClick={() => navigate('/dashboard/whatsapp-templates/create', { state: { editTemplateId: tpl._id } })}>
                            <Edit size={16} />
                          </button>
                        ) : (
                          <button className="icon-action-btn" title="Template under review (Cannot edit)" style={{ opacity: 0.3, cursor: 'not-allowed' }}>
                            <Edit size={16} />
                          </button>
                        )}
                        <button className="icon-action-btn delete" title="Delete" onClick={() => handleDelete(tpl)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing {templatesData.length > 0 ? (currentPage - 1) * entriesCount + 1 : 0} to {Math.min(currentPage * entriesCount, totalRecords)} of {totalRecords} entries
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '0.35rem 0.75rem', border: '1px solid #e2e8f0', backgroundColor: currentPage === 1 ? '#f8fafc' : 'white', color: currentPage === 1 ? '#94a3b8' : '#334155', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Prev
            </button>
            
            {getPageNumbers().map((num, idx) => (
              <button
                key={idx}
                onClick={() => typeof num === 'number' && setCurrentPage(num)}
                disabled={num === '...'}
                style={{
                  padding: '0.35rem 0.75rem',
                  border: num === '...' ? 'none' : '1px solid #e2e8f0',
                  backgroundColor: currentPage === num ? 'var(--wa-green)' : 'white',
                  color: currentPage === num ? 'white' : '#334155',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: currentPage === num ? 600 : 500,
                  cursor: num === '...' ? 'default' : 'pointer'
                }}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{ padding: '0.35rem 0.75rem', border: '1px solid #e2e8f0', backgroundColor: currentPage === totalPages || totalPages === 0 ? '#f8fafc' : 'white', color: currentPage === totalPages || totalPages === 0 ? '#94a3b8' : '#334155', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* Preview Modal */}
      {selectedTemplate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#efeae2', width: '480px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ backgroundColor: '#075e54', padding: '1rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Message Preview</span>
              <button onClick={() => setSelectedTemplate(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'cover' }}>
              <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '8px', borderTopLeftRadius: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                {previewLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading preview...</div>
                ) : selectedTemplate.components ? (
                  selectedTemplate.components.map((c, i) => {
                    if (c.type === 'HEADER' && c.format === 'IMAGE') {
                      const placeholderSVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' preserveAspectRatio='xMidYMid slice' viewBox='0 0 24 24' fill='%23e2e8f0'%3E%3Crect width='24' height='24' fill='%23cbd5e1' /%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z' fill='%2394a3b8'/%3E%3Ccircle cx='8' cy='8' r='2' fill='%2394a3b8'/%3E%3C/svg%3E";
                      const imgSrc = c.example?.header_handle?.[0] || c.example?.header_url?.[0] || placeholderSVG;
                      return <img key={i} src={imgSrc} alt="Header" style={{ width: '100%', borderRadius: '4px', marginBottom: '0.5rem', objectFit: 'cover', aspectRatio: '1.5/1' }} onError={(e) => { e.target.onerror = null; e.target.src = placeholderSVG; }} />;
                    }
                    if (c.type === 'HEADER' && c.format === 'TEXT') {
                      return <div key={i} style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#111b21', whiteSpace: 'nowrap' }}>{c.text}</div>;
                    }
                    if (c.type === 'BODY') {
                      return <div key={i} style={{ fontSize: '0.9rem', color: '#111b21', whiteSpace: 'pre-wrap', marginBottom: '0.5rem', wordBreak: 'break-word', lineHeight: '1.4' }}>{c.text}</div>;
                    }
                    if (c.type === 'BUTTONS') {
                      return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.5rem', borderTop: '1px solid #e9edef', paddingTop: '0.5rem' }}>
                          {c.buttons.map((b, bi) => (
                            <div key={bi} style={{ color: '#00a884', textAlign: 'center', fontSize: '0.9rem', fontWeight: 500, padding: '0.5rem 0' }}>
                              {b.type === 'URL' ? <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem' }}><ExternalLink size={14} /> {b.text}</span> : b.text}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>No components to display</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Temporary inline ChevronDown icon because we imported it in previous components but didn't here explicitly.
const ChevronDown = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

