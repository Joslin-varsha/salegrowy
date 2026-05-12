import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { LogIn, Store, Plus } from 'lucide-react';

export default function SuperAdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/superadmin/vendors`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          },
          body: JSON.stringify({ page: 1, limit: 100 })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const result = await response.json();
          if (result.success && result.data) {
            setVendors(result.data);
          } else {
            setVendors([]);
          }
        } else {
          throw new Error("Expected JSON response but got something else");
        }
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Premium Header */}
      <div style={{ 
        marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        backgroundColor: '#ffffff', padding: '1.5rem 2rem', borderRadius: '16px', 
        border: '1px solid rgba(16, 185, 129, 0.1)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
        backgroundImage: 'linear-gradient(to right, rgba(16, 185, 129, 0.03), transparent)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--wa-green) 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)' }}>
            <Store size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.5px', margin: '0 0 0.2rem 0' }}>
              Vendors Management
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>Manage system vendors, view billing, and control access statuses.</p>
          </div>
        </div>
        <button style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)' }} onMouseOver={(e) => e.target.style.backgroundColor='#1e293b'} onMouseOut={(e) => e.target.style.backgroundColor='#0f172a'}>
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        
        {/* Table Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Show
            <select style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <option value={100}>100</option>
            </select>
            entries
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Search:
            <input type="text" className="form-input" style={{ padding: '0.35rem 0.75rem', width: '200px' }} />
          </div>
        </div>

        {/* Data Grid */}
        <div style={{ borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: '#ffffff' }}>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>Vendor Title <span style={{ color: '#cbd5e1', fontSize: '10px' }}>♦</span></div>
                </th>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Quick Actions
                </th>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>Admin User Name <span style={{ color: '#cbd5e1', fontSize: '10px' }}>♦</span></div>
                </th>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>Username <span style={{ color: '#cbd5e1', fontSize: '10px' }}>♦</span></div>
                </th>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>Email <span style={{ color: '#cbd5e1', fontSize: '10px' }}>♦</span></div>
                </th>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>Status <span style={{ color: '#cbd5e1', fontSize: '10px' }}>♦</span></div>
                </th>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>Mobile Number <span style={{ color: '#cbd5e1', fontSize: '10px' }}>♦</span></div>
                </th>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>Admin User Status <span style={{ color: '#cbd5e1', fontSize: '10px' }}>♦</span></div>
                </th>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>Wallet Details <span style={{ color: '#cbd5e1', fontSize: '10px' }}>♦</span></div>
                </th>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>Created On <span style={{ color: '#cbd5e1', fontSize: '10px' }}>♦</span></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" style={{ padding: '2rem', textAlign: 'center' }}>Loading vendors...</td></tr>
              ) : vendors.map((vendor, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'var(--wa-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>+</div>
                        <a href="#" style={{ color: 'var(--wa-green)', fontWeight: 600, textDecoration: 'underline' }}>{vendor.title || vendor.name}</a>
                      </div>
                      {vendor.expired && <span style={{ backgroundColor: '#f43f5e', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700, width: 'fit-content' }}>EXPIRED</span>}
                      {vendor.notActivated && <span style={{ backgroundColor: '#0f172a', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700, width: 'fit-content' }}>NOT ACTIVATED</span>}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <button style={{ backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.65rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer', width: 'fit-content', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.target.style.opacity = '0.9'} onMouseOut={(e) => e.target.style.opacity = '1'}>
                        <LogIn size={12} /> Login
                      </button>
                      <button style={{ backgroundColor: 'var(--wa-green)', color: 'white', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', width: 'fit-content', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.target.style.opacity = '0.9'} onMouseOut={(e) => e.target.style.opacity = '1'}>
                        Subscription
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{vendor.adminName || vendor.admin_name}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{vendor.username}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{vendor.email}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span style={{ backgroundColor: vendor.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : '#f1f5f9', color: vendor.status === 'Active' ? '#10b981' : '#64748b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600 }}>{vendor.status || 'Active'}</span>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{vendor.mobile || vendor.phone}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span style={{ backgroundColor: vendor.adminStatus === 'Active' ? 'rgba(16, 185, 129, 0.1)' : '#f1f5f9', color: vendor.adminStatus === 'Active' ? '#10b981' : '#64748b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600 }}>{vendor.adminStatus || 'Active'}</span>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    <div>Total: ₹ {vendor.spend || '0'}</div>
                    <div>Spend: ₹ 0</div>
                    <div>Balance: ₹ {vendor.balance || '0'}</div>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : (vendor.created || 'N/A')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

