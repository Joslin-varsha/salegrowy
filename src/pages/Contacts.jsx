import { API_BASE_URL } from '../config';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Upload, CheckSquare, Trash2, Info, Edit, MessageSquare, MessageCircle, MoreVertical, RefreshCw } from 'lucide-react';
import { message } from 'antd';
import { decryptData } from "../utils/encryption";


export default function Contacts() {
  const navigate = useNavigate();
  const [entriesCount, setEntriesCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);


  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewContactDetails, setViewContactDetails] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/list`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page: currentPage, limit: entriesCount })
      });

      if (!response.ok) {
        throw new Error("API error");
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (result.success) {
          setContacts(result.data);
          if (result.pagination) {
            setTotalRecords(result.pagination.total || 0);
            setTotalPages(result.pagination.total_pages || 1);
          } else if (result.recordsTotal !== undefined) {
            setTotalRecords(result.recordsTotal);
            setTotalPages(Math.ceil(result.recordsTotal / entriesCount) || 1);
          }
        } else {
          setContacts([]);
        }
      } else {
        throw new Error("Expected JSON response but got something else");
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/groups`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) return;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (result?.success) setGroups(result.data);
      }
    } catch (err) { console.error("Error fetching contact groups", err); }
  };

  useEffect(() => {
    fetchContacts();
    fetchGroups();
  }, [currentPage, entriesCount]);

  const handleSyncCustomers = async () => {
    try {
      setSyncLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/vendor/sync-customers`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      const decrypted = decryptData(data?.payload);
      if (decrypted) {
        message.success(
          decrypted.message ||
          'Customer sync job successfully queued'
        );
      }
      await fetchContacts();
    } catch (error) {
      console.error('Sync customers error:', error);
      message.error('Failed to sync customers');
    } finally {
      setSyncLoading(false);
    }
  };

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

  const deleteSelected = (index) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
  };

  const deleteBulk = () => {
    const updated = contacts.filter((_, i) => !selected.includes(i));
    setContacts(updated);
    setSelected([]);
  };

  const assignGroup = async () => {
    if (!selectedGroup || selected.length === 0) return;
    try {
      const updated = [...contacts];
      selected.forEach(idx => {
        const gName = groups.find(g => g._id.toString() === selectedGroup)?.title || selectedGroup;
        const existingGroups = updated[idx].groups ? updated[idx].groups.split(',').map(s => s.trim()) : [];
        if (!existingGroups.includes(gName)) {
          existingGroups.push(gName);
        }
        updated[idx].groups = existingGroups.join(', ');
      });
      setContacts(updated);
      setShowGroupModal(false);
      setSelectedGroup('');
      setSelected([]);
    } catch (err) { console.error(err); }
  };

  const handleView = async (contact) => {
    if (!contact) return;
    const id = contact._id;
    setViewLoading(true);
    setShowViewModal(true);

    // Immediately set data from the list so the user sees real data instantly
    setViewContactDetails(contact);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/view/${id}`, {
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
          // Merge API data (which might have Address/Website) with existing list data
          setViewContactDetails(prev => ({ ...prev, ...result.data }));
        }
      }
    } catch (err) {
      console.error("Error fetching extra contact details:", err);
      // We still keep the list data showing even if the API fetch fails
    } finally {
      setViewLoading(false);
    }
  };


  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact =>
    (contact.first_name || contact.first_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.last_name || contact.last_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.phone_number || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <p>Loading contacts...</p>;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--wa-green)', margin: 0 }}>
          Contacts
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={handleSyncCustomers}
            disabled={syncLoading}
          >
            <RefreshCw size={14} className={syncLoading ? "animate-spin" : ""} />
            {syncLoading ? 'Syncing...' : 'Sync All Customers'}
          </button>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600 }}
            onClick={() => navigate('/dashboard/contacts/create')}
          >
            Create New Contact
          </button>
          <button
            className="btn btn-secondary"
            style={{ backgroundColor: '#1e293b', color: 'white', border: 'none', width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600 }}
          >
            Export Contacts
          </button>
          <button
            className="btn btn-secondary"
            style={{ backgroundColor: '#1e293b', color: 'white', border: 'none', width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600 }}
          >
            Import Contacts
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button style={{ backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '4px', cursor: 'pointer' }} onClick={() => {
          if (selected.length === filteredContacts.length && filteredContacts.length > 0) {
            setSelected([]);
          } else {
            setSelected(filteredContacts.map((_, i) => i));
          }
        }}>
          Select All
        </button>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => selected.length > 0 && setShowBulkDropdown(!showBulkDropdown)}
            style={{
              backgroundColor: '#f43f5e',
              color: 'white',
              border: 'none',
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '4px',
              cursor: selected.length > 0 ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              opacity: selected.length > 0 ? 1 : 0.5,
              pointerEvents: selected.length > 0 ? 'auto' : 'none'
            }}
          >
            Bulk Actions <span style={{ fontSize: '0.6rem' }}>▼</span>
          </button>
          {showBulkDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '280px', overflow: 'hidden' }}>
              <button onClick={() => { deleteBulk(); setShowBulkDropdown(false); }} style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#1e293b', whiteSpace: 'nowrap' }} onMouseEnter={e => e.target.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}>
                Delete Selected Contacts
              </button>
              <button onClick={() => { setShowGroupModal(true); setShowBulkDropdown(false); }} style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#1e293b', whiteSpace: 'nowrap' }} onMouseEnter={e => e.target.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}>
                Assign Group to Selected Contacts
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: '0', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden', backgroundColor: '#ffffff' }}>

        {/* Table Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
            Show
            <select style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.25rem 0.5rem', color: '#334155', appearance: 'auto', backgroundColor: '#fff' }} value={entriesCount} onChange={(e) => { setEntriesCount(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            entries
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
            Search:
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name or phone..."
              style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.35rem 0.5rem', width: '200px', outline: 'none' }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 0 #e2e8f0' }}>
              <tr>
                <th style={{ padding: '0.5rem 0.25rem', width: '30px', textAlign: 'center' }}><span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SEL</span></th>
                <th style={{ padding: '0.5rem 0.25rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>First Name</th>
                <th style={{ padding: '0.5rem 0.25rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Name</th>
                <th style={{ padding: '0.5rem 0.25rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mobile</th>
                <th style={{ padding: '0.5rem 0.25rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lang</th>
                <th style={{ padding: '0.5rem 0.25rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '100px' }}>Created On</th>
                <th style={{ padding: '0.5rem 0.25rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Groups</th>
                <th style={{ padding: '0.5rem 0.25rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tags</th>
                <th style={{ padding: '0.5rem 0.25rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Marketing</th>
                <th style={{ padding: '0.5rem 0.25rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact, idx) => (
                <tr key={idx} className="data-table-row">
                  <td style={{ padding: '0.35rem 0.25rem', textAlign: 'center' }}><input type="checkbox" checked={selected.includes(idx)} onChange={() => {
                    if (selected.includes(idx)) {
                      setSelected(selected.filter(i => i !== idx));
                    } else {
                      setSelected([...selected, idx]);
                    }
                  }} style={{ cursor: 'pointer', margin: 0 }} /></td>
                  <td style={{ padding: '0.35rem 0.25rem', fontSize: '0.7rem', color: '#1e293b', fontWeight: 500 }}>{contact.first_name || contact.first_Name}</td>
                  <td style={{ padding: '0.35rem 0.25rem', fontSize: '0.7rem', color: '#1e293b', fontWeight: 500 }}>{contact.last_name || contact.last_Name}</td>
                  <td style={{ padding: '0.35rem 0.25rem', fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap' }}>{contact.phone_number}</td>
                  <td style={{ padding: '0.35rem 0.25rem', fontSize: '0.7rem', color: '#64748b' }}>{contact.language_code}</td>
                  <td style={{ padding: '0.35rem 0.25rem', fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(contact.created_at).toLocaleString()}</td>
                  <td style={{ padding: '0.35rem 0.25rem', fontSize: '0.7rem', color: '#64748b' }}>
                    {Array.isArray(contact.groups)
                      ? contact.groups.map(g => typeof g === 'object' ? g.title : g).join(', ')
                      : (contact.groups || '')}
                  </td>
                  <td style={{ padding: '0.35rem 0.25rem', fontSize: '0.7rem', color: '#64748b' }}>{contact.tags}</td>
                  <td style={{ padding: '0.35rem 0.25rem', fontSize: '0.7rem', color: '#64748b' }}>
                    <span style={{ backgroundColor: contact.marketing === 'Opted In' ? 'rgba(37, 211, 102, 0.1)' : '#f1f5f9', color: contact.marketing === 'Opted In' ? 'var(--wa-green)' : '#64748b', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600 }}>{contact.whatsapp_opt_out_text}</span>
                  </td>
                  <td style={{ padding: '0.35rem 0.25rem', position: 'relative' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#64748b' }} onClick={() => setActionMenuOpen(actionMenuOpen === idx ? null : idx)}>
                      <MoreVertical size={16} />
                    </button>
                    {actionMenuOpen === idx && (
                      <div style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '0.5rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, display: 'flex', flexDirection: 'column', minWidth: '180px', overflow: 'hidden' }} onMouseLeave={() => setActionMenuOpen(null)}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#1e293b' }} onClick={() => { handleView(contact); setActionMenuOpen(null); }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <Info size={14} /> Details
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#1e293b' }} onClick={() => setActionMenuOpen(null)} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <Edit size={14} /> Edit
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#22c55e' }} onClick={() => setActionMenuOpen(null)} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <MessageSquare size={14} /> Send Template Message
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#22c55e' }} onClick={() => setActionMenuOpen(null)} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <MessageCircle size={14} /> Chat
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#f43f5e', borderTop: '1px solid #f1f5f9' }} onClick={() => { deleteSelected(idx); setActionMenuOpen(null); }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8d7da'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', padding: '0 1.5rem 1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing {contacts.length > 0 ? (currentPage - 1) * entriesCount + 1 : 0} to {Math.min(currentPage * entriesCount, totalRecords)} of {totalRecords} entries
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

      {/* Assign Group Modal */}
      {showGroupModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '600px', maxWidth: '90%', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>

            {/* Modal Header */}
            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#475569', fontWeight: 600 }}>Assign Groups to Selected Contacts</h3>
              <button
                onClick={() => setShowGroupModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem 1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Groups</label>
              <div style={{ position: 'relative' }}>
                <select
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', appearance: 'none', backgroundColor: '#fff', outline: 'none' }}
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  <option value="">Select Groups</option>
                  {groups.map(g => (
                    <option key={g._id} value={g._id.toString()}>{g.title}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8', fontSize: '0.6rem' }}>▼</div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={assignGroup}
                style={{ padding: '0.6rem 1.5rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                disabled={!selectedGroup}
              >
                Submit
              </button>
              <button
                onClick={() => setShowGroupModal(false)}
                style={{ padding: '0.6rem 1.5rem', background: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Contact Modal */}
      {showViewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '800px', maxWidth: '95%', maxHeight: '95vh', overflowY: 'auto', position: 'relative' }}>

            {/* Modal Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#64748b', fontWeight: 500 }}>Contact Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1' }}
              >
                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>

            <div style={{ padding: '2rem' }}>
              {viewLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading details...</div>
              ) : viewContactDetails ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                  {/* Basic Info Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="view-field">
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>First Name:</label>
                      <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewContactDetails.first_name || viewContactDetails.first_Name || '-'}</div>
                    </div>
                    <div className="view-field">
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Last Name:</label>
                      <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{(viewContactDetails.last_name !== " " && viewContactDetails.last_name) || viewContactDetails.last_Name || "-"}</div>
                    </div>
                    <div className="view-field">
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Country:</label>
                      <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewContactDetails.country || viewContactDetails.countries__id || '-'}</div>
                    </div>
                    <div className="view-field">
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Mobile Number:</label>
                      <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewContactDetails.phone_number || '-'}</div>
                    </div>
                    <div className="view-field">
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Language Code:</label>
                      <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewContactDetails.language_code || '-'}</div>
                    </div>
                    <div className="view-field">
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Email:</label>
                      <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewContactDetails.email || '-'}</div>
                    </div>
                  </div>

                  {/* Groups Section */}
                  <div style={{ position: 'relative', marginTop: '1rem', border: '1px solid #eef2ff', borderRadius: '8px', padding: '1.5rem' }}>
                    <div style={{ position: 'absolute', top: '-14px', left: '15px', backgroundColor: 'white', padding: '0 0.75rem', border: '1px solid #eef2ff', borderRadius: '4px', fontSize: '0.85rem', color: '#818cf8', fontWeight: 500 }}>
                      Groups
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(() => {
                        const groupsVal = viewContactDetails.groups;
                        if (!groupsVal || (Array.isArray(groupsVal) && groupsVal.length === 0)) {
                          return <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>No groups assigned</span>;
                        }

                        const groupsArray = Array.isArray(groupsVal)
                          ? groupsVal
                          : (typeof groupsVal === 'string' ? groupsVal.split(',') : [groupsVal]);

                        return groupsArray.map((g, i) => {
                          const name = typeof g === 'object' ? (g.title || g.name || 'Unknown') : String(g).trim();
                          if (!name) return null;
                          return (
                            <span key={i} style={{ backgroundColor: '#94a3b8', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                              {name}
                            </span>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Other Information Section */}
                  <div style={{ position: 'relative', marginTop: '1rem', border: '1px solid #eef2ff', borderRadius: '8px', padding: '1.5rem' }}>
                    <div style={{ position: 'absolute', top: '-14px', left: '15px', backgroundColor: 'white', padding: '0 0.75rem', border: '1px solid #eef2ff', borderRadius: '4px', fontSize: '0.85rem', color: '#818cf8', fontWeight: 500 }}>
                      Other Information
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                      <div className="view-field">
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Address:</label>
                        <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewContactDetails.address || '-'}</div>
                      </div>
                      <div className="view-field">
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Website:</label>
                        <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewContactDetails.website || '-'}</div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#f43f5e' }}>Details could not be loaded.</div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowViewModal(false)}
                style={{ padding: '0.6rem 1.5rem', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

