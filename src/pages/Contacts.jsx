import { API_BASE_URL } from '../config';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Upload, CheckSquare, Trash2, Info, Edit, MessageSquare, MessageCircle, MoreVertical } from 'lucide-react';

export default function Contacts() {
  const navigate = useNavigate();
  const [entriesCount, setEntriesCount] = useState(100);

  
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

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/contact/list`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error("API error");
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const result = await response.json();
          if (result.success) {
            setContacts(result.data);
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
        const response = await fetch(`${API_BASE_URL}/api/contact/groups`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) return;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const result = await response.json();
          if (result?.success) setGroups(result.data);
        }
      } catch (err) { console.error("Error fetching contact groups", err); }
    };

    fetchContacts();
    fetchGroups();
  }, []);

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
  } catch(err) { console.error(err); }
};

const handleView = async (id) => {
  if (!id) return;
  setViewLoading(true);
  setShowViewModal(true);
  setViewContactDetails(null);
  try {
    const response = await fetch(`${API_BASE_URL}/api/contact/view/${id}`, {
      method:'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const result = await response.json();
      if (result.success) {
        setViewContactDetails(result.data);
      } else {
        alert("Failed to load contact details");
        setShowViewModal(false);
      }
    } else {
        throw new Error("Expected JSON response but got something else");
    }
  } catch(err) {
    console.error(err);
    setShowViewModal(false);
  } finally {
    setViewLoading(false);
  }
};


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
        <div style={{ display: 'flex', gap: '0.75rem' ,marginRight:'100px'}}>
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
  if (selected.length === contacts.length && contacts.length > 0) {
    setSelected([]);
  } else {
    setSelected(contacts.map((_, i) => i));
  }
}}>
          Select All
        </button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowBulkDropdown(!showBulkDropdown)} style={{ backgroundColor: '#f43f5e', color: 'white', border: 'none', padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Bulk Actions <span style={{ fontSize: '0.6rem' }}>▼</span>
          </button>
          {showBulkDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '150px' }}>
              <button onClick={() => { deleteBulk(); setShowBulkDropdown(false); }} style={{ display: 'block', width: '100%', padding: '0.5rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#1e293b' }} onMouseEnter={e => e.target.style.backgroundColor='#f1f5f9'} onMouseLeave={e => e.target.style.backgroundColor='transparent'}>
                Delete Selected
              </button>
              <button onClick={() => { setShowGroupModal(true); setShowBulkDropdown(false); }} style={{ display: 'block', width: '100%', padding: '0.5rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#1e293b' }} onMouseEnter={e => e.target.style.backgroundColor='#f1f5f9'} onMouseLeave={e => e.target.style.backgroundColor='transparent'}>
                Assign Group
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
            <select style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.25rem 0.5rem', color: '#334155', appearance: 'auto', backgroundColor: '#fff' }} value={entriesCount} onChange={(e) => setEntriesCount(Number(e.target.value))}>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select> 
            entries
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
            Search: 
            <input type="text" style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.35rem 0.5rem', width: '200px' }} />
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
              {contacts.map((contact, idx) => (
                <tr key={idx} className="data-table-row">
                  <td style={{ padding: '0.35rem 0.25rem', textAlign: 'center' }}><input type="checkbox"  checked={selected.includes(idx)} onChange={() => {
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
                  <td style={{ padding: '0.35rem 0.25rem', fontSize: '0.7rem', color: '#64748b' }}>{contact.groups}</td>
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
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#1e293b' }} onClick={() => { handleView(contact._id); setActionMenuOpen(null); }} onMouseEnter={e => e.currentTarget.style.backgroundColor='#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
                          <Info size={14} /> Details
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#1e293b' }} onClick={() => setActionMenuOpen(null)} onMouseEnter={e => e.currentTarget.style.backgroundColor='#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
                          <Edit size={14} /> Edit
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#22c55e' }} onClick={() => setActionMenuOpen(null)} onMouseEnter={e => e.currentTarget.style.backgroundColor='#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
                          <MessageSquare size={14} /> Send Template Message
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#22c55e' }} onClick={() => setActionMenuOpen(null)} onMouseEnter={e => e.currentTarget.style.backgroundColor='#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
                          <MessageCircle size={14} /> Chat
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#f43f5e', borderTop: '1px solid #f1f5f9' }} onClick={() => { deleteSelected(idx); setActionMenuOpen(null); }} onMouseEnter={e => e.currentTarget.style.backgroundColor='#f8d7da'} onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
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
        
      </div>
      
      {/* Assign Group Modal */}
      {showGroupModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>Assign Group</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Select a group to assign to {selected.length} contacts.</p>
            <select 
              className="form-input" 
              style={{ width: '100%', padding: '0.6rem 1rem', marginBottom: '1.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', appearance: 'none', backgroundColor: '#fff' }}
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="">Select Group...</option>
              {groups.map(g => (
                <option key={g._id} value={g._id.toString()}>{g.title}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowGroupModal(false)} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button className="btn btn-primary" onClick={assignGroup} style={{ padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }} disabled={!selectedGroup}>Assign</button>
            </div>
          </div>
        </div>
      )}

      {/* View Contact Modal */}
      {showViewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>Contact Details</h3>
            
            {viewLoading ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>Loading details...</p>
            ) : viewContactDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Name</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{viewContactDetails.first_name} {viewContactDetails.last_name !== " " ? viewContactDetails.last_name : ""}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>WhatsApp ID</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{viewContactDetails.wa_id || viewContactDetails.phone_number || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Marketing</span>
                  <span style={{ fontWeight: 600, color: 'var(--wa-green)' }}>{viewContactDetails.whatsapp_opt_out_text || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Created At</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{new Date(viewContactDetails.created_at).toLocaleString()}</span>
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

