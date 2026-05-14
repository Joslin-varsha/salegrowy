import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { Users, Edit, Trash2, Archive, Check } from 'lucide-react';

export default function ContactGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);

  const deleteBulk = async () => {
    if (selected.length === 0) return;
    if (!window.confirm("Are you sure you want to delete the selected groups?")) return;

    // Bulk delete mockup using state
    const updatedGroups = groups.filter((_, i) => !selected.includes(i));
    setGroups(updatedGroups);
    setSelected([]);
    setShowBulkDropdown(false);
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/groups`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (result?.success) {
          setGroups(result.data);
        } else {
          setGroups([]);
        }
      } else {
        throw new Error("Expected JSON response but got something else");
      }
    } catch (error) {
      console.error("Error fetching contact groups:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroup.title) return;
    setCreating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/groups/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newGroup)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (result.success) {
          setShowCreateModal(false);
          setNewGroup({ title: '', description: '' });
          fetchGroups();
        } else {
          alert(result.message || 'Error creating group');
        }
      } else {
        throw new Error("Expected JSON response but got something else");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#31C653', margin: 0, letterSpacing: '-0.02em' }}>
          Contact Groups
        </h1>
        <button onClick={() => setShowCreateModal(true)} style={{ backgroundColor: '#31C653', color: 'white', border: 'none', borderRadius: '4px', padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(49,198,83,0.2)' }}>
          Add New Group
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button style={{ padding: '0.75rem 2rem', border: '1px solid #e2e8f0', borderBottom: 'none', backgroundColor: '#ffffff', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', borderTopLeftRadius: '4px', borderTopRightRadius: '4px', cursor: 'pointer', zIndex: 1, position: 'relative', top: '1px' }}>
          Active
        </button>
        <button style={{ padding: '0.75rem 2rem', border: 'none', backgroundColor: '#e2e8f0', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', borderTopRightRadius: '4px' }}>
          Archive
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

        {/* Controls Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button style={{ backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => {
              if (selected.length === groups.length && groups.length > 0) setSelected([]);
              else setSelected(groups.map((_, i) => i));
            }}>Select All</button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowBulkDropdown(!showBulkDropdown)} style={{ backgroundColor: '#f43f5e', color: 'white', border: 'none', borderRadius: '4px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>Bulk Actions <span style={{ fontSize: '0.6rem' }}>▼</span></button>
              {showBulkDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '150px' }}>
                  <button onClick={deleteBulk} style={{ display: 'block', width: '100%', padding: '0.5rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#1e293b' }} onMouseEnter={e => e.target.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}>
                    Delete Selected
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
              Show
              <select style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.25rem 0.5rem', color: '#334155', appearance: 'auto', backgroundColor: '#fff' }}>
                <option>50</option>
                <option>100</option>
              </select>
              entries
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
            Search:
            <input type="text" style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.35rem 0.5rem', width: '200px' }} />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 0.75rem', width: '80px' }}>Select</th>
                <th style={{ padding: '1rem 0.75rem' }}>Title</th>
                <th style={{ padding: '1rem 0.75rem' }}>Description</th>
                <th style={{ padding: '1rem 0.75rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading groups...</td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No groups found.</td>
                </tr>
              ) : (
                groups.map((group, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid transparent' }}>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <input type="checkbox" checked={selected.includes(idx)} onChange={() => {
                        if (selected.includes(idx)) setSelected(selected.filter(i => i !== idx));
                        else setSelected([...selected, idx]);
                      }} style={{ width: '14px', height: '14px', border: '1px solid #cbd5e1', borderRadius: '3px', cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{group.title}</td>
                    <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>{group.description || ''}</td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button style={{ backgroundColor: '#ff5c45', color: 'white', border: 'none', borderRadius: '3px', padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                          <Users size={12} strokeWidth={2.5} /> Group Contacts
                        </button>
                        <button style={{ backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '3px', padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                          <Edit size={12} strokeWidth={2.5} /> Edit
                        </button>
                        <button style={{ backgroundColor: '#ff2d55', color: 'white', border: 'none', borderRadius: '3px', padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                          <Trash2 size={12} strokeWidth={2.5} /> Delete
                        </button>
                        <button style={{ backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '3px', padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
          <div>Showing 1 to {groups.length} of {groups.length} entries</div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button style={{ padding: '0.4rem 0.75rem', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#94a3b8', borderRadius: '2px', fontSize: '0.75rem', cursor: 'pointer' }}>Previous</button>
            <button style={{ padding: '0.4rem 0.75rem', border: 'none', backgroundColor: '#31C653', color: 'white', borderRadius: '2px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>1</button>
            <button style={{ padding: '0.4rem 0.75rem', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#94a3b8', borderRadius: '2px', fontSize: '0.75rem', cursor: 'pointer' }}>Next</button>
          </div>
        </div>

      </div>

      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>Create New Group</h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Title</label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', padding: '0.6rem 1rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                value={newGroup.title}
                onChange={(e) => setNewGroup({ ...newGroup, title: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Description</label>
              <textarea
                className="form-input"
                style={{ width: '100%', padding: '0.6rem 1rem', border: '1px solid #cbd5e1', borderRadius: '4px', minHeight: '80px', resize: 'vertical' }}
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button disabled={creating} className="btn btn-secondary" onClick={() => setShowCreateModal(false)} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button disabled={creating || !newGroup.title} className="btn btn-primary" onClick={handleCreateGroup} style={{ padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{creating ? 'Saving...' : 'Save Group'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

