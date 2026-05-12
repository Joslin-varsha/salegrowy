import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { Tag, Edit, Trash2 } from 'lucide-react';

export default function Labels() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLabel, setNewLabel] = useState({ title: '', text_color: '#000000', bg_color: '#e2e8f0' });
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);

  const fetchLabels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact/labels`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (result?.success) {
          setLabels(result.data);
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
  }, []);

  const handleCreateLabel = async () => {
    if (!newLabel.title) return;
    setCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact/labels/add`, {
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

  const deleteBulk = async () => {
    if (selected.length === 0) return;
    if (!window.confirm("Are you sure you want to delete the selected labels?")) return;
    
    // Bulk delete mockup using state
    const updatedLabels = labels.filter((_, i) => !selected.includes(i));
    setLabels(updatedLabels);
    setSelected([]);
    setShowBulkDropdown(false);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', fontFamily: 'inherit' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#31C653', margin: 0, letterSpacing: '-0.02em' }}>
          Contact Labels
        </h1>
        <button onClick={() => setShowCreateModal(true)} style={{ backgroundColor: '#31C653', color: 'white', border: 'none', borderRadius: '4px', padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(49,198,83,0.2)' }}>
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
              <button onClick={() => setShowBulkDropdown(!showBulkDropdown)} style={{ backgroundColor: '#f43f5e', color: 'white', border: 'none', borderRadius: '4px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>Bulk Actions <span style={{ fontSize: '0.6rem' }}>▼</span></button>
              {showBulkDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '150px' }}>
                  <button onClick={deleteBulk} style={{ display: 'block', width: '100%', padding: '0.5rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#1e293b' }} onMouseEnter={e => e.target.style.backgroundColor='#f1f5f9'} onMouseLeave={e => e.target.style.backgroundColor='transparent'}>
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 0.75rem', width: '80px' }}>Select</th>
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
                labels.map((label, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid transparent' }}>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
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
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button style={{ backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '3px', padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                          <Edit size={12} strokeWidth={2.5} /> Edit
                        </button>
                        <button style={{ backgroundColor: '#ff2d55', color: 'white', border: 'none', borderRadius: '3px', padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                          <Trash2 size={12} strokeWidth={2.5} /> Delete
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

      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>Create New Label</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Title</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '100%', padding: '0.6rem 1rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                value={newLabel.title}
                onChange={(e) => setNewLabel({...newLabel, title: e.target.value})}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Text Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="color" 
                    value={newLabel.text_color}
                    onChange={(e) => setNewLabel({...newLabel, text_color: e.target.value})}
                    style={{ border: 'none', width: '30px', height: '30px', padding: 0, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{newLabel.text_color}</span>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Background Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="color" 
                    value={newLabel.bg_color}
                    onChange={(e) => setNewLabel({...newLabel, bg_color: e.target.value})}
                    style={{ border: 'none', width: '30px', height: '30px', padding: 0, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{newLabel.bg_color}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Preview</label>
              <div style={{ padding: '0.5rem', border: '1px dashed #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {newLabel.title ? (
                  <span style={{ 
                    backgroundColor: newLabel.bg_color, 
                    color: newLabel.text_color, 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    {newLabel.title}
                  </span>
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Enter a title to preview</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button disabled={creating} className="btn btn-secondary" onClick={() => setShowCreateModal(false)} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button disabled={creating || !newLabel.title} className="btn btn-primary" onClick={handleCreateLabel} style={{ padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{creating ? 'Saving...' : 'Save Label'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

