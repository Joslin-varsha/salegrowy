import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, LogIn, UserPlus } from 'lucide-react';

export default function Header() {
  const location = useLocation();

  return (
    <header style={{ 
      backgroundColor: '#ffffff', 
      borderBottom: '1px solid var(--border-color)',
      padding: '0.75rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Logo area */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--wa-green) 0%, var(--wa-teal) 100%)',
            color: 'white',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)'
          }}>
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginLeft: '0.5rem', letterSpacing: '-0.5px' }}>
            SaleGrowy
          </span>
        </Link>

        {/* Navigation links */}
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="nav-links">
          <Link to="/features" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Features</Link>
          <Link to="/pricing" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Pricing</Link>
          <Link to="/contact" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Contact</Link>
          <Link to="/privacy-policy" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Privacy Policy</Link>
        </nav>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/">
            <button className={`${location.pathname === '/' ? 'btn btn-primary' : 'btn btn-outline'}`} style={{ width: 'auto', padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}>
              <LogIn size={16} />
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className={`${location.pathname === '/register' ? 'btn btn-primary' : 'btn btn-outline'}`} style={{ width: 'auto', padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}>
              <UserPlus size={16} />
              Register
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
