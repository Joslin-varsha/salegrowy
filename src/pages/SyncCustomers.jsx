import { useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { MoreVertical, Info, RefreshCw, User, X } from 'lucide-react';
import { decryptData } from "../utils/encryption";

export default function SyncCustomers() {
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [syncedPage, setSyncedPage] = useState(1);
  const [syncedPageSize, setSyncedPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selected, setSelected] = useState([]);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewCustomerDetails, setViewCustomerDetails] = useState(null);

  // Fetch initial customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSyncCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/vendor/sync-customers`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Decrypt payload if present
      const decrypted = decryptData(response.data?.payload);
      console.log('Decrypted sync-customers payload:', decrypted);
      if (decrypted) {
        message.success(
          decrypted.message ||
          'Customer sync job successfully queued'
        );
      }
      // Automatically refresh customer list
      await fetchCustomers();
    } catch (error) {
      console.error('Sync customers error:', error);
      message.error('Failed to sync customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/contact/list`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const customersData = response.data?.data || [];
      console.log('Customers fetched:', customersData);
      
      // Decrypt names for each customer
      const processedCustomers = customersData.map(c => ({
        ...c,
        first_name: c.first_name ? decryptData(c.first_name) : '',
        last_name: c.last_name ? decryptData(c.last_name) : '',
      }));
      
      setCustomers(processedCustomers);
      setSelected([]);
    } catch (error) {
      console.error('Fetch customers error:', error);
      message.error('Failed to fetch customers');
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // client side search filtering applied in render
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const query = searchQuery.toLowerCase();
    const fName = (customer.first_name || '').toLowerCase();
    const lName = (customer.last_name || '').toLowerCase();
    const email = (customer.email || '').toLowerCase();
    const phone = (customer.phone_number || '').toLowerCase();
    
    return fName.includes(query) || lName.includes(query) || email.includes(query) || phone.includes(query);
  });

  // Client side pagination
  const syncedTotal = filteredCustomers.length;
  const paginatedCustomers = filteredCustomers.slice((syncedPage - 1) * syncedPageSize, syncedPage * syncedPageSize);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--wa-green)', margin: 0 }}>
          Sync Customers
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem', marginRight: '10px' }}>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={handleSyncCustomers}
            disabled={loading || customersLoading}
          >
            <RefreshCw size={14} className={loading || customersLoading ? "animate-spin" : ""} />
            {loading ? 'Syncing...' : customersLoading ? 'Fetching...' : 'Sync All Customers'}
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: '0', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden', backgroundColor: '#ffffff' }}>
        
        {/* Table Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
            Show
            <select 
              style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.25rem 0.5rem', color: '#334155', appearance: 'auto', backgroundColor: '#fff' }} 
              value={syncedPageSize} 
              onChange={(e) => {
                setSyncedPageSize(Number(e.target.value));
                setSyncedPage(1);
              }}
            >
              <option value={25}>25</option>
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSyncedPage(1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Name, email, phone..."
              style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.35rem 0.5rem', width: '250px', outline: 'none' }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 0 #e2e8f0' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', width: '30px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SEL</span>
                </th>
                <th style={{ padding: '0.75rem 1rem', width: '60px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avatar</span>
                </th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>First Name</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Name</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((item, idx) => (
                  <tr key={item._uid || idx} className="data-table-row">
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selected.includes(item._uid)} 
                        onChange={() => {
                          if (selected.includes(item._uid)) {
                            setSelected(selected.filter(id => id !== item._uid));
                          } else {
                            setSelected([...selected, item._uid]);
                          }
                        }} 
                        style={{ cursor: 'pointer', margin: 0 }} 
                      />
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <User size={18} />
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>
                      {item.first_name || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                      {item.last_name || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#1e293b', fontWeight: 500 }}>
                      {item.phone_number || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                      {item.email || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', position: 'relative' }}>
                      <button 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#64748b' }} 
                        onClick={() => setActionMenuOpen(actionMenuOpen === idx ? null : idx)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {actionMenuOpen === idx && (
                        <div 
                          style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '0.5rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, display: 'flex', flexDirection: 'column', minWidth: '150px', overflow: 'hidden' }} 
                          onMouseLeave={() => setActionMenuOpen(null)}
                        >
                          <button 
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#1e293b' }} 
                            onClick={() => {
                              setViewCustomerDetails(item);
                              setShowViewModal(true);
                              setActionMenuOpen(null);
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} 
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Info size={14} /> View Details
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    {customersLoading ? 'Loading customers...' : 'No customers found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Custom Pagination */}
        {syncedTotal > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing {Math.min((syncedPage - 1) * syncedPageSize + 1, syncedTotal)} to {Math.min(syncedPage * syncedPageSize, syncedTotal)} of {syncedTotal} entries
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button 
                disabled={syncedPage === 1}
                onClick={() => setSyncedPage(syncedPage - 1)}
                style={{
                  padding: '0.35rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  color: syncedPage === 1 ? '#cbd5e1' : '#334155',
                  cursor: syncedPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              {(() => {
                const totalPages = Math.ceil(syncedTotal / syncedPageSize);
                let pages = [];
                for (let i = 1; i <= totalPages; i++) {
                  if (i === 1 || i === totalPages || Math.abs(i - syncedPage) <= 1) {
                    pages.push(i);
                  } else if (pages[pages.length - 1] !== '...') {
                    pages.push('...');
                  }
                }
                
                return pages.map((p, idx) => {
                  if (p === '...') {
                    return <span key={`dots-${idx}`} style={{ padding: '0.35rem 0.5rem', color: '#64748b' }}>...</span>;
                  }
                  
                  return (
                    <button
                      key={p}
                      onClick={() => setSyncedPage(p)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        border: '1px solid',
                        borderColor: syncedPage === p ? 'var(--wa-green)' : '#cbd5e1',
                        borderRadius: '4px',
                        backgroundColor: syncedPage === p ? 'var(--wa-green)' : '#fff',
                        color: syncedPage === p ? '#ffffff' : '#334155',
                        fontWeight: syncedPage === p ? '600' : '500',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      {p}
                    </button>
                  );
                });
              })()}
              
              <button 
                disabled={syncedPage >= Math.ceil(syncedTotal / syncedPageSize)}
                onClick={() => setSyncedPage(syncedPage + 1)}
                style={{
                  padding: '0.35rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  color: syncedPage >= Math.ceil(syncedTotal / syncedPageSize) ? '#cbd5e1' : '#334155',
                  cursor: syncedPage >= Math.ceil(syncedTotal / syncedPageSize) ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Customer Modal */}
      {showViewModal && viewCustomerDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '600px', maxWidth: '95%', maxHeight: '95vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>

            {/* Modal Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 600 }}>Customer Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem 1.5rem' }}>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexShrink: 0 }}>
                  <User size={40} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem 0' }}>
                    {viewCustomerDetails.first_name} {viewCustomerDetails.last_name}
                  </h2>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>UID: {viewCustomerDetails._uid}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>Email</label>
                  <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewCustomerDetails.email || '-'}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>Phone Number</label>
                  <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewCustomerDetails.phone_number || '-'}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>Country</label>
                  <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewCustomerDetails.country_name || '-'}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>Language</label>
                  <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewCustomerDetails.language_code || '-'}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>Groups</label>
                  <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewCustomerDetails.groups || '-'}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>Created At</label>
                  <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewCustomerDetails.created_at ? new Date(viewCustomerDetails.created_at).toLocaleDateString() : '-'}</div>
                </div>
              </div>
              
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', gap: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>WhatsApp Opt-out</label>
                  <div style={{ fontSize: '0.95rem', color: '#334155', fontWeight: 600 }}>{viewCustomerDetails.whatsapp_opt_out_text || '-'}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>AI Bot</label>
                  <div style={{ fontSize: '0.95rem', color: '#334155', fontWeight: 600 }}>{viewCustomerDetails.disable_ai_bot_text || '-'}</div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
              <button
                onClick={() => setShowViewModal(false)}
                style={{ padding: '0.5rem 1.5rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
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
