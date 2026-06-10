import React, { useState } from 'react';
import { User, Smartphone, Mail, BookText, Send, HelpCircle, MessageCircle } from 'lucide-react';
import { message } from 'antd';

export default function ContactUs() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    subject: '',
    messageText: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.messageText.trim()) {
      message.warning('Please fill in all required fields (Name, Email, and Message)');
      return;
    }

    setLoading(true);
    // Simulate email send
    setTimeout(() => {
      message.success('Your message has been sent successfully! We will get back to you soon.');
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        subject: '',
        messageText: ''
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="container" style={{ padding: '0.25rem 1rem', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      <div className="card animate-fade-in" style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        overflow: 'hidden', 
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)',
        border: '1px solid #edf2f7',
        padding: 0 // Remove default card padding so header fills the top
      }}>
        {/* Mock style Green Header matching another design (WhatsApp Green gradient) */}
        <div style={{
          background: 'linear-gradient(135deg, var(--wa-green) 0%, var(--wa-teal) 100%)',
          color: 'white',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <MessageCircle size={22} fill="white" stroke="var(--wa-green)" />
          <h2 style={{ color: 'white', margin: 0, fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.3px' }}>Contact Us</h2>
        </div>

        {/* Card Body */}
        <div className="card-body" style={{ padding: '1.75rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Full Name" 
                  required
                  style={{ padding: '0.6rem 1rem 0.6rem 2.5rem' }} 
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Phone Number</label>
              <div className="input-wrapper">
                <Smartphone size={18} className="input-icon" />
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Phone" 
                  style={{ padding: '0.6rem 1rem 0.6rem 2.5rem' }} 
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Email" 
                  required
                  style={{ padding: '0.6rem 1rem 0.6rem 2.5rem' }} 
                />
              </div>
            </div>

            {/* Subject */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Subject</label>
              <div className="input-wrapper">
                <BookText size={18} className="input-icon" />
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Subject" 
                  style={{ padding: '0.6rem 1rem 0.6rem 2.5rem' }} 
                />
              </div>
            </div>

            {/* Message */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Message</label>
              <textarea 
                name="messageText"
                value={formData.messageText}
                onChange={handleChange}
                className="form-input"
                placeholder="Your message" 
                rows={4}
                required
                style={{ 
                  padding: '0.75rem 1rem', 
                  minHeight: '120px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Submit Button (Uses btn-primary to match theme) */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  padding: '0.65rem 2rem', 
                  fontSize: '0.9rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  opacity: loading ? 0.7 : 1
                }}
              >
                <Send size={16} />
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>

          {/* Footer help section */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--wa-green)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <HelpCircle size={16} />
              Need help?
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
              If you have any queries, contact us:
            </p>
            <a href="mailto:support@salegrowy.com" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem', marginTop: '0.5rem', textDecoration: 'none' }}>
              <Mail size={14} style={{ color: 'var(--text-secondary)' }} />
              support@salegrowy.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
