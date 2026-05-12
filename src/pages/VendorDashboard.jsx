import { API_BASE_URL } from '../config';
import { User, Users, Megaphone, Layers, Bot, List, CheckCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const MetricCard = ({ title, value, icon: Icon, color, linkText, linkPath }) => (
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
        <Link to={linkPath || "#"} style={{ color: 'var(--wa-green)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {linkText}
          <ChevronRight size={14} />
        </Link>
      ) : (
        <div style={{ height: '0.9rem' }}></div>
      )}
    </div>
  </div>
);

export default function VendorDashboard() {

  const [dashboardData, setDashboardData] = useState(null);

  console.log("TOKEN:", localStorage.getItem('token'));

  useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendor/dashboard`, {
         method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

console.log("STATUS:", response.status);

  if (!response.ok) {
  throw new Error("API not found or server error");
}

const result = await response.json();
console.log("RESPONSE:", result);

      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  fetchDashboard();
}, []);

if (!dashboardData) {
  return (
    <div style={{
      height: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1rem',
      color: '#64748b'
    }}>
      Loading dashboard...
    </div>
  );
}

  const metrics = dashboardData ? [
  { title: 'TOTAL CONTACTS', value: dashboardData.totalContacts, icon: User, color: '#0ea5e9', linkText: 'Manage Contacts', linkPath: '/dashboard/contacts' },
  { title: 'TOTAL GROUPS', value: dashboardData.totalGroups, icon: Users, color: '#10b981', linkText: 'Manage Groups', linkPath: '/dashboard/contacts/groups' },
  { title: 'TOTAL CAMPAIGNS', value: dashboardData.totalCampaigns, icon: Megaphone, color: '#ef4444', linkText: 'Manage Campaigns', linkPath: '/dashboard/campaigns' },
  { title: 'TOTAL TEMPLATES', value: dashboardData.totalTemplates, icon: Layers, color: '#10b981', linkText: 'Manage Templates', linkPath: '/dashboard/whatsapp-templates' },
  { title: 'TOTAL BOT REPLIES', value: dashboardData.totalBotReplies, icon: Bot, color: '#10b981', linkText: 'Manage Bot Replies' },
  { title: 'ACTIVE TEAM MEMBERS', value: dashboardData.activeTeamMembers, icon: User, color: '#f97316', linkText: 'Manage Team Member' },
  { title: 'MESSAGES IN QUEUE', value: dashboardData.messagesInQueue, icon: List, color: '#10b981', linkText: null },
  { title: 'MESSAGES PROCESSED', value: dashboardData.totalMessagesProcessed, icon: CheckCircle, color: '#10b981', linkText: null },
] : [];



  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '0.2rem' }}>
            Hi {dashboardData?.vendorUserData?.first_name || 'Vendor'},
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Here is what’s happening with your vendor account today.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {metrics.map((m, i) => (
          <MetricCard key={i} {...m} />
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(37, 211, 102, 0.1)', color: 'var(--wa-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <List size={16} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Quick Start Guide</h2>
        </div>
        <div style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { text: 'Login to your Facebook Account', linkText: '' },
              { text: 'Complete Setup as Shown in', linkText: 'WhatsApp Cloud API Setup' },
              { text: 'Manage and Sync WhatsApp templates at', linkText: 'Manage WhatsApp Templates' },
              { text: 'Create your contact groups using', linkText: 'Manage Groups' },
              { text: 'Create your Contacts or Upload excel file with predefined exportable template at', linkText: 'Manage Contacts' },
              { text: 'Create & Schedule your Campaigns at', linkText: 'Manage Campaigns' },
            ].map((step, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--input-bg)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0, marginTop: '2px' }}>
                  {idx + 1}
                </div>
                <div style={{ fontSize: '0.95rem', color: '#475569' }}>
                  {step.text} {step.linkText && <Link to="#" style={{color: 'var(--wa-green)', fontWeight: 600}}>{step.linkText}</Link>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

