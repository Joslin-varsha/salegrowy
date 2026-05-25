import { AtSign, Send } from 'lucide-react';

export default function ForgotPassword() {
  return (
    <div className="container" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card animate-fade-in">
          
          <div className="card-header">
            <h2>Forgot your password?</h2>
          </div>
          
          <div className="card-body">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.6', textAlign: 'center' }}>
              No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.
            </p>
          
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div className="input-wrapper">
                <AtSign size={18} className="input-icon" />
                <input type="email" className="form-input" placeholder="Email" style={{ padding: '0.6rem 1rem 0.6rem 2.5rem' }} />
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button type="button" className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 2rem', fontSize: '0.85rem' }}>
                <Send size={16} />
                Email Password Reset Link
              </button>
            </div>
          </form>
          </div>

        </div>
      </div>
    </div>
  );
}
