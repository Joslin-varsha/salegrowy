import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ExternalLink } from 'lucide-react';

export default function Pricing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Find the parent <main> element and override its padding and background
    const mainEl = document.querySelector('main');
    if (mainEl) {
      const originalPadding = mainEl.style.padding;
      const originalBackground = mainEl.style.background;
      
      mainEl.style.padding = '0';
      mainEl.style.background = '#ffffff';
      
      return () => {
        mainEl.style.padding = originalPadding;
        mainEl.style.background = originalBackground;
      };
    }
  }, []);

  const plans = [
    {
      name: 'Free',
      price: '₹0.00 INR',
      duration: '7 Days',
      features: [
        { text: '1000 Contacts', included: true },
        { text: '50 Campaigns Per Month', included: true },
        { text: '100 Bot Replies', included: true },
        { text: '5 Bot Flows', included: true },
        { text: '2 Contact Custom Fields', included: true },
        { text: '0 Team Members/Agents', included: true },
        { text: 'AI Chat Bot', included: false },
        { text: 'API and Webhook Access', included: false }
      ]
    },
    {
      name: 'Standard',
      price: '₹599.00 INR',
      duration: 'monthly',
      yearlyPrice: '₹499.00 INR /Month',
      features: [
        { text: '10000 Contacts', included: true },
        { text: '100 Campaigns Per Month', included: true },
        { text: '5 Bot Flows', included: true },
        { text: '5 Contact Custom Fields', included: true },
        { text: '5 Team Members/Agents', included: true },
        { text: 'AI Chat Bot 10 Predictions', included: true, highlight: '10 Predictions' },
        { text: 'API and Webhook Access', included: true },
        { text: '500 Chat Bot Messages Per Month', included: true }
      ]
    },
    {
      name: 'Premium',
      price: '₹999.00 INR',
      duration: 'monthly',
      yearlyPrice: '₹899.00 INR /Month',
      isPopular: true,
      features: [
        { text: '50000 Contacts', included: true },
        { text: '100 Campaigns Per Month', included: true },
        { text: '5 Bot Flows', included: true },
        { text: '10 Contact Custom Fields', included: true },
        { text: '10 Team Members/Agents', included: true },
        { text: 'AI Chat Bot 250 Predictions', included: true, highlight: '250 Predictions' },
        { text: 'API and Webhook Access', included: true },
        { text: '2500 Chat Bot Messages Per Month', included: true }
      ]
    },
    {
      name: 'Ultimate',
      price: '₹1,999.00 INR',
      duration: 'monthly',
      yearlyPrice: '₹1,799.00 INR /Month',
      features: [
        { text: 'Unlimited Contacts', included: true },
        { text: 'Unlimited Campaigns Per Month', included: true },
        { text: 'Unlimited Bot Flows', included: true },
        { text: 'Unlimited Contact Custom Fields', included: true },
        { text: 'Unlimited Team Members/Agents', included: true },
        { text: 'AI Chat Bot 2000 Predictions', included: true, highlight: '2000 Predictions' },
        { text: 'API and Webhook Access', included: true },
        { text: '25000 Chat Bot Messages Per Month', included: true }
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '1.25rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
            Simple and Clear Pricing
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            Choose a plan that fits your business scale. No hidden fees.
          </p>
        </div>

        {/* Grid Container */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1.25rem', 
          alignItems: 'stretch' 
        }}>
          {plans.map((plan, index) => (
            <div 
              key={index} 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: plan.isPopular ? '0 15px 20px -5px rgba(0,0,0,0.06), 0 8px 8px -5px rgba(0,0,0,0.03)' : '0 8px 12px -3px rgba(0,0,0,0.03), 0 3px 4px -2px rgba(0,0,0,0.03)',
                border: plan.isPopular ? '2px solid #25d366' : '1px solid #edf2f7',
                padding: '1.5rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {plan.isPopular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#25d366',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '4px 16px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Most Popular
                </div>
              )}

              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{plan.name}</h3>
                
                {/* Price block */}
                <div style={{ marginTop: '0.75rem' }}>
                  {plan.yearlyPrice ? (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>{plan.duration}</span>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#e11d48' }}>{plan.price}</span>
                      
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginTop: '0.35rem' }}>yearly</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e11d48' }}>{plan.yearlyPrice}</span>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#e11d48' }}>{plan.price}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '0.15rem', fontWeight: 600 }}>{plan.duration}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features List */}
              <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.825rem', color: '#475569' }}>
                      {feature.included ? (
                        <Check size={16} style={{ color: '#22c55e', shrink: 0, marginTop: '2px' }} />
                      ) : (
                        <X size={16} style={{ color: '#ef4444', shrink: 0, marginTop: '2px' }} />
                      )}
                      <span>
                        {feature.highlight ? (
                          <>
                            {feature.text.replace(feature.highlight, '')}
                            <strong>{feature.highlight}</strong>
                          </>
                        ) : (
                          feature.text
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Get Started Button */}
              <button 
                onClick={() => navigate('/register')}
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  padding: '0.6rem 1.25rem', 
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px'
                }}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
