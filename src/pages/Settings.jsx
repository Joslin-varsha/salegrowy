import { API_BASE_URL } from '../config';
import { useState, useEffect, useRef } from 'react';
import { Facebook, ExternalLink, HelpCircle, Check, RefreshCw, Settings as SettingsIcon } from 'lucide-react';



export default function Settings() {
  const [isConnected, setIsConnected] = useState(false);
  const [setupDetails, setSetupDetails] = useState(null);
  const [isSetupInProcess, setIsSetupInProcess] = useState(false);
  const phoneNumberIdRef = useRef('');
  const waBaIdRef = useRef('');

  // Disconnected View States
  const [openSections, setOpenSections] = useState({
    fbApp: true,
    waIntegration: false,
    testContact: false
  });

  // Connected View States
  const [openConnectedSections, setOpenConnectedSections] = useState({
    defaultPhone: true,
    testContact: true
  });


  const fetchSetupDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp/setup-details`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSetupDetails({
            ...result.data,
            raw_settings: result.raw_settings
          });
          setIsConnected(result.data.is_setup_completed);
        }
      }
    } catch (err) {
      console.error("Error fetching setup details", err);
    }
  };

  useEffect(() => {
    fetchSetupDetails();

    // Initialize Facebook SDK settings
    window.fbAsyncInit = function() {
      window.FB.init({
        appId            : import.meta.env.VITE_EMBEDDED_SIGNUP_APP_ID || '322671264224444',
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v20.0'
      });
    };

    // Load FB SDK script dynamically if not already present
    if (!document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      js.async = true;
      js.defer = true;
      js.crossOrigin = "anonymous";
      document.body.appendChild(js);
    } else if (window.FB) {
      window.FB.init({
        appId            : import.meta.env.VITE_EMBEDDED_SIGNUP_APP_ID || '322671264224444',
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v20.0'
      });
    }

    // Listener for postMessages sent by the WhatsApp Embedded Signup flow
    const sessionInfoListener = (event) => {
      if (event.origin !== "https://www.facebook.com") return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.event === 'FINISH') {
            const { phone_number_id, waba_id } = data.data;
            phoneNumberIdRef.current = phone_number_id;
            waBaIdRef.current = waba_id;
          }
        }
      } catch (err) {
        // Non-JSON messages are ignored
      }
    };

    window.addEventListener('message', sessionInfoListener);

    return () => {
      window.removeEventListener('message', sessionInfoListener);
    };
  }, []);

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleConnectedSection = (section) => {
    setOpenConnectedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleEmbeddedSignup = async (payload) => {
    try {
      // payload expects: { request_code: "", waba_id: "", phone_number_id: "" }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp/embedded-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        // Re-fetch setup details to update the UI dynamically (no page reload)
        await fetchSetupDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      alert("Facebook SDK is still loading. Please try again in a moment.");
      return;
    }

    setIsSetupInProcess(true);

    // Reset references for the new flow
    phoneNumberIdRef.current = '';
    waBaIdRef.current = '';

    window.FB.login((response) => {
      console.log("Facebook login response:", response);
      if (response.authResponse) {
        const tempAccessCode = response.authResponse.code;
        if (tempAccessCode) {
          handleEmbeddedSignup({
            request_code: tempAccessCode,
            waba_id: waBaIdRef.current,
            phone_number_id: phoneNumberIdRef.current
          }).then(() => {
            setIsSetupInProcess(false);
          });
        } else {
          setIsSetupInProcess(false);
        }
      } else {
        alert('User cancelled login or did not fully authorize.');
        setIsSetupInProcess(false);
      }
    }, {
      config_id: import.meta.env.VITE_EMBEDDED_SIGNUP_CONFIG_ID || '1236012780952719',
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        sessionInfoVersion: 2,
        setup: {
          solutionID: import.meta.env.VITE_EMBEDDED_SIGNUP_SOLUTION_ID || '472724805786985'
        }
      }
    });
  };

  // Parse phone numbers from raw_settings
  let phoneNumbers = [];
  try {
    if (setupDetails?.raw_settings?.whatsapp_phone_numbers) {
      phoneNumbers = JSON.parse(setupDetails.raw_settings.whatsapp_phone_numbers);
    }
  } catch (e) {
    console.error("Error parsing phone numbers:", e);
  }

  // Find active phone number detail
  const activePhoneId = setupDetails?.phone_number_id || (phoneNumbers[0]?.id || '');
  const activePhone = phoneNumbers.find(p => p.id === activePhoneId);

  // Parse health status entities from raw_settings
  let healthEntities = [];
  let healthUpdatedAt = '';
  try {
    if (setupDetails?.raw_settings?.whatsapp_health_status_data) {
      const healthData = JSON.parse(setupDetails.raw_settings.whatsapp_health_status_data);
      const wabaIdKey = setupDetails.waba_id || Object.keys(healthData)[0];
      if (wabaIdKey && healthData[wabaIdKey]) {
        healthUpdatedAt = healthData[wabaIdKey].health_status_updated_at_formatted || '';
        healthEntities = healthData[wabaIdKey].health_data?.health_status?.entities || [];
      }
    }
  } catch (e) {
    console.error("Error parsing health data:", e);
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--wa-green)', margin: 0 }}>
          Settings
        </h1>

        {/* Development Toggle */}
        <button
          onClick={() => setIsConnected(!isConnected)}
          style={{ backgroundColor: isConnected ? '#ef4444' : '#22c55e', color: 'white', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
        >
          {isConnected ? 'Simulate Disconnect' : 'Simulate Connect'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>

        {/* Left Column */}
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#334155', marginBottom: '1.5rem', fontWeight: 600 }}>WhatsApp Cloud API Setup</h2>

          {isConnected ? (

            <>
              <div style={{ padding: '1.5rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '2rem' }}>
                <p style={{ color: 'var(--wa-green)', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>
                  WhatsApp API connected using Embedded SignUp on {setupDetails?.setup_completed_at || 'N/A'}
                </p>
              </div>

              {/* Default Phone Number */}
              <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <span style={{ position: 'absolute', top: '-12px', left: '16px', background: 'white', padding: '0 0.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: '4px' }}>Default Phone Number</span>
                <div className="card" style={{ padding: '2rem 1.5rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: '8px' }}>
                  <div style={{ maxWidth: '400px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Select Default Phone Number</label>
                    <select 
                      className="form-input" 
                      style={{ width: '100%', padding: '0.6rem 1rem', border: '1px solid #cbd5e1', borderRadius: '4px', marginBottom: '1rem', appearance: 'auto' }}
                      value={activePhoneId}
                      readOnly
                    >
                      {phoneNumbers.length > 0 ? (
                        phoneNumbers.map(phone => (
                          <option key={phone.id} value={phone.id}>
                            {phone.display_phone_number} ({phone.verified_name})
                          </option>
                        ))
                      ) : (
                        <option value="">No phone numbers found</option>
                      )}
                    </select>
                    <button style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', padding: '0.5rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                  </div>
                </div>
              </div>

              {/* Test Contact */}
              <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <span style={{ position: 'absolute', top: '-12px', left: '16px', background: 'white', padding: '0 0.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} onClick={() => toggleConnectedSection('testContact')}>
                  Test Contact for Campaign <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 400 }}>Click to expand/collapse</span>
                </span>
                <div className="card" style={{ padding: '2rem 1.5rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: '8px' }}>
                  {openConnectedSections.testContact && (
                    <span style={{ backgroundColor: '#22c55e', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, width: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Check size={14} strokeWidth={3} /> CONFIGURED
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Row */}
              <div style={{ marginTop: '2rem', padding: '1.5rem 0' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 600 }}>It's ready</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>In order to send template message you should have created and approved templates for WhatsApp Business.</p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button style={{ backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '4px', padding: '0.6rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Manage Templates</button>
                  <button style={{ backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '4px', padding: '0.6rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Manage Contacts</button>
                  <button style={{ backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '0.6rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Create New Campaign</button>
                  <button onClick={() => setIsConnected(false)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0.6rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Disconnect Account</button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Facebook connect */}
              <div style={{ position: 'relative', marginBottom: '3rem' }}>
                <span style={{ position: 'absolute', top: '-12px', left: '16px', background: 'white', padding: '0 0.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: '4px' }}>WhatsApp Setup with Facebook</span>
                <div className="card" style={{ padding: '2rem', display: 'flex', justifyContent: 'center', border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: '8px' }}>
                  <button 
                    onClick={handleFacebookLogin} 
                    disabled={isSetupInProcess}
                    style={{ 
                      backgroundColor: '#1877f2', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      padding: '0.75rem 1.5rem', 
                      fontSize: '0.9rem', 
                      fontWeight: 600, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      cursor: isSetupInProcess ? 'not-allowed' : 'pointer',
                      opacity: isSetupInProcess ? 0.7 : 1
                    }}
                  >
                    {isSetupInProcess ? (
                      <>
                        <RefreshCw className="animate-spin" size={18} /> Connecting...
                      </>
                    ) : (
                      <>
                        <Facebook size={18} /> Connect WhatsApp with Facebook <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'center', color: '#64748b', margin: '2rem 0', fontWeight: 500 }}>OR</div>

              {/* Manual connect */}
              <div style={{ position: 'relative', marginBottom: '3rem' }}>
                <span style={{ position: 'absolute', top: '-12px', left: '16px', background: 'white', padding: '0 0.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: '4px' }}>Connect WhatsApp Manually</span>
                <div className="card" style={{ padding: '2rem 1.5rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: '8px' }}>

                  {/* Accordion 1 */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
                    <div onClick={() => toggleSection('fbApp')} style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', borderBottom: openSections.fbApp ? '1px solid #e2e8f0' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#3b82f6', fontWeight: 500 }}>
                        Facebook Developer Account & Facebook App <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Click to expand/collapse</span>
                      </div>
                    </div>
                    {openSections.fbApp && (
                      <div style={{ padding: '1.5rem 1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>To get started you should have <strong>Facebook App</strong>, you mostly need to select Business as type of your app.</p>
                          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#22c55e', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>Help & More Information <ExternalLink size={14} /></a>
                        </div>

                        <button style={{ backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '0.6rem 1rem', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', cursor: 'pointer' }}>
                          Create or Select Facebook App <ExternalLink size={14} />
                        </button>

                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Once you have the Facebook app, add your App ID below, you will find it in App Settings &gt; Basic</p>

                        <div style={{ marginBottom: '1rem', maxWidth: '400px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Facebook App ID</label>
                          <div className="form-input" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '4px' }}>
                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>×</span> <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Your Facebook App ID</span>
                          </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Facebook App Secret</label>
                          <div className="form-input" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '4px' }}>
                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>×</span> <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Add your Facebook App Secret</span>
                          </div>
                        </div>

                        <button style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', padding: '0.5rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, marginBottom: '2rem', cursor: 'pointer' }}>Save & Connect</button>

                        <p style={{ fontSize: '0.8rem', color: '#d97706', marginBottom: '1rem' }}>Once you submit app id and app secret webhook will be created automatically</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ backgroundColor: 'white', color: '#ef4444', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>!</span> NOT CONFIGURED
                          </span>
                          <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ backgroundColor: 'white', color: '#ef4444', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>!</span> WEBHOOK NOT CONFIGURED
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accordion 2 */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
                    <div onClick={() => toggleSection('waIntegration')} style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', borderBottom: openSections.waIntegration ? '1px solid #e2e8f0' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#3b82f6', fontWeight: 500 }}>
                        WhatsApp Integration Setup <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Click to expand/collapse</span>
                      </div>
                    </div>
                    {openSections.waIntegration && (
                      <div style={{ padding: '1.5rem 1rem' }}>
                        <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ backgroundColor: 'white', color: '#ef4444', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>!</span> NOT CONFIGURED
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Accordion 3 */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div onClick={() => toggleSection('testContact')} style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', borderBottom: openSections.testContact ? '1px solid #e2e8f0' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#3b82f6', fontWeight: 500 }}>
                        Test Contact for Campaign <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Click to expand/collapse</span>
                      </div>
                    </div>
                    {openSections.testContact && (
                      <div style={{ padding: '1.5rem 1rem' }}>
                        <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ backgroundColor: 'white', color: '#ef4444', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>!</span> NOT CONFIGURED
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Disabled Actions Row */}
                  <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', opacity: 0.6 }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 600 }}>It's ready</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>In order to send template message you should have created and approved templates for WhatsApp Business.</p>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button disabled style={{ backgroundColor: '#cbd5e1', color: '#64748b', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'not-allowed' }}>Manage Templates</button>
                      <button disabled style={{ backgroundColor: '#cbd5e1', color: '#64748b', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'not-allowed' }}>Manage Contacts</button>
                      <button disabled style={{ backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'not-allowed' }}>Create New Campaign</button>
                      <button disabled style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'not-allowed' }}>Disconnect Account</button>
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}

        </div>

        {/* Right Column */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', top: '-12px', left: '16px', background: 'white', padding: '0 0.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: '4px', zIndex: 1 }}>WhatsApp Business Info</span>
          <div className="card" style={{ padding: '2.5rem 1.5rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: '8px' }}>

            <div style={{ position: 'relative', marginBottom: '2rem', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.5rem 1rem 1rem' }}>
              <span style={{ position: 'absolute', top: '-10px', left: '12px', background: 'white', padding: '0 0.4rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>Phone Numbers</span>

              {isConnected ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Phone Number ID</div>
                    <div style={{ fontSize: '0.9rem', color: '#475569' }}>{activePhoneId || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Verified Name</div>
                    <div style={{ fontSize: '0.9rem', color: '#475569' }}>{activePhone?.verified_name || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Display Phone Number</div>
                    <div style={{ fontSize: '0.9rem', color: '#475569' }}>{activePhone?.display_phone_number || setupDetails?.display_phone_number || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Quality Rating</div>
                    <div style={{ fontSize: '0.9rem', color: activePhone?.quality_rating === 'GREEN' ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{activePhone?.quality_rating || 'N/A'}</div>
                  </div>
                  <div>
                    <button style={{ backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                      <SettingsIcon size={12} /> Update Business Profile
                    </button>
                  </div>
                </div>
              ) : null}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', padding: '0.5rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', opacity: isConnected ? 1 : 0.5 }} disabled={!isConnected}>Re-sync Phone Numbers</button>
                <button style={{ backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', padding: '0.5rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', opacity: isConnected ? 1 : 0.5 }} disabled={!isConnected}>Manage Phone Numbers <ExternalLink size={12} /></button>
              </div>
            </div>

            <div style={{ position: 'relative', marginBottom: '2rem', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.5rem 1rem 1rem' }}>
              <span style={{ position: 'absolute', top: '-10px', left: '12px', background: 'white', padding: '0 0.4rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>Overall Health</span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>WhatsApp Business ID</div>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>{isConnected ? (setupDetails?.waba_id || '-') : '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Status as at</div>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>{isConnected ? (healthUpdatedAt || setupDetails?.setup_completed_at || '-') : '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Overall Health</div>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>{isConnected ? (activePhone?.status || 'CONNECTED') : '-'}</div>
                </div>

                {isConnected && healthEntities.length > 0 ? (
                  <>
                    {healthEntities.map((entity, index) => (
                      <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.75rem' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>{entity.entity_type} {entity.id}</div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>Can Send Message</div>
                        <div style={{ fontSize: '0.85rem', color: entity.can_send_message === 'AVAILABLE' ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{entity.can_send_message}</div>
                      </div>
                    ))}
                  </>
                ) : isConnected ? (
                  <>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>WABA {setupDetails?.waba_id || ''}</div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>Can Send Message</div>
                      <div style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 700 }}>AVAILABLE</div>
                    </div>
                  </>
                ) : null}
              </div>

            </div>

            <button style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', padding: '0.6rem 1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', opacity: isConnected ? 1 : 0.5 }} disabled={!isConnected}>
              Refresh Status
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}


