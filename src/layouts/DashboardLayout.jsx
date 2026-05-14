import { API_BASE_URL } from '../config';
import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, User, LayoutDashboard, Gift, Grid, MessageCircle, Clock, Anchor, Megaphone, List, Wallet, Users, Share2, Layers, ChevronRight, ArrowLeft, TrendingUp, Waypoints, Bot, Database, Settings as SettingsIcon } from 'lucide-react';

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1200);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1200);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarItems = [
    { icon: LayoutDashboard, text: 'Dashboard', path: '/dashboard' },
    // { icon: Gift, text: 'Refer & Earn', path: '#' },
    // { icon: Grid, text: 'QR Code', path: '#' },
    { icon: MessageCircle, text: 'WhatsApp Chat', path: '#' },
    { icon: Clock, text: 'Message Log', path: '/dashboard/message-log' },

    // { icon: Anchor, text: 'Leads', hasSubmenu: true, path: '#' },
    { icon: Megaphone, text: 'Campaigns', path: '/dashboard/campaigns' },
    // { icon: List, text: 'Drip Campaigns', path: '#' },
    // { icon: Wallet, text: 'Wallet', path: '#' },
    {
      icon: Users, text: 'Contacts', hasSubmenu: true, path: '/dashboard/contacts', submenu: [
        { text: 'Lists', path: '/dashboard/contacts' },
        { text: 'Groups', path: '/dashboard/contacts/groups' },
        { text: 'Labels', path: '/dashboard/contacts/labels' }
      ]
    },
    // { icon: Waypoints, text: 'Flow Messages', hasSubmenu: true, path: '#' },
    { icon: Layers, text: 'Templates', path: '/dashboard/whatsapp-templates' },
    {
      icon: Bot, text: 'Bot Replies', hasSubmenu: true, path: '/dashboard/bot', submenu: [
        { text: 'Flows', path: '/dashboard/bot/flows' }
      ]
    },
    { icon: User, text: 'Subscription Plans', path: '/dashboard/subscription' },
    { icon: SettingsIcon, text: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: isLargeScreen ? '260px' : (isHovered ? '260px' : '64px'),
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 40,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
    >
      <div style={{
        height: '60px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottom: '1px solid var(--border-color)',
        paddingLeft: '14px',
        flexShrink: 0
      }}>
        <div style={{ background: 'linear-gradient(135deg, var(--wa-green) 0%, var(--wa-teal) 100%)', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)' }}>
          <TrendingUp size={20} strokeWidth={2.5} />
        </div>
        <span style={{
          fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginLeft: '1rem', letterSpacing: '-0.5px',
          opacity: (isHovered || isLargeScreen) ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap'
        }}>
          SaleGrowy
        </span>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '1.5rem 0.5rem', width: '100%', overflow: 'hidden' }}>
        {sidebarItems.map((item, index) => {
          const isActive =
            (item.path !== '#' && location.pathname === item.path) ||
            (item.path !== '#' && item.path !== '/dashboard' && location.pathname.startsWith(item.path)) ||
            (location.pathname === '/' && item.path === '/dashboard');
          return (
            <div key={index}>

              {/* ✅ MAIN ITEM */}
              {item.hasSubmenu ? (
                // 🔹 SUBMENU PARENT
                <div
                  onClick={() => setOpenMenu(openMenu === index ? null : index)}
                  style={{
                    color: isActive ? 'var(--wa-green)' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '0.6rem 0.5rem',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'rgba(37, 211, 102, 0.1)' : 'transparent',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  <div style={{ width: '36px', display: 'flex', justifyContent: 'center' }}>
                    <item.icon size={20} />
                  </div>

                  <span style={{
                    marginLeft: '0.75rem',
                    opacity: (isHovered || isLargeScreen) ? 1 : 0,
                    flex: 1
                  }}>
                    {item.text}
                  </span>

                  <ChevronRight
                    size={16}
                    style={{
                      transform: openMenu === index ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: '0.2s'
                    }}
                  />
                </div>
              ) : (
                // 🔹 NORMAL CLICKABLE LINK
                <Link
                  to={item.path}
                  style={{
                    color: isActive ? 'var(--wa-green)' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '0.6rem 0.5rem',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'rgba(37, 211, 102, 0.1)' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  <div style={{ width: '36px', display: 'flex', justifyContent: 'center' }}>
                    <item.icon size={20} />
                  </div>

                  <span style={{
                    marginLeft: '0.75rem',
                    opacity: (isHovered || isLargeScreen) ? 1 : 0,
                    flex: 1
                  }}>
                    {item.text}
                  </span>
                </Link>
              )}

              {/* ✅ SUBMENU */}
              {item.hasSubmenu && openMenu === index && (isHovered || isLargeScreen) && (
                <div style={{ paddingLeft: '2.5rem' }}>
                  {item.submenu.map((sub, i) => {
                    const isSubActive = location.pathname === sub.path;

                    return (
                      <Link
                        key={i}
                        to={sub.path}
                        style={{
                          display: 'block',
                          padding: '0.4rem 0',
                          fontSize: '0.9rem',
                          color: isSubActive ? 'var(--wa-green)' : '#64748b',
                          textDecoration: 'none'
                        }}
                      >
                        {sub.text}
                      </Link>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </nav>
    </aside>
  );
};

const Topbar = ({ isLargeScreen }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [vendorUserData, setVendorUserData] = useState(null);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/profile`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data?.user) setVendorUserData(result.data.user);
          else setVendorUserData({});
        } else {
          setVendorUserData({});
        }
      } catch (e) {
        setVendorUserData({});
      }
    };
    fetchProfile();

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <header style={{ height: '60px', backgroundColor: 'var(--wa-green)', position: 'fixed', top: 0, left: isLargeScreen ? '260px' : '64px', right: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '0.5px' }}>DASHBOARD</div>
      </div>


      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={18} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid var(--wa-green)' }}></div>
        </div>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <div onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>
                {vendorUserData ? `${vendorUserData.first_name || ''} ${vendorUserData.last_name && vendorUserData.last_name !== 'lastName' ? vendorUserData.last_name : ''}`.trim() || 'Vendor' : 'Loading...'}
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} />
            </div>
          </div>

          {showProfileMenu && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: '150px', overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 50 }}>
              <Link to="/dashboard/profile" onClick={() => setShowProfileMenu(false)} style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#1e293b', textDecoration: 'none', borderBottom: '1px solid #f1f5f9', fontWeight: 500 }}>
                My Profile
              </Link>
              <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default function DashboardLayout() {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1200);
  const location = useLocation();

  // Routes that should be full width without sidebar/topbar
  const isFullWidthRoute = location.pathname === '/dashboard/agent' || location.pathname === '/dashboard/chatflow';

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1200);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#ffffff', overflow: 'hidden' }}>
      {!isFullWidthRoute && <Sidebar />}
      <div style={{
        flex: 1,
        marginLeft: !isFullWidthRoute ? (isLargeScreen ? '260px' : '64px') : '0',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {!isFullWidthRoute && <Topbar isLargeScreen={isLargeScreen} />}
        <main style={{
          padding: !isFullWidthRoute ? '1.5rem 2rem' : '0',
          marginTop: !isFullWidthRoute ? '60px' : '0',
          flex: 1,
          height: !isFullWidthRoute ? 'calc(100vh - 60px)' : '100vh',
          width: '100%',
          overflowX: 'hidden',
          overflowY: 'auto',
          display: isFullWidthRoute ? 'flex' : 'block',
          flexDirection: 'column'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

