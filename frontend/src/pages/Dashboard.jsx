import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useIsMobile } from '../hooks/useMediaQuery';
import API from '../api';

function Dashboard() {
  const isMobile = useIsMobile();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/clients/stats/overview');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><p>Loading...</p></Layout>;

  const cards = [
    { label: 'Total Partners', value: stats?.totalPartners || 0, color: '#3b82f6' },
    { label: 'Total Clients', value: stats?.totalClients || 0, color: '#10b981' },
    { label: 'New Leads', value: stats?.newClients || 0, color: '#f59e0b' },
    { label: 'Converted', value: stats?.convertedClients || 0, color: '#8b5cf6' },
    { label: 'Last 7 Days', value: stats?.recentClients || 0, color: '#ec4899' }
  ];

  return (
    <Layout>
      <h2 style={styles.heading}>Dashboard Overview</h2>
      
      <div style={{
  display: 'grid',
  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '12px',
  marginBottom: '32px'
}}>
        {cards.map((card) => (
          <div key={card.label} style={styles.card}>
            <p style={styles.cardLabel}>{card.label}</p>
            <p style={{ ...styles.cardValue, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Clients per Partner</h3>
        {stats?.clientsPerPartner?.length === 0 ? (
          <p style={styles.empty}>No clients yet</p>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <span>Partner</span>
              <span>Clients</span>
            </div>
            {stats?.clientsPerPartner?.map((item) => (
              <div key={item._id} style={styles.tableRow}>
                <span>{item.partnerName}</span>
                <span style={styles.badge}>{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
        <Link to="/admin/partners" style={styles.actionBtn}>
          Manage Partners
        </Link>
        <Link to="/admin/clients" style={styles.actionBtnOutline}>
          View All Clients
        </Link>
      </div>
    </Layout>
  );
}

const styles = {
  heading: { fontSize: '24px', marginBottom: '24px', color: '#1e293b' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  cardLabel: { color: '#64748b', fontSize: '13px', margin: '0 0 8px', fontWeight: '500' },
  cardValue: { fontSize: '28px', fontWeight: '700', margin: 0 },
  section: {
    background: 'white',
    padding: '24px',
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  },
  sectionTitle: { fontSize: '18px', marginBottom: '16px', color: '#1e293b' },
  table: { width: '100%' },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    padding: '12px 0',
    borderBottom: '2px solid #e2e8f0',
    fontWeight: '600',
    color: '#475569',
    fontSize: '13px'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '14px',
    color: '#334155'
  },
  badge: {
    background: '#dbeafe',
    color: '#1e40af',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600'
  },
  empty: { color: '#94a3b8', textAlign: 'center', padding: '20px' },
  actions: { display: 'flex', gap: '12px' },
  actionBtn: {
    background: '#3b82f6',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px'
  },
  actionBtnOutline: {
    background: 'white',
    color: '#3b82f6',
    padding: '12px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
    border: '1px solid #3b82f6'
  }
};

export default Dashboard;