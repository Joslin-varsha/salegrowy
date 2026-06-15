import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Gift, Store, Megaphone, Users, User, Languages, FileText, Settings, ShieldAlert, LogOut, ChevronDown, Bell } from 'lucide-react';

export default function SuperAdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1200);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const token = localStorage.getItem('token');
  if (!token || token === 'null' || token === 'undefined') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1200);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarItems = [
    { icon: LayoutDashboard, text: 'Dashboard', path: '/superadmin' },
    // { icon: Gift, text: 'Refer & Earn List', path: '#' },
    { icon: Store, text: 'Vendors', path: '/superadmin/vendors' },
    { icon: Megaphone, text: 'Campaign List', path: '/superadmin/campaigns' },
    // { icon: Users, text: 'Resellers', path: '#' },
    // { icon: User, text: 'Subscriptions', hasSubmenu: true, path: '#' },
    // { icon: Languages, text: 'Translations', path: '#' },
    // { icon: FileText, text: 'Pages', path: '#' },
    // { icon: Settings, text: 'Configurations', hasSubmenu: true, path: '#' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f0f2f5]">
      {/* Sidebar */}
      <aside 
        className="bg-white flex-col transition-all duration-300 ease-in-out border-r border-gray-200 z-20"
        style={{ 
          width: isLargeScreen ? '260px' : (isSidebarOpen ? '260px' : '72px'),
          overflow: 'hidden', 
          display: 'flex', 
          position: 'sticky', 
          top: 0, 
          height: '100vh',
          boxShadow: '2px 0 8px rgba(0,0,0,0.02)'
        }}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--wa-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
            S
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {sidebarItems.map((item, idx) => {
            const isActive = location.pathname === item.path || (item.path !== '/superadmin' && location.pathname.startsWith(item.path));
            
            return (
              <Link 
                key={idx} 
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', padding: '0.75rem 1.5rem',
                  color: isActive ? 'var(--wa-green)' : '#64748b',
                  backgroundColor: isActive ? 'rgba(37, 211, 102, 0.05)' : 'transparent',
                  borderRight: isActive ? '3px solid var(--wa-green)' : '3px solid transparent',
                  textDecoration: 'none', transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <item.icon size={20} style={{ minWidth: '20px' }} />
                <span style={{ 
                  marginLeft: '1rem', fontWeight: isActive ? 600 : 500, fontSize: '0.85rem',
                  opacity: (isSidebarOpen || isLargeScreen) ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap'
                }}>
                  {item.text}
                </span>
                {item.hasSubmenu && (isSidebarOpen || isLargeScreen) && (
                  <ChevronDown size={14} style={{ position: 'absolute', right: '1.5rem', color: '#94a3b8' }} />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col" style={{ minWidth: 0 }}>
        {/* Header */}
        <header style={{ 
          height: '70px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '0 2rem', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.015)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '4px', height: '22px', backgroundColor: 'var(--wa-green)', borderRadius: '4px' }}></div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.3px', color: '#0f172a' }}>SUPER ADMIN</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative', cursor: 'pointer', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor='#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.backgroundColor='#f8fafc'}>
              <Bell size={18} color="#64748b" />
              <div style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid #ffffff' }}></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer', borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>Administrator</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>Super Admin Role</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(37,211,102,0.1) 0%, rgba(37,211,102,0.2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(37,211,102,0.2)' }}>
                <User size={18} color="var(--wa-green)" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
