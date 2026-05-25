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
  BadgeCheck,
  Globe
} from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [vendorDetails, setVendorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: ''
  });

  // Password form state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

        // 1. Fetch Personal Profile
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/profile`, {
          method: 'POST',
          headers
        });

        // 2. Fetch Business Details
        const detailsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/details`, {
          method: 'POST',
          headers
        });

        if (profileRes.ok) {
          const profileResult = await profileRes.json();
          if (profileResult.success) {
            const user = profileResult.data.user;
            setProfile(user);
            setProfileData({
              firstName: user.first_name || '',
              lastName: user.last_name || '',
              mobile: user.mobile_number || '',
              email: user.email || ''
            });
          }
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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const submitProfileUpdate = async (e) => {
    e.preventDefault();
    // Implement API call here
    alert("Profile update request sent!");
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }
    // Implement API call here
    alert("Password change request sent!");
  };

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
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{
            fontSize: isEditing ? '2.5rem' : '2rem',
            fontWeight: 800,
            color: isEditing ? '#22c55e' : '#1e293b',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            {isEditing ? 'Your Profile' : 'Account Settings'}
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
            {isEditing ? 'Update your personal information and security credentials.' : 'Manage your personal profile and business information.'}
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            padding: '0.6rem 1.25rem',
            backgroundColor: isEditing ? '#64748b' : '#1e293b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          {isEditing ? 'Back to Profile' : 'Edit Information'}
        </button>
      </div>

      {!isEditing ? (
        <>
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

            {/* BUSINESS DETAILS */}
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

          <div className="card" style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Calendar size={20} color="#64748b" />
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Member since <strong>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}</strong></span>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          {/* EDIT PROFILE CARD */}
          <div className="card" style={{
            padding: '2.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{ fontSize: '1.5rem', color: '#334155', fontWeight: 600, marginBottom: '2rem' }}>
              Edit Profile
            </h2>

            <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500, marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              User information
            </h3>

            <form onSubmit={submitProfileUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.6rem' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    placeholder="First Name"
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      border: '1.5px solid #e2e8f0',
                      outline: 'none',
                      fontSize: '1rem',
                      color: '#1e293b'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.6rem' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    placeholder="Last Name"
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      border: '1.5px solid #e2e8f0',
                      outline: 'none',
                      fontSize: '1rem',
                      color: '#1e293b'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.6rem' }}>
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={profileData.mobile}
                  onChange={handleProfileChange}
                  placeholder="Mobile Number"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: '1.5px solid #e2e8f0',
                    outline: 'none',
                    fontSize: '1rem',
                    color: '#1e293b'
                  }}
                />
                <small style={{ display: 'block', marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                  Mobile number should be with country code without 0 or +
                </small>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.6rem' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  placeholder="Email"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: '1.5px solid #e2e8f0',
                    outline: 'none',
                    fontSize: '1rem',
                    color: '#1e293b'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 2.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Save
              </button>
            </form>
          </div>

          {/* PASSWORD CARD */}
          <div className="card" style={{
            padding: '2.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: 500, marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              Password
            </h2>

            <form onSubmit={submitPasswordChange}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.6rem' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  placeholder="Current Password"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: '1.5px solid #e2e8f0',
                    outline: 'none',
                    fontSize: '1rem',
                    color: '#1e293b'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.6rem' }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="new"
                  value={passwords.new}
                  onChange={handlePasswordChange}
                  placeholder="New Password"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: '1.5px solid #e2e8f0',
                    outline: 'none',
                    fontSize: '1rem',
                    color: '#1e293b'
                  }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.6rem' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  placeholder="Confirm New Password"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: '1.5px solid #e2e8f0',
                    outline: 'none',
                    fontSize: '1rem',
                    color: '#1e293b'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Change password
              </button>
            </form>
          </div>
        </div>
      )}
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
