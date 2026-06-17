import { useState, useEffect } from 'react';
import { Webhook, Play, Check } from 'lucide-react';
import { decryptData } from '../utils/encryption';

export default function Webhooks() {
  const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem('webhooks_enabled') === 'true');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [createdWebhooks, setCreatedWebhooks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('webhooks_created') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    const checkWebhookStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/check-webhooks-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const encryptedResult = await response.json();
        
        let result = encryptedResult;
        if (encryptedResult.payload) {
          result = decryptData(encryptedResult.payload);
        }

        console.log('[Webhook Status Decrypted Response]:', result);
        
        if (response.ok && (encryptedResult.success || result.success)) {
          let enabled = false;
          let webhooksToSet = null;

          // 1. Check for webhooks array in various possible nested locations
          if (result.data?.data?.createdWebhooks) {
            webhooksToSet = result.data.data.createdWebhooks;
            enabled = true;
          } else if (result.data?.createdWebhooks) {
            webhooksToSet = result.data.createdWebhooks;
            enabled = true;
          } else if (result.data?.webhooks) {
            webhooksToSet = result.data.webhooks;
            enabled = true;
          } else if (Array.isArray(result.data) && result.data.length > 0) {
            webhooksToSet = result.data;
            enabled = true;
          }

          // 2. Check for boolean flags
          if (!enabled) {
            enabled = result.data?.isEnabled ?? result.data?.is_enabled ?? result.data?.enabled ?? 
                      result.isEnabled ?? result.is_enabled ?? result.enabled ?? 
                      result.data?.status === 'enabled' ?? result.data?.hasWebhooks ?? 
                      result.data?.has_webhooks ?? false;
            
            if (typeof result.data === 'boolean') {
               enabled = result.data;
            }
          }

          setIsEnabled(enabled);
          localStorage.setItem('webhooks_enabled', enabled ? 'true' : 'false');
          
          if (webhooksToSet) {
            setCreatedWebhooks(webhooksToSet);
            localStorage.setItem('webhooks_created', JSON.stringify(webhooksToSet));
          }
        } else {
          console.log('[Webhook Status] API returned success: false or not ok', result);
        }
      } catch (err) {
        console.error('Error checking webhook status:', err);
      } finally {
        setIsChecking(false);
      }
    };

    checkWebhookStatus();
  }, []);

  const handleEnable = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/enable-webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const encryptedResult = await response.json();
      
      let result = encryptedResult;
      if (encryptedResult.payload) {
        result = decryptData(encryptedResult.payload);
      }
      
      if (response.ok && (encryptedResult.success || result.success)) {
        setIsEnabled(true);
        localStorage.setItem('webhooks_enabled', 'true');
        if (result.data?.data?.createdWebhooks || result.data?.createdWebhooks) {
          const webhooksToSet = result.data.data?.createdWebhooks || result.data.createdWebhooks;
          setCreatedWebhooks(webhooksToSet);
          localStorage.setItem('webhooks_created', JSON.stringify(webhooksToSet));
        }
        alert(result.data?.message || result.message || "Webhooks enabled successfully!");
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
              marginTop: isEnabled ? '4px' : '0',
              opacity: isChecking ? 0.5 : 1
            }}>
              <Webhook size={24} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>
                Status: {isChecking ? 'Checking...' : (isEnabled ? 'Enabled' : 'Disabled')}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {isChecking ? 'Verifying current webhook status...' : (isEnabled ? 'Your webhook is active and ready to receive events.' : 'Enable the webhook to start receiving events.')}
              </div>
              {isEnabled && !isChecking && (
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
                disabled={isLoading || isChecking}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: (isLoading || isChecking) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  transition: 'background-color 0.2s',
                  opacity: (isLoading || isChecking) ? 0.7 : 1
                }}
              >
                <Play size={18} />
                {isLoading ? 'Enabling...' : (isChecking ? 'Checking...' : 'Enable Webhook')}
              </button>
            )}
          </div>

          {!isChecking && createdWebhooks.length > 0 && (
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
