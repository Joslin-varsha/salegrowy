import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { History, ChevronDown, Download, Search, Info, Eye } from 'lucide-react';



export default function MessageLog() {
  const [entriesCount, setEntriesCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Filter states
  const [messageType, setMessageType] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeFilters, setActiveFilters] = useState({ messageType: 'All', statusFilter: 'All', startDate: '', endDate: '' });


  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/message-log/list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ page: currentPage, limit: entriesCount })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const result = await response.json();
          if (result.success && result.data) {
            setLogs(result.data);
            if (result.pagination) {
              setTotalRecords(result.pagination.total || result.recordsTotal || 0);
              setTotalPages(result.pagination.total_pages || 1);
            } else if (result.recordsTotal !== undefined) {
              setTotalRecords(result.recordsTotal);
              setTotalPages(Math.ceil(result.recordsTotal / entriesCount));
            } else {
              setTotalRecords(result.data.length);
              setTotalPages(1);
            }
          } else {
            setLogs([]);
            setTotalRecords(0);
            setTotalPages(1);
          }
        } else {
          throw new Error("Expected JSON response but got something else");
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
        setLogs([]);
        setTotalRecords(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [currentPage, entriesCount]);

  const handleView = async (id) => {
    if (!id) return;
    setViewLoading(true);
    setShowViewModal(true);
    setSelectedLog(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/message-log/view/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (result.success) {
          setSelectedLog(result.data);
        } else {
          alert("Failed to load message details");
          setShowViewModal(false);
        }
      } else {
        throw new Error("Expected JSON response but got something else");
      }
    } catch (err) {
      console.error("Error fetching message details:", err);
      alert("Failed to load message details. Server error.");
      setShowViewModal(false);
    } finally {
      setViewLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters, entriesCount]);

  const filteredLogs = logs.filter(log => {
    // Search filter
    const matchesSearch =
      (log.recipient || log.contact_id || log.to || log.phone_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.last_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Message type filter
    const matchesType = activeFilters.messageType === 'All' ||
      (activeFilters.messageType === 'Incoming' && log.is_incoming_message) ||
      (activeFilters.messageType === 'Outgoing' && !log.is_incoming_message);

    // Status filter
    const matchesStatus = activeFilters.statusFilter === 'All' ||
      (log.status || '').toLowerCase() === activeFilters.statusFilter.toLowerCase();

    // Date range filter
    const logDate = log.created_at ? new Date(log.created_at) : null;
    const matchesStart = !activeFilters.startDate || (logDate && logDate >= new Date(activeFilters.startDate));
    const matchesEnd = !activeFilters.endDate || (logDate && logDate <= new Date(activeFilters.endDate + 'T23:59:59'));

    return matchesSearch && matchesType && matchesStatus && matchesStart && matchesEnd;
  });

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

  return (
    <div style={{ width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--wa-green)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          Message Log
        </h1>
        
      </div>

      {/* Filters Card */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', maxWidth: '1000px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '1rem', alignItems: 'flex-end' }}>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }}>Select Message Type</label>
            <div style={{ position: 'relative' }}>
              <select className="form-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', appearance: 'none' }} value={messageType} onChange={e => setMessageType(e.target.value)}>
                <option>All</option>
                <option>Outgoing</option>
                <option>Incoming</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }}>Status</label>
            <div style={{ position: 'relative' }}>
              <select className="form-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', appearance: 'none' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option>All</option>
                <option>Read</option>
                <option>Failed</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }}>Start Date</label>
            <input type="date" className="form-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }}>End Date</label>
            <input type="date" className="form-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <button className="btn btn-primary" style={{ padding: '0.4rem 1.5rem', height: '100%', fontSize: '0.85rem' }}
              onClick={() => setActiveFilters({ messageType, statusFilter, startDate, endDate })}>
              Show
            </button>
          </div>

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
              <option value={20}>20</option>
              <option value={50}>50</option>
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
                placeholder="Recipient or name..."
                className="form-input"
                style={{ padding: '0.35rem 0.75rem', width: '200px', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: '#ffffff' }}>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Recipient</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>From</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Messaged At</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Via</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center' }}>Loading message logs...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center' }}>No logs found.</td></tr>
              ) : filteredLogs.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {log.recipient || log.contact_id || log.to || log.phone_number}
                    {log.first_name ? <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>{log.first_name} {log.last_name}</div> : null}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{log.from_number || log.from || (log.is_incoming_message ? log.phone_number : 'System')}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{log.created_at ? new Date(log.created_at).toLocaleString() : log.time}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.type || (log.campaign_name ? 'Campaign' : 'Direct Message')}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.via || log.campaign_name || '-'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span style={{ textTransform: 'capitalize', padding: '0.2rem 0.5rem', backgroundColor: log.status === 'read' ? '#dcfce7' : '#f1f5f9', color: log.status === 'read' ? '#16a34a' : '#64748b', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleView(log._id || log.id)} style={{
                        backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px',
                        padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'
                      }}>
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing {totalRecords === 0 ? 0 : (currentPage - 1) * entriesCount + 1} to {Math.min(currentPage * entriesCount, totalRecords)} of {totalRecords} entries
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border-color)', backgroundColor: currentPage === 1 ? '#f8fafc' : '#ffffff', color: currentPage === 1 ? '#94a3b8' : 'var(--text-primary)', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Prev
            </button>
            {getPageNumbers().map((pageNum, idx) => (
              <button
                key={idx}
                disabled={pageNum === '...'}
                onClick={() => pageNum !== '...' && setCurrentPage(pageNum)}
                style={{
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: currentPage === pageNum ? 'var(--wa-green)' : 'var(--border-color)',
                  backgroundColor: currentPage === pageNum ? 'var(--wa-green)' : '#ffffff',
                  color: currentPage === pageNum ? '#ffffff' : 'var(--text-primary)',
                  borderRadius: '4px',
                  cursor: pageNum === '...' ? 'default' : 'pointer',
                  minWidth: '32px'
                }}
              >
                {pageNum}
              </button>
            ))}
            <button
              disabled={currentPage >= totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border-color)', backgroundColor: currentPage >= totalPages || totalPages === 0 ? '#f8fafc' : '#ffffff', color: currentPage >= totalPages || totalPages === 0 ? '#94a3b8' : 'var(--text-primary)', borderRadius: '4px', cursor: currentPage >= totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* View Message Modal */}
      {showViewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>Message Details</h3>

            {viewLoading ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>Loading details...</p>
            ) : selectedLog ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Message ID</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedLog._id || selectedLog.id || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Type</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedLog.type || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Status</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedLog.status || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Date</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString() : '-'}</span>
                </div>
                {selectedLog.message && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Content</span>
                    <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap' }}>
                      {selectedLog.message}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: '#ef4444', textAlign: 'center' }}>Details could not be loaded.</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowViewModal(false)} style={{ padding: '0.5rem 1.5rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

