import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useMediaQuery';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/partners', label: 'Partners', icon: '🤝' },
    { path: '/admin/clients', label: 'Clients', icon: '👥' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        background: 'white',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          <Link to="/admin/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--text-primary)',
            fontWeight: '700',
            fontSize: '16px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: '700'
            }}>D</div>
            <span className="hide-mobile">DevHub Admin</span>
          </Link>

          {isMobile ? (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px'
              }}
              aria-label="Toggle menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: location.pathname === item.path ? 'var(--primary)' : 'var(--text-secondary)',
                    background: location.pathname === item.path ? 'var(--primary-light)' : 'transparent',
                    transition: 'var(--transition)'
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: '12px' }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {isMobile && menuOpen && (
          <div style={{
            borderTop: '1px solid var(--border)',
            background: 'white',
            padding: '8px'
          }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: location.pathname === item.path ? 'var(--primary)' : 'var(--text-secondary)',
                  background: location.pathname === item.path ? 'var(--primary-light)' : 'transparent',
                  marginBottom: '4px'
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="btn btn-danger btn-block"
              style={{ marginTop: '8px' }}
            >
              Sign out
            </button>
          </div>
        )}
      </nav>

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '20px 16px' : '32px 24px'
      }}>
        {children}
      </main>
    </div>
  );
}

export default Layout;