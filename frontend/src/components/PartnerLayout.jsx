import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PartnerAPI } from '../api';
import { useIsMobile } from '../hooks/useMediaQuery';

function PartnerLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [partner, setPartner] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    PartnerAPI.get('/partner-auth/me')
      .then((res) => setPartner(res.data.partner))
      .catch(() => {});
  }, []);

  // Close the menu whenever the page changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close the menu if the screen grows to desktop size
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  // Lock page scroll while the menu is open, and close on Escape
  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('partnerToken');
    navigate('/partner/login');
  };

  const navItems = [
    { path: '/partner/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/partner/clients', label: 'Clients', icon: '👥' }
  ];

  // A client detail page (/partner/clients/:id) should still highlight "Clients"
  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const logo = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '700',
          fontSize: '16px',
          flexShrink: 0
        }}
      >
        P
      </div>
      <span
        style={{
          fontWeight: '700',
          fontSize: '16px',
          color: '#0f172a',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        DevHub Partner
      </span>
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Top gradient bar */}
      <div style={{ height: '4px', background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)' }} />

      <header
        style={{
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          padding: isMobile ? '0 16px' : '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: isMobile ? '60px' : '68px',
            gap: '12px'
          }}
        >
          {isMobile ? (
            <>
              {logo}

              {/* Hamburger button (right side) */}
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="partner-mobile-menu"
                style={{
                  width: '44px',
                  height: '44px',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      display: 'block',
                      width: '20px',
                      height: '2px',
                      borderRadius: '2px',
                      background: '#334155'
                    }}
                  />
                ))}
              </button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '32px', minWidth: 0 }}>
                {logo}

                <nav style={{ display: 'flex', gap: '4px' }}>
                  {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: active ? '#6366f1' : '#64748b',
                          background: active ? '#eef2ff' : 'transparent',
                          transition: 'all 0.15s',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span style={{ marginRight: '6px' }}>{item.icon}</span>
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                {partner && (
                  <div style={{ textAlign: 'right', minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                      {partner.name}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                        maxWidth: '220px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {partner.company || partner.email}
                    </div>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    color: '#64748b',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Mobile slide-out menu */}
      {isMobile && (
        <>
          {/* Dimmed backdrop: tap to close */}
          <div
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.5)',
              opacity: menuOpen ? 1 : 0,
              pointerEvents: menuOpen ? 'auto' : 'none',
              transition: 'opacity 0.25s ease',
              zIndex: 20
            }}
          />

          <aside
            id="partner-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            aria-hidden={!menuOpen}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(300px, 85vw)',
              background: 'white',
              boxShadow: '-8px 0 24px rgba(15, 23, 42, 0.15)',
              transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
              visibility: menuOpen ? 'visible' : 'hidden',
              transition: 'transform 0.25s ease, visibility 0.25s',
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              overflowY: 'auto'
            }}
          >
            {/* Drawer header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid #e2e8f0'
              }}
            >
              <span style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '18px',
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Partner info */}
            {partner && (
              <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0f172a',
                    overflowWrap: 'anywhere'
                  }}
                >
                  {partner.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', overflowWrap: 'anywhere' }}>
                  {partner.company || partner.email}
                </div>
              </div>
            )}

            {/* Links */}
            <nav style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 16px',
                      minHeight: '44px',
                      boxSizing: 'border-box',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '600',
                      color: active ? '#6366f1' : '#334155',
                      background: active ? '#eef2ff' : 'transparent'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Sign out pinned to the bottom */}
            <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  color: '#991b1b',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Sign out
              </button>
            </div>
          </aside>
        </>
      )}

      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '20px 16px' : '32px 24px',
          boxSizing: 'border-box',
          width: '100%'
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default PartnerLayout;