import { useState, useEffect } from 'react';
import { Megaphone, Plus } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function SuperAdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/superadmin/campaigns`, {
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
            setCampaigns(result.data);
          } else {
            setCampaigns([]);
          }
        } else {
          throw new Error("Expected JSON response but got something else");
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
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
            <Megaphone size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.5px', margin: '0 0 0.2rem 0' }}>
              Vendor Campaigns
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>Monitor and analyze all campaigns running across vendors.</p>
          </div>
        </div>
        <button style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)' }} onMouseOver={(e) => e.target.style.backgroundColor = '#1e293b'} onMouseOut={(e) => e.target.style.backgroundColor = '#0f172a'}>
          <Plus size={16} /> Export Data
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>Campaign Title <span style={{ color: '#cbd5e1', fontSize: '10px' }}>♦</span></div>
                </th>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>UID <span style={{ color: '#cbd5e1', fontSize: '10px' }}>♦</span></div>
                </th>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>Status <span style={{ color: '#cbd5e1', fontSize: '10px' }}>♦</span></div>
                </th>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>Created On <span style={{ color: '#cbd5e1', fontSize: '10px' }}>♦</span></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Loading campaigns...</td></tr>
              ) : campaigns.map((campaign, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>
                    {campaign.title}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {campaign._uid}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span style={{ backgroundColor: campaign.status === 1 ? 'rgba(16, 185, 129, 0.1)' : '#fef08a', color: campaign.status === 1 ? '#10b981' : '#854d0e', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 600 }}>
                      {campaign.status === 1 ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(campaign.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!loading && campaigns.length === 0 && (
                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No campaigns found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
