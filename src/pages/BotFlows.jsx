import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, GitBranch, Search, ChevronLeft, ChevronRight } from 'lucide-react';


export default function BotFlows() {
  const [entriesCount, setEntriesCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    trigger: '',
    webhookUrl: '',
    status: 'Inactive'
  });

  const [flowsData, setFlowsData] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchBots = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/botlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ page: currentPage, limit: entriesCount })
        });
        const result = await response.json();

        if (result.success && result.data) {
          // Handle both array and single object response
          const rawData = Array.isArray(result.data) ? result.data : [result.data];

          const formatted = rawData.map(bot => ({
            id: bot._id || bot.id,
            title: bot.title || 'Untitled Bot',
            trigger: bot.start_trigger || '-',
            status: bot.status === 1 ? 'Active' : 'Inactive',
            uid: bot._uid,
            vendorUid: bot.vendorUid,
            webhookUrl: bot.reply_webhook_url || ''
          }));

          setFlowsData(formatted);
          
          if (result.pagination) {
            setTotalRecords(result.pagination.total || result.recordsTotal || 0);
            setTotalPages(result.pagination.total_pages || 1);
          } else if (result.recordsTotal !== undefined) {
            setTotalRecords(result.recordsTotal);
            setTotalPages(Math.ceil(result.recordsTotal / entriesCount));
          } else {
            setTotalRecords(formatted.length);
            setTotalPages(1);
          }
        }
      } catch (err) {
        console.error("Error fetching bots:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBots();
  }, [currentPage, entriesCount]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesCount]);


  const handleOpenFlowBuilder = (flow) => {

    console.log("FLOW DATA:", flow);

    if (!flow.uid) {
      alert("Bot flow uid missing");
      return;
    }

    if (!flow.vendorUid) {
      alert("Vendor uid missing");
      return;
    }

    localStorage.setItem('bot_flow_uid', flow.uid);
    localStorage.setItem('vendor_uid', flow.vendorUid);

    console.log("Saved to localStorage:", {
      bot_flow_uid: flow.uid,
      vendor_uid: flow.vendorUid
    });
  };
  // const handleOpenFlowBuilder = (flow) => {
  //   if (flow.uid) {
  //     localStorage.setItem('bot_flow_uid', flow.uid);
  //   }
  //   if (flow.vendorUid) {
  //     localStorage.setItem('vendor_uid', flow.vendorUid);
  //   }
  // };

  const handleOpenModal = (mode, flow = null) => {
    setModalMode(mode);
    if (mode === 'edit' && flow) {
      setFormData({
        id: flow.id,
        title: flow.title,
        trigger: flow.trigger,
        webhookUrl: flow.webhookUrl || '',
        status: flow.status
      });
    } else {
      setFormData({
        id: null,
        title: '',
        trigger: '',
        webhookUrl: '',
        status: 'Inactive'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusToggle = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'Active' ? 'Inactive' : 'Active'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/bot/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            title: formData.title,
            start_trigger: formData.trigger,
            reply_webhook_url: formData.webhookUrl
          })
        });
        const result = await response.json();
        if (result.success || response.ok) {
          const newBot = result.data || {};
          const newFlow = {
            id: newBot._id || newBot.id || Date.now(),
            title: newBot.title || formData.title,
            trigger: newBot.start_trigger || formData.trigger,
            webhookUrl: newBot.reply_webhook_url || formData.webhookUrl,
            status: newBot.status === 1 ? 'Active' : 'Inactive',
            uid: newBot._uid || '',
            vendorUid: newBot.vendorUid || ''
          };
          setFlowsData([newFlow, ...flowsData]);
          handleCloseModal();
        } else {
          alert(result.message || 'Error creating bot flow');
        }
      } catch (err) {
        console.error(err);
        alert('Error creating bot flow');
      }
    } else {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/bot/update/${formData.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            title: formData.title,
            start_trigger: formData.trigger,
            reply_webhook_url: formData.webhookUrl
          })
        });
        const result = await response.json();
        if (result.success || response.ok) {
          setFlowsData(flowsData.map(f =>
            f.id === formData.id
              ? { ...f, title: formData.title, trigger: formData.trigger, webhookUrl: formData.webhookUrl, status: formData.status }
              : f
          ));
          handleCloseModal();
        } else {
          alert(result.message || 'Error updating bot flow');
        }
      } catch (err) {
        console.error(err);
        alert('Error updating bot flow');
      }
    }
  };

  const deleteBotFlow = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bot flow?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/bot/delete/${id}`, {
        method: 'POST', // standard in this project, but we use it since most deletes are POST
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success || response.ok) {
        setFlowsData(flowsData.filter(f => f.id !== id));
      } else {
        alert(result.message || 'Error deleting bot flow');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting bot flow');
    }
  };

  const filteredFlows = flowsData.filter(flow =>
    flow.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flow.trigger.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#22c55e', margin: 0 }}>
          Bot Flows
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => handleOpenModal('add')}
            style={{
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.6rem 1.25rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
          >
            Add New Bot Flow
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>

        {/* Table Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
            Show
            <select
              value={entriesCount}
              onChange={(e) => setEntriesCount(Number(e.target.value))}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: 'white', outline: 'none' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
            Search:
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem',
                  width: '240px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ borderRadius: '8px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</th>
                <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Start Trigger Subject</th>
                <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading bot flows...</td></tr>
              ) : filteredFlows.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No bot flows found.</td></tr>
              ) : filteredFlows.map((flow, idx) => (
                <tr key={flow.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                  <td style={{ padding: '1.25rem 1rem', fontSize: '0.95rem', color: '#334155', fontWeight: 500 }}>{flow.title}</td>
                  <td style={{ padding: '1.25rem 1rem', fontSize: '0.9rem', color: '#64748b', maxWidth: '400px' }}>{flow.trigger}</td>
                  <td style={{ padding: '1.25rem 1rem', fontSize: '0.9rem', color: '#64748b' }}>{flow.status}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={() => handleOpenModal('edit', flow)}
                        style={{
                          backgroundColor: '#1e293b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.4rem 0.75rem',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button onClick={() => deleteBotFlow(flow.id)} style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer'
                      }}>
                        <Trash2 size={14} /> Delete
                      </button>
                      <Link to="/dashboard/chatflow" style={{ textDecoration: 'none' }}>
                        <button
                          onClick={() => handleOpenFlowBuilder(flow)}
                          style={{
                            backgroundColor: '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            cursor: 'pointer'
                          }}
                        >
                          <GitBranch size={14} /> Flow Builder
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Showing {totalRecords === 0 ? 0 : (currentPage - 1) * entriesCount + 1} to {Math.min(currentPage * entriesCount, totalRecords)} of {totalRecords} entries
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: currentPage === 1 ? '#f8fafc' : 'white', color: currentPage === 1 ? '#cbd5e1' : '#64748b', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Simple pagination display logic to show up to 5 pages
              let startPage = Math.max(1, currentPage - 2);
              if (startPage + 4 > totalPages) {
                startPage = Math.max(1, totalPages - 4);
              }
              return startPage + i;
            }).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '4px',
                  border: currentPage === pageNum ? 'none' : '1px solid #e2e8f0',
                  backgroundColor: currentPage === pageNum ? '#22c55e' : 'white',
                  color: currentPage === pageNum ? 'white' : '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={currentPage >= totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: currentPage >= totalPages || totalPages === 0 ? '#f8fafc' : 'white', color: currentPage >= totalPages || totalPages === 0 ? '#cbd5e1' : '#64748b', cursor: currentPage >= totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '700px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#334155', margin: 0 }}>
                {modalMode === 'add' ? 'Add New Bot Flow' : 'Edit Bot Flow'}
              </h2>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter title"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                  Start Trigger Subject
                </label>
                <input
                  type="text"
                  name="trigger"
                  value={formData.trigger}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter trigger subject"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                  Webhook URL
                </label>
                <input
                  type="url"
                  name="webhookUrl"
                  value={formData.webhookUrl}
                  onChange={handleInputChange}
                  placeholder="Enter webhook URL"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
              </div>

              {modalMode === 'edit' && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    onClick={handleStatusToggle}
                    style={{
                      width: '44px',
                      height: '24px',
                      backgroundColor: formData.status === 'Active' ? '#22c55e' : '#e2e8f0',
                      borderRadius: '12px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '3px',
                      left: formData.status === 'Active' ? '23px' : '3px',
                      transition: 'left 0.2s'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#475569' }}>Status</span>
                </div>
              )}

              {/* Modal Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1rem'
              }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.6rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    backgroundColor: '#64748b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.6rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

