import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Star, Zap, Crown, Loader2, Gift } from 'lucide-react';


const ShopifySubscription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('premium'); // Default to middle plan

  const vendorId = location.state?.vendorId;
  const token = location.state?.token;

  const encryptedToken = token || localStorage.getItem("token");
  const decryptedToken = decryptData(encryptedToken);


  const handleBuyPlan = async (planName) => {
    const name = planName.toLowerCase();
    setSelectedPlan(name);

    console.log("Plan clicked:", planName);
    console.log("Current vendorId:", vendorId);

    if (!vendorId) {
      console.error("Missing vendorId! Redirecting state:", location.state);
      alert("Vendor information missing. Please try logging in again.");
      return;
    }

    setLoadingPlan(planName);
    try {
      const payload = {
        vendorId: String(vendorId),
        plan: name
      };

      console.log("Sending Payload to createShopifySubscription:", payload);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/createShopifySubscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${decryptedToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success && result.confirmationUrl) {
        window.location.href = result.confirmationUrl;
      } else {
        alert(result.message || "Failed to create subscription.");
      }
    } catch (error) {
      console.error("Shopify Subscription API Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      id: 'standard',
      name: 'Standard',
      icon: <Zap size={18} className="text-blue-500" />,
      price: '599',
      features: ['10k Contacts', '100 Campaigns/Mo', '5 Bot Flows', '10 AI Replies'],
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: <Star size={18} className="text-amber-500" />,
      price: '999',
      features: ['50k Contacts', '100 Campaigns/Mo', '5 Bot Flows', '250 AI Replies'],
      isPopular: true,
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      icon: <Crown size={18} className="text-purple-500" />,
      price: '1,999',
      features: ['Unlimited Contacts', 'Unlimited Campaigns', 'Unlimited Flows', '2k AI Replies'],
    }
  ];

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1000px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Compact Trial Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          backgroundColor: '#22c55e',
          color: 'white',
          padding: '0.6rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)'
        }}>
          <Gift size={18} />
          <span style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            7 Days Free Trial included with any plan!
          </span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Select Your Plan</h2>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>Scale your business with professional marketing tools</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem'
        }}>
          {plans.map((plan, index) => (
            <div
              key={index}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: `1.5px solid ${selectedPlan === plan.id ? '#22c55e' : '#e2e8f0'}`,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedPlan === plan.id ? '0 10px 15px -3px rgba(34, 197, 94, 0.08)' : '0 1px 2px rgba(0,0,0,0.03)',
                transform: selectedPlan === plan.id ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ padding: '0.4rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>{plan.icon}</div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: 0 }}>{plan.name}</h3>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>₹{plan.price}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>/mo</span>
                </div>
              </div>

              <div style={{ flex: 1, marginBottom: '1.25rem' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#475569' }}>
                      <Check size={12} style={{ color: '#22c55e', flexShrink: 0 }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                disabled={loadingPlan !== null}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyPlan(plan.name);
                }}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: selectedPlan === plan.id ? '#22c55e' : '#1e293b',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                {loadingPlan === plan.name ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  'Activate Plan'
                )}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.65rem', marginTop: '0.5rem' }}>
          Payments processed securely via Shopify. Cancel anytime in store settings.
        </p>
      </div>
    </div>
  );
};

export default ShopifySubscription;
