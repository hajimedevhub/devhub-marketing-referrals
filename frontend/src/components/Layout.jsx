import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/partners', label: 'Partners' },
    { path: '/admin/clients', label: 'Clients' }
  ];

  return (
    <div className="min-h-screen bg-gray-100" style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <h1 style={styles.brand}>DevHub Referrals</h1>
          <div style={styles.navLinks}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navLink,
                  ...(location.pathname === item.path ? styles.navLinkActive : {})
                }}
              >
                {item.label}
              </Link>
            ))}
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  nav: {
    background: '#1e293b',
    padding: '0 24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  navInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px'
  },
  brand: {
    color: 'white',
    fontSize: '20px',
    fontWeight: '700',
    margin: 0
  },
  navLinks: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  navLink: {
    color: '#cbd5e1',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500'
  },
  navLinkActive: {
    background: '#3b82f6',
    color: 'white'
  },
  logoutBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px'
  }
};

export default Layout;