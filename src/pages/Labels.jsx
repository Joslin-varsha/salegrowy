import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { Tag, Edit, Trash2 } from 'lucide-react';



export default function Labels() {
  const [entriesCount, setEntriesCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLabel, setNewLabel] = useState({ title: '', text_color: '#000000', bg_color: '#e2e8f0' });
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);


  const fetchLabels = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/labels`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page: currentPage, limit: entriesCount })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (result?.success) {
          setLabels(result.data);
          if (result.pagination) {
            setTotalRecords(result.pagination.total || 0);
            setTotalPages(result.pagination.total_pages || 1);
          } else if (result.recordsTotal !== undefined) {
            setTotalRecords(result.recordsTotal);
            setTotalPages(Math.ceil(result.recordsTotal / entriesCount) || 1);
          }
        } else {
          setLabels([]);
        }
      } else {
        throw new Error("Expected JSON response but got something else");
      }
    } catch (error) {
      console.error("Error fetching labels:", error);
      setLabels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();
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

  const handleCreateLabel = async () => {
    if (!newLabel.title) return;
    setCreating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/labels/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newLabel)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (result.success) {
          setShowCreateModal(false);
          setNewLabel({ title: '', text_color: '#000000', bg_color: '#e2e8f0' });
          fetchLabels();
        } else {
          alert(result.message || 'Error creating label');
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

  const handleUpdateLabel = async () => {
    if (!editingLabel.title) return;
    setCreating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/labels/update/${editingLabel._id || editingLabel.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: editingLabel.title,
          text_color: editingLabel.text_color,
          bg_color: editingLabel.bg_color
        })
      });
      const result = await response.json();
      if (result.success || response.ok) {
        setShowEditModal(false);
        fetchLabels();
      } else {
        alert(result.message || 'Error updating label');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating label');
    } finally {
      setCreating(false);
    }
  };

  const deleteLabel = async (id) => {
    if (!window.confirm("Delete this label?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/labels/delete/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success || response.ok) {
        fetchLabels();
      } else {
        alert(result.message || 'Error deleting label');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting label');
    }
  };

  const deleteBulk = async () => {
    if (selected.length === 0) return;
    if (!window.confirm("Are you sure you want to delete the selected labels?")) return;

    // Filter local state first for immediate feedback
    const updatedLabels = labels.filter((_, i) => !selected.includes(i));
    setLabels(updatedLabels);
    setSelected([]);
    setShowBulkDropdown(false);
  };

  return (
    <div style={{ width: '100%', fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#31C653', margin: 0, letterSpacing: '-0.02em' }}>
          Contact Labels
        </h1>
        <button onClick={() => { setNewLabel({ title: '', text_color: '#000000', bg_color: '#e2e8f0' }); setShowCreateModal(true); }} style={{ backgroundColor: '#31C653', color: 'white', border: 'none', borderRadius: '4px', padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(49,198,83,0.2)' }}>
          Add New Label
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

        {/* Controls Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button style={{ backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => {
              if (selected.length === labels.length && labels.length > 0) setSelected([]);
              else setSelected(labels.map((_, i) => i));
            }}>Select All</button>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => selected.length > 0 && setShowBulkDropdown(!showBulkDropdown)}
                style={{
                  backgroundColor: '#f43f5e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: selected.length > 0 ? 'pointer' : 'default',
                  opacity: selected.length > 0 ? 1 : 0.5,
                  pointerEvents: selected.length > 0 ? 'auto' : 'none'
                }}
              >
                Bulk Actions <span style={{ fontSize: '0.6rem' }}>▼</span>
              </button>
              {showBulkDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '180px', overflow: 'hidden' }}>
                  <button onClick={deleteBulk} style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#1e293b' }} onMouseEnter={e => e.target.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}>
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
              Show
              <select value={entriesCount} onChange={(e) => { setEntriesCount(Number(e.target.value)); setCurrentPage(1); }} style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.25rem 0.5rem', color: '#334155', appearance: 'auto', backgroundColor: '#fff' }}>
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              entries
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
            Search:
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.35rem 0.5rem', width: '200px' }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 2rem 1rem 1rem', width: '80px' }}>Select</th>
                <th style={{ padding: '1rem 0.75rem' }}>Title</th>
                <th style={{ padding: '1rem 0.75rem' }}>Preview</th>
                <th style={{ padding: '1rem 0.75rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading labels...</td>
                </tr>
              ) : labels.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No labels found.</td>
                </tr>
              ) : (
                labels.map((label, idx) => {
                  const isSearchMatch = label.title.toLowerCase().includes(searchTerm.toLowerCase());
                  if (!isSearchMatch) return null;

                  return (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid transparent' }}>
                      <td style={{ padding: '0.85rem 2rem 0.85rem 1rem' }}>
                        <input type="checkbox" checked={selected.includes(idx)} onChange={() => {
                          if (selected.includes(idx)) setSelected(selected.filter(i => i !== idx));
                          else setSelected([...selected, idx]);
                        }} style={{ width: '14px', height: '14px', border: '1px solid #cbd5e1', borderRadius: '3px', cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{label.title}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span style={{
                          backgroundColor: label.bg_color,
                          color: label.text_color,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'inline-block'
                        }}>
                          {label.title}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button onClick={() => { setEditingLabel(label); setShowEditModal(true); }} style={{ backgroundColor: 'transparent', color: '#64748b', border: 'none', padding: '0.25rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                            <Edit size={14} strokeWidth={2} /> Edit
                          </button>
                          <button onClick={() => deleteLabel(label._id || label.id)} style={{ backgroundColor: 'transparent', color: '#64748b', border: 'none', padding: '0.25rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                            <Trash2 size={14} strokeWidth={2} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
          <div>
            Showing {labels.length > 0 ? (currentPage - 1) * entriesCount + 1 : 0} to {Math.min(currentPage * entriesCount, totalRecords)} of {totalRecords} entries
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '0.4rem 0.75rem', border: '1px solid #e2e8f0', backgroundColor: currentPage === 1 ? '#f8fafc' : 'white', color: currentPage === 1 ? '#94a3b8' : '#334155', borderRadius: '2px', fontSize: '0.75rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Prev
            </button>
            
            {getPageNumbers().map((num, idx) => (
              <button
                key={idx}
                onClick={() => typeof num === 'number' && setCurrentPage(num)}
                disabled={num === '...'}
                style={{
                  padding: '0.4rem 0.75rem',
                  border: num === '...' ? 'none' : '1px solid #e2e8f0',
                  backgroundColor: currentPage === num ? '#31C653' : 'white',
                  color: currentPage === num ? 'white' : '#334155',
                  borderRadius: '2px',
                  fontSize: '0.75rem',
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
              style={{ padding: '0.4rem 0.75rem', border: '1px solid #e2e8f0', backgroundColor: currentPage === totalPages || totalPages === 0 ? '#f8fafc' : 'white', color: currentPage === totalPages || totalPages === 0 ? '#94a3b8' : '#334155', borderRadius: '2px', fontSize: '0.75rem', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* Add/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '600px', maxWidth: '90%', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>

            {/* Modal Header */}
            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#475569', fontWeight: 600 }}>
                {showEditModal ? 'Edit Label' : 'Add New Label'}
              </h3>
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem 1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Title</label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                  value={showEditModal ? editingLabel?.title : newLabel.title}
                  onChange={(e) => {
                    if (showEditModal) setEditingLabel({ ...editingLabel, title: e.target.value });
                    else setNewLabel({ ...newLabel, title: e.target.value });
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Text Color</label>
                  <input
                    type="color"
                    value={showEditModal ? editingLabel?.text_color : newLabel.text_color}
                    onChange={(e) => {
                      if (showEditModal) setEditingLabel({ ...editingLabel, text_color: e.target.value });
                      else setNewLabel({ ...newLabel, text_color: e.target.value });
                    }}
                    style={{ width: '100%', height: '40px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Background Color</label>
                  <input
                    type="color"
                    value={showEditModal ? editingLabel?.bg_color : newLabel.bg_color}
                    onChange={(e) => {
                      if (showEditModal) setEditingLabel({ ...editingLabel, bg_color: e.target.value });
                      else setNewLabel({ ...newLabel, bg_color: e.target.value });
                    }}
                    style={{ width: '100%', height: '40px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={{ padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{
                  backgroundColor: showEditModal ? editingLabel?.bg_color : newLabel.bg_color,
                  color: showEditModal ? editingLabel?.text_color : newLabel.text_color,
                  padding: '0.25rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'inline-block'
                }}>
                  {(showEditModal ? editingLabel?.title : newLabel.title) || 'Preview'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={showEditModal ? handleUpdateLabel : handleCreateLabel}
                style={{ padding: '0.6rem 1.5rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                disabled={creating || !(showEditModal ? editingLabel?.title : newLabel.title)}
              >
                Submit
              </button>
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                style={{ padding: '0.6rem 1.5rem', background: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
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

