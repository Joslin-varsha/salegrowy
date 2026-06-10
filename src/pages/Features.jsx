import React, { useEffect } from 'react';
import { 
  LogIn, 
  FileText, 
  Smartphone, 
  MessageSquare, 
  Bot, 
  Share2, 
  Users, 
  Zap, 
  LayoutDashboard, 
  UserPlus, 
  ListPlus
} from 'lucide-react';

export default function Features() {

  useEffect(() => {
    // Override parent <main> container to be fully white with no padding
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

  const featureList = [
    {
      title: 'Embedded Signup',
      desc: 'Onboard customers with ease with our integrated Embedded Signup system.',
      icon: <LogIn size={24} />
    },
    {
      title: 'Template Management',
      desc: 'Handle templates directly within the application without requiring a visit to Meta for creating templates.',
      icon: <FileText size={24} />
    },
    {
      title: 'Multiple Phone Numbers',
      desc: 'Supports multiple phone numbers for same WhatsApp Business Account',
      icon: <Smartphone size={24} />
    },
    {
      title: 'WhatsApp Chat',
      desc: 'Sale growy - Bulk Whatsapp Campaign, AI chatbot, Sequence chat feature replicates the native WhatsApp interface, guaranteeing users a seamless and familiar messaging experience.',
      icon: <MessageSquare size={24} />
    },
    {
      title: 'Bot Replies/ Chat Bot',
      desc: 'Automate responses and engage customers 24/7 with intelligent bot replies through',
      icon: <Bot size={24} />
    },
    {
      title: 'APIs to connect with other services',
      desc: "API's enable seamless connection between different services, allowing data sharing and functionality integration.",
      icon: <Share2 size={24} />
    },
    {
      title: 'Manage Contacts',
      desc: 'Effortlessly import and export contacts using XLSX format for easy contacts transfer along with Add/Edit functionality on interface.',
      icon: <Users size={24} />
    },
    {
      title: 'Realtime Updates',
      desc: 'Realtime message and campaign status updates to see your campaign or message performance.',
      icon: <Zap size={24} />
    },
    {
      title: 'Dashboard',
      desc: 'To provide with instant visibility into the performance and status of their marketing campaigns.',
      icon: <LayoutDashboard size={24} />
    },
    {
      title: 'Team Members/Agents',
      desc: 'Delegate work by creating users with various permissions.',
      icon: <UserPlus size={24} />
    },
    {
      title: 'Interactive/Button Messages for bot Reply',
      desc: 'Sale growy - Bulk Whatsapp Campaign, AI chatbot, Sequence Advanced interactive bots now provide smarter, more engaging replies, supporting images, documents, videos, audios and interactive buttons for enhanced user interaction.',
      icon: <MessageSquare size={24} />
    },
    {
      title: 'Custom Fields',
      desc: 'Personalize your messages with user base information and custom fields tailored to your audience on Sale growy - Bulk Whatsapp Campaign, AI chatbot, Sequence',
      icon: <ListPlus size={24} />
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '1.5rem 1.5rem 3rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Block */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: 'var(--wa-green)', fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Features
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', margin: '0.25rem 0 0.5rem' }}>
            Tech Empowerment
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>
            Features that would make your life easier with WhatsApp Marketing
          </p>
        </div>

        {/* Grid Container */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '2rem' 
        }}>
          {featureList.map((feature, index) => (
            <div 
              key={index} 
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '2.5rem 2rem',
                textAlign: 'center',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02), 0 4px 6px -2px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.02), 0 4px 6px -2px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.04)';
              }}
            >
              {/* Circular Badge Icon wrapper */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#f0fdf4',
                color: 'var(--wa-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 0 1px rgba(37,211,102,0.1)'
              }}>
                {feature.icon}
              </div>

              {/* Text info */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem', marginTop: 0 }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
