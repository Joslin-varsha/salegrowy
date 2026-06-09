import { useState } from 'react';
import { Webhook, Play, Check } from 'lucide-react';

export default function Webhooks() {
  const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem('webhooks_enabled') === 'true');
  const [isLoading, setIsLoading] = useState(false);
  const [createdWebhooks, setCreatedWebhooks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('webhooks_created') || '[]');
    } catch { return []; }
  });

  const handleEnable = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('https://salegrowymail.com/api/vendor/enable-webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setIsEnabled(true);
        localStorage.setItem('webhooks_enabled', 'true');
        if (result.data?.data?.createdWebhooks) {
          setCreatedWebhooks(result.data.data.createdWebhooks);
          localStorage.setItem('webhooks_created', JSON.stringify(result.data.data.createdWebhooks));
        }
        alert(result.data?.message || "Webhooks enabled successfully!");
      } else {
        alert("Failed to enable webhooks. Please try again.");
      }
    } catch (err) {
      console.error('Webhook API error:', err);
      alert("An error occurred while enabling webhooks.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--wa-green)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Webhook size={28} />
          Webhooks Configuration
        </h1>
      </div>

      <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>Global Webhook Status</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Enable outgoing webhooks for your account to receive real-time event payloads.
          </p>
          
          <div style={{ display: 'flex', alignItems: isEnabled ? 'flex-start' : 'center', gap: '1rem', padding: '1.5rem', backgroundColor: isEnabled ? '#f0fdf4' : '#f8fafc', borderRadius: '8px', border: `1px solid ${isEnabled ? '#bbf7d0' : '#e2e8f0'}` }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '50%', 
              backgroundColor: isEnabled ? '#22c55e' : '#94a3b8', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', transition: 'all 0.3s ease',
              marginTop: isEnabled ? '4px' : '0'
            }}>
              <Webhook size={24} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>
                Status: {isEnabled ? 'Enabled' : 'Disabled'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {isEnabled ? 'Your webhook is active and ready to receive events.' : 'Enable the webhook to start receiving events.'}
              </div>
              {isEnabled && (
                <div style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0', 
                  padding: '0.25rem 1rem', 
                  marginTop: '0.75rem',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                  width: 'fit-content',
                  minWidth: '260px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', color: '#475569', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <Check size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
                      <span>Customer Creation & Update</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <Check size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
                      <span>Cart Creation & Update</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0' }}>
                      <Check size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
                      <span>Order Creation & Update</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!isEnabled && (
              <button 
                onClick={handleEnable}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  transition: 'background-color 0.2s',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                <Play size={18} />
                {isLoading ? 'Enabling...' : 'Enable Webhook'}
              </button>
            )}
          </div>

          {createdWebhooks.length > 0 && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>Registered Topics:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.85rem', color: '#475569' }}>
                {createdWebhooks.map((wh, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 500 }}>{wh.topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
