import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Archive, Info } from 'lucide-react';



export default function Campaigns() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Active');
  const [entriesCount, setEntriesCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);


  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/campaign/list`, {
          method: 'POST', // Assuming POST because of your { "page": 1 } payload body in MessageLog, adjust if GET
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ page: currentPage, limit: entriesCount })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const result = await response.json();
          if (result.success && result.data) {
            // Adding a local archived flag for UI toggling
            const loaded = result.data.map(c => ({ ...c, archived: false }));
            setCampaigns(loaded);
            if (result.pagination) {
              setTotalRecords(result.pagination.total || result.recordsTotal || 0);
              setTotalPages(result.pagination.total_pages || 1);
            } else if (result.recordsTotal !== undefined) {
              setTotalRecords(result.recordsTotal);
              setTotalPages(Math.ceil(result.recordsTotal / entriesCount));
            } else {
              setTotalRecords(loaded.length);
              setTotalPages(1);
            }
          } else {
            setCampaigns([]);
            setTotalRecords(0);
            setTotalPages(1);
          }
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setCampaigns([]);
        setTotalRecords(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, [currentPage, entriesCount]);

  const handleArchive = (index) => {
    const updated = [...campaigns];
    updated[index].archived = true;
    setCampaigns(updated);
  };

  const handleView = async (id) => {
    if (!id) return;
    setViewLoading(true);
    setShowViewModal(true);
    setSelectedCampaign(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/campaign/view/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error(`HTTP error!`);

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (result.success && result.data) {
          setSelectedCampaign(result.data);
        } else {
          alert("Failed to load campaign details");
          setShowViewModal(false);
        }
      }
    } catch (err) {
      console.error(err);
      setShowViewModal(false);
    } finally {
      setViewLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredCampaigns = campaigns.filter(c =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.template_name || c.template || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--wa-green)', margin: 0 }}>
          Campaigns
        </h1>
        <button
          className="btn btn-primary"
          style={{ width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 600 }}
          onClick={() => navigate('/dashboard/campaigns/create')}
        >
          Create New Campaign
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('Active')}
          style={{
            padding: '0.6rem 2rem',
            backgroundColor: activeTab === 'Active' ? '#ffffff' : '#e2e8f0',
            color: activeTab === 'Active' ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderBottom: activeTab === 'Active' ? 'none' : '1px solid var(--border-color)',
            borderRadius: '8px 8px 0 0',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('Archive')}
          style={{
            padding: '0.6rem 2rem',
            backgroundColor: activeTab === 'Archive' ? '#ffffff' : '#e2e8f0',
            color: activeTab === 'Archive' ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderBottom: activeTab === 'Archive' ? 'none' : '1px solid var(--border-color)',
            borderRadius: '8px 8px 0 0',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Archive
        </button>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: '1.5rem', borderTopLeftRadius: 0, marginTop: '-1rem' }}>

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
                placeholder="Title or template..."
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
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Title</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Template</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>No. of Contacts</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Created At</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Schedule At</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center' }}>Loading campaigns...</td></tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center' }}>No campaigns found.</td></tr>
              ) : (
                filteredCampaigns
                  .filter(c => activeTab === 'Active' ? !c.archived : c.archived)
                  .map((camp, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{camp.title}</td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{camp.template_name || camp.template}</td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{camp.contacts_count || camp.contacts}</td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {camp.created_at ? new Date(camp.created_at).toLocaleString() : camp.createdAt}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--wa-blue)' }}>
                        📅 {camp.scheduled_at ? new Date(camp.scheduled_at).toLocaleString() : camp.scheduleAt}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ backgroundColor: '#f97316', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                          {camp.campaign_status || camp.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleView(camp._id || camp.id)} style={{
                            backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '4px',
                            padding: '0.4rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                            display: 'flex', alignItems: 'center', gap: '0.3rem'
                          }}>
                            <Info size={12} /> Dashboard
                          </button>
                          <button onClick={() => handleArchive(idx)} style={{
                            backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px',
                            padding: '0.4rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer'
                          }}>
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
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

      {/* View Campaign Modal */}
      {showViewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>Campaign Progress</h3>

            {viewLoading ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>Loading details...</p>
            ) : selectedCampaign ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Title</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedCampaign.campaign?.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Template</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedCampaign.campaign?.template_name} ({selectedCampaign.campaign?.template_language})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Status</span>
                  <span style={{ fontWeight: 600, color: '#f97316', textTransform: 'uppercase' }}>{selectedCampaign.statusText}</span>
                </div>

                <h4 style={{ fontSize: '1rem', color: '#334155', marginTop: '1rem', marginBottom: '0.5rem' }}>Metrics</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Contacts</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{selectedCampaign.metrics?.totalContacts}</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>In Queue</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#eab308' }}>{selectedCampaign.metrics?.inQueuedCount}</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Delivered</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#22c55e' }}>{selectedCampaign.metrics?.totalDelivered} ({selectedCampaign.metrics?.totalDeliveredInPercent})</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Read</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>{selectedCampaign.metrics?.totalRead} ({selectedCampaign.metrics?.totalReadInPercent})</div>
                  </div>
                </div>
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

