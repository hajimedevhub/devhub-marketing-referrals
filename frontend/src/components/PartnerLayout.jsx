import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PartnerAPI } from '../api';

function PartnerLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    PartnerAPI.get('/partner-auth/me')
      .then((res) => setPartner(res.data.partner))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('partnerToken');
    navigate('/partner/login');
  };

  const navItems = [
    { path: '/partner/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/partner/clients', label: 'Clients', icon: '👥' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top gradient bar */}
      <div style={{ height: '4px', background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)' }} />

      <header style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '68px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: '16px'
              }}>P</div>
              <span style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>
                DevHub Partner
              </span>
            </div>

            <nav style={{ display: 'flex', gap: '4px' }}>
              {navItems.map((item) => {
                const active = location.pathname === item.path;
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
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ marginRight: '6px' }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {partner && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                  {partner.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
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
                cursor: 'pointer'
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  );
}

export default PartnerLayout;