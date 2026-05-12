import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { ShieldAlert, Store, Users, Megaphone, Server, CheckCircle2, ChevronRight, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const MetricCard = ({ title, value, icon: Icon, color, linkText }) => (
  <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
    <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flex: 1 }}>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.25rem' }}>{value}</div>
        <h3 style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{title}</h3>
      </div>
      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 10px ${color}30` }}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
    </div>
    <div style={{ padding: '0.5rem 1rem', backgroundColor: '#f8fafc', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {linkText ? (
        <Link to="#" style={{ color: 'var(--wa-green, #10b981)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
          {linkText}
          <ChevronRight size={14} />
        </Link>
      ) : (
        <div style={{ height: '0.9rem' }}></div>
      )}
    </div>
  </div>
);

export default function SuperAdminDashboard() {
  const [data, setData] = useState({
    total_vendors: '0',
    total_active_vendors: '0',
    total_contacts: '0',
    total_campaigns: '0',
    messages_in_queue: '0',
    messages_processed: '0',
    newVendors: []
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/superadmin/dashboard`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const result = await response.json();
          if (result.success && result.data) {
            setData(result.data);
          }
        } else {
          throw new Error("Expected JSON response but got something else");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchDashboard();
  }, []);

  const metrics = [
    { title: 'TOTAL VENDORS', value: data.totalVendors || data.total_vendors || '0', icon: Store, color: '#0ea5e9', linkText: 'Manage Vendors' },
    { title: 'TOTAL ACTIVE VENDORS', value: data.totalActiveVendors || data.total_active_vendors || '0', icon: Store, color: '#10b981', linkText: 'View Active Vendors' },
    { title: 'TOTAL CONTACTS', value: data.totalContacts || data.total_contacts || '0', icon: Users, color: '#8b5cf6', linkText: 'Manage Contacts' },
    { title: 'TOTAL CAMPAIGNS', value: data.totalCampaigns || data.total_campaigns || '0', icon: Megaphone, color: '#f97316', linkText: 'Manage Campaigns' },
    { title: 'MESSAGES IN QUEUE', value: data.messagesInQueue || data.messages_in_queue || '0', icon: Server, color: '#10b981', linkText: null },
    { title: 'MESSAGES PROCESSED', value: data.totalMessagesProcessed || data.messages_processed || '0', icon: CheckCircle2, color: '#10b981', linkText: null },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Premium Header */}
      <div style={{ 
        marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        backgroundColor: '#ffffff', padding: '1.5rem 2rem', borderRadius: '16px', 
        border: '1px solid rgba(16, 185, 129, 0.1)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
        backgroundImage: 'linear-gradient(to right, rgba(16, 185, 129, 0.03), transparent)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--wa-green) 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)' }}>
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.5px', margin: '0 0 0.2rem 0' }}>
              Super Admin Dashboard
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>System performance overview and key vendor statistics.</p>
          </div>
        </div>
      </div>
      
      {/* Alert */}
      <div style={{ backgroundColor: '#f43f5e', color: 'white', padding: '1rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500, boxShadow: '0 4px 6px -1px rgba(244, 63, 94, 0.2)' }}>
        <ShieldAlert size={18} />
        Cron job setup is required
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {metrics.map((m, i) => (
          <MetricCard key={i} {...m} />
        ))}
      </div>

      {/* Chart Placement */}
      <div style={{ backgroundColor: '#1e1b4b', borderRadius: '12px', padding: '2rem', minHeight: '400px', display: 'flex', flexDirection: 'column', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(30, 27, 75, 0.5)' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '1px' }}>LAST 12 MONTHS</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.25rem' }}>New Vendor Registrations</div>
        
        {/* Curved SVG Line Simulation */}
        <svg viewBox="0 0 1000 300" style={{ position: 'absolute', bottom: '40px', left: 0, width: '100%', height: '250px', preserveAspectRatio: 'none' }}>
          <path d="M0,250 C100,250 150,50 300,100 C450,150 550,250 700,180 C850,110 950,200 1000,250" fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
          <path d="M0,250 C100,250 150,50 300,100 C450,150 550,250 700,180 C850,110 950,200 1000,250 L1000,300 L0,300 Z" fill="url(#gradient)" stroke="none" opacity="0.3" />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Chart Y Axis Mock */}
        <div style={{ position: 'absolute', left: '2rem', top: '100px', bottom: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#6366f1', fontSize: '0.75rem', zIndex: 2 }}>
          <span>25</span>
          <span>20</span>
          <span>15</span>
          <span>10</span>
          <span>5</span>
          <span>0</span>
        </div>

        {/* Chart X Axis Mock */}
        <div style={{ position: 'absolute', left: '4rem', right: '4rem', bottom: '30px', display: 'flex', justifyContent: 'space-between', color: '#818cf8', fontSize: '0.75rem', zIndex: 2 }}>
          <span>Apr 2025</span>
          <span>May 2025</span>
          <span>Jun 2025</span>
          <span>Jul 2025</span>
          <span>Aug 2025</span>
          <span>Sep 2025</span>
          <span>Oct 2025</span>
          <span>Nov 2025</span>
          <span>Dec 2025</span>
          <span>Jan 2026</span>
          <span>Feb 2026</span>
          <span>Mar 2026</span>
        </div>
        
        {/* Horizontal grid lines */}
        <div style={{ position: 'absolute', top: '108px', left: '4rem', right: '4rem', borderBottom: '1px solid rgba(99, 102, 241, 0.1)', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', top: '155px', left: '4rem', right: '4rem', borderBottom: '1px solid rgba(99, 102, 241, 0.1)', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', top: '202px', left: '4rem', right: '4rem', borderBottom: '1px solid rgba(99, 102, 241, 0.1)', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', top: '249px', left: '4rem', right: '4rem', borderBottom: '1px solid rgba(99, 102, 241, 0.1)', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', bottom: '50px', left: '4rem', right: '4rem', borderBottom: '1px solid rgba(99, 102, 241, 0.2)', zIndex: 1 }}></div>
      </div>

      {/* New Vendors Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>New Vendors</h2>
          <button style={{ backgroundColor: 'var(--wa-green)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseOver={(e) => e.target.style.opacity = '0.9'} onMouseOut={(e) => e.target.style.opacity = '1'}>
            See all
            <ChevronRight size={16} />
          </button>
        </div>
        
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: '#ffffff' }}>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Vendor Title</th>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Registered On</th>
                <th style={{ padding: '0.75rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Vendor Status</th>
              </tr>
            </thead>
            <tbody>
              {data.newVendors && data.newVendors.length > 0 ? (
                data.newVendors.map((vendor, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--wa-green)', fontWeight: 600 }}>{vendor.title || vendor.name}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600 }}>
                        {vendor.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No new vendors</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

