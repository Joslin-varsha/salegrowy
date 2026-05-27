import { useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { MoreVertical, Info, RefreshCw, Box, X } from 'lucide-react';
import { encryptData, decryptData } from "../utils/encryption";

export default function SyncProducts() {
  const [loading, setLoading] = useState(false);
  const [shopifyLoading, setShopifyLoading] = useState(false);
  const [shopifyProducts, setShopifyProducts] = useState([]);
  const [syncedProducts, setSyncedProducts] = useState([]);
  const [syncedPage, setSyncedPage] = useState(1);
  const [syncedPageSize, setSyncedPageSize] = useState(50);
  const [syncedTotal, setSyncedTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selected, setSelected] = useState([]);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewProductDetails, setViewProductDetails] = useState(null);

  // Fetch initial products on mount
  useEffect(() => {
    fetchShopifyProducts(1, 50, '');
  }, []);

  const handleSyncProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/vendor/sync-products`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Decrypt payload if present
      const decrypted = decryptData(response.data?.payload);
      console.log('Decrypted sync-products payload:', decrypted);
      if (decrypted) {
        message.success(
          decrypted.message ||
          'Product sync job successfully queued'
        );
      }
      // Automatically fetch updated products from Shopify
      await fetchShopifyProducts(1, syncedPageSize, searchQuery);
    } catch (error) {
      console.error('Sync products error:', error);
      message.error('Failed to sync products');
    } finally {
      setLoading(false);
    }
  };
  const fetchShopifyProducts = async (page = 1, pageSize = syncedPageSize, search = searchQuery) => {
    try {
      setShopifyLoading(true);
      const token = localStorage.getItem('token');
      const requestBody = {
        page: page.toString(),
        limit: pageSize.toString(),
        search: search
      };
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/vendor/shopify-products`,
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const prodData = response.data?.data || {};
      console.log('Shopify products:', prodData);
      setSyncedProducts(prodData.products || []);
      const pagination = prodData.pagination || {};
      setSyncedTotal(pagination.total || (prodData.products ? prodData.products.length : 0));
      setSyncedPage(pagination.page || page);
      setSyncedPageSize(pagination.limit || pageSize);
      // Reset selected when page changes
      setSelected([]);
    } catch (error) {
      console.error('Fetch products error:', error);
      message.error('Failed to fetch products');
    } finally {
      setShopifyLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchShopifyProducts(1, syncedPageSize, searchQuery);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--wa-green)', margin: 0 }}>
          Sync Products
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem', marginRight: '10px' }}>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={handleSyncProducts}
            disabled={loading || shopifyLoading}
          >
            <RefreshCw size={14} className={loading || shopifyLoading ? "animate-spin" : ""} />
            {loading ? 'Syncing...' : shopifyLoading ? 'Fetching...' : 'Sync All Products'}
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
              onChange={(e) => fetchShopifyProducts(1, Number(e.target.value), searchQuery)}
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
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Title or ID..."
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
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Image</span>
                </th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shopify ID</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price Range</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Variants</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {syncedProducts.length > 0 ? (
                syncedProducts.map((item, idx) => {
                  let priceDisplay = 'N/A';
                  if (item.variants && item.variants.length > 0) {
                    const prices = item.variants.map(v => parseFloat(v.price)).filter(p => !isNaN(p));
                    if (prices.length > 0) {
                      const min = Math.min(...prices);
                      const max = Math.max(...prices);
                      priceDisplay = min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} - $${max.toFixed(2)}`;
                    }
                  }

                  return (
                    <tr key={item.shopify_id || idx} className="data-table-row">
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={selected.includes(item.shopify_id)} 
                          onChange={() => {
                            if (selected.includes(item.shopify_id)) {
                              setSelected(selected.filter(id => id !== item.shopify_id));
                            } else {
                              setSelected([...selected, item.shopify_id]);
                            }
                          }} 
                          style={{ cursor: 'pointer', margin: 0 }} 
                        />
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {item.images && item.images[0] ? (
                          <img
                            alt={item.title}
                            src={item.images[0].src}
                            style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                          />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <Box size={20} />
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#1e293b', fontWeight: 500 }}>
                        <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                        {item.shopify_id}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>
                        {priceDisplay}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                        {item.variants ? item.variants.length : 0} variants
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
                                setViewProductDetails(item);
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    {shopifyLoading ? 'Loading products...' : 'No products found.'}
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
                onClick={() => fetchShopifyProducts(syncedPage - 1, syncedPageSize, searchQuery)}
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
                      onClick={() => fetchShopifyProducts(p, syncedPageSize, searchQuery)}
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
                onClick={() => fetchShopifyProducts(syncedPage + 1, syncedPageSize, searchQuery)}
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

      {/* View Product Modal */}
      {showViewModal && viewProductDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '800px', maxWidth: '95%', maxHeight: '95vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>

            {/* Modal Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 600 }}>Product Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem 1.5rem' }}>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                
                {/* Image Section */}
                <div style={{ flex: '0 0 200px' }}>
                  {viewProductDetails.images && viewProductDetails.images.length > 0 ? (
                    <img 
                      src={viewProductDetails.images[0].src} 
                      alt={viewProductDetails.title} 
                      style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ width: '100%', height: '200px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <Box size={40} />
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div style={{ flex: '1', minWidth: '300px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.5rem 0' }}>{viewProductDetails.title}</h2>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>Shopify ID: {viewProductDetails.shopify_id}</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>Vendor</label>
                      <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewProductDetails.vendor || '-'}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>Product Type</label>
                      <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewProductDetails.product_type || '-'}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>Status</label>
                      <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>
                        <span style={{ backgroundColor: viewProductDetails.status === 'active' ? 'rgba(37, 211, 102, 0.1)' : '#f1f5f9', color: viewProductDetails.status === 'active' ? 'var(--wa-green)' : '#64748b', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                          {viewProductDetails.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>Created At</label>
                      <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewProductDetails.created_at ? new Date(viewProductDetails.created_at).toLocaleDateString() : '-'}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>Tags</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {viewProductDetails.tags ? viewProductDetails.tags.split(',').map((tag, i) => (
                        <span key={i} style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
                          {tag.trim()}
                        </span>
                      )) : <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No tags</span>}
                    </div>
                  </div>
                  
                  {viewProductDetails.body_html && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Description</label>
                      <div 
                        style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                        dangerouslySetInnerHTML={{ __html: viewProductDetails.body_html }}
                      />
                    </div>
                  )}

                </div>
              </div>

              {/* Variants Section */}
              {viewProductDetails.variants && viewProductDetails.variants.length > 0 && (
                <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Variants ({viewProductDetails.variants.length})</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                        <tr>
                          <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>Title</th>
                          <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>SKU</th>
                          <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>Price</th>
                          <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>Inventory</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewProductDetails.variants.map((variant, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: 500 }}>{variant.title}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{variant.sku || '-'}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#1e293b', fontWeight: 600 }}>${parseFloat(variant.price).toFixed(2)}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{variant.inventory_quantity !== undefined ? variant.inventory_quantity : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
