import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  BadgeCheck,
  Globe
} from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [vendorDetails, setVendorDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        
        // 1. Fetch Personal Profile
        const profileRes = await fetch(`${API_BASE_URL}/api/vendor/profile`, { 
          method: 'POST', 
          headers 
        });
        
        // 2. Fetch Business Details
        const detailsRes = await fetch(`${API_BASE_URL}/api/vendor/details`, { 
          method: 'POST',
          headers 
        });

        if (profileRes.ok) {
          const profileResult = await profileRes.json();
          if (profileResult.success) setProfile(profileResult.data.user);
        }

        if (detailsRes.ok) {
          const detailsResult = await detailsRes.json();
          if (detailsResult.success) setVendorDetails(detailsResult.data);
        }

      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{ marginBottom: '1rem' }}>⌛</div>
          Loading account information...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>
          Account Settings
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Manage your personal profile and business information.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* PERSONAL INFORMATION */}
        <div className="card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(37, 211, 102, 0.1)', color: 'var(--wa-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Personal Profile</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <InfoItem label="Full Name" value={`${profile?.first_name} ${profile?.last_name !== 'lastName' ? profile?.last_name : ''}`} icon={User} />
            <InfoItem label="Email Address" value={profile?.email} icon={Mail} />
            <InfoItem label="Phone Number" value={profile?.mobile_number} icon={Phone} />
            <InfoItem label="Account Status" value={profile?.status === 1 ? 'Active' : 'Inactive'} icon={ShieldCheck} isStatus />
          </div>
        </div>

        {/* BUSINESS DETAILS (Integrated from /api/vendor/details) */}
        <div className="card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Business Information</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <InfoItem label="Company Name" value={vendorDetails?.company_name || profile?.company_name} icon={Building2} />
            <InfoItem label="Vendor ID" value={vendorDetails?.id || 'VND-' + profile?.id} icon={BadgeCheck} />
            <InfoItem label="Wallet Balance" value={`₹${vendorDetails?.wallet_balance || '0.00'}`} icon={CreditCard} highlight />
            <InfoItem label="Business Website" value={vendorDetails?.website || '-'} icon={Globe} />
          </div>
        </div>

      </div>

      <div className="card" style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Calendar size={20} color="#64748b" />
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Member since <strong>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}</strong></span>
        </div>
        <button style={{ padding: '0.6rem 1.25rem', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
          Edit Information
        </button>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon: Icon, isStatus, highlight }) {
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, marginBottom: '0.4rem' }}>
        <Icon size={14} /> {label}
      </label>
      <div style={{ 
        fontSize: '1.05rem', 
        color: isStatus ? (value === 'Active' ? '#22c55e' : '#ef4444') : '#334155', 
        fontWeight: highlight || isStatus ? 700 : 500 
      }}>
        {value || '-'}
      </div>
    </div>
  );
}
