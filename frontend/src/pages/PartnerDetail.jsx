import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import API from '../api';

function PartnerDetail() {
  const { id } = useParams();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, [id]);

  const fetchClients = async () => {
    try {
      const res = await API.get(`/clients/partner/${id}`);
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={styles.header}>
        <h2 style={styles.heading}>Partner Clients</h2>
        <Link to="/admin/partners" style={styles.backBtn}>← Back to Partners</Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : clients.length === 0 ? (
        <div style={styles.emptyCard}>
          <p style={styles.empty}>No clients from this partner yet</p>
        </div>
      ) : (
        <div style={styles.clientList}>
          {clients.map((client) => (
            <div key={client._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.name}>{client.name}</h3>
                  {client.company && <p style={styles.company}>{client.company}</p>}
                </div>
                <span style={styles.date}>
                  {new Date(client.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Email:</span> {client.email}
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Phone:</span> {client.phone}
              </div>
              {client.message && (
                <div style={styles.messageBox}>
                  <span style={styles.label}>Message:</span>
                  <p style={styles.message}>{client.message}</p>
                </div>
              )}
              <div style={styles.footer}>
                <span style={styles.status}>{client.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  heading: { fontSize: '24px', color: '#1e293b', margin: 0 },
  backBtn: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600'
  },
  emptyCard: { background: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center' },
  empty: { color: '#94a3b8' },
  clientList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  name: { margin: '0 0 4px', fontSize: '18px', color: '#1e293b' },
  company: { margin: 0, fontSize: '13px', color: '#64748b' },
  date: { fontSize: '13px', color: '#94a3b8' },
  infoRow: { fontSize: '14px', color: '#334155', marginBottom: '6px' },
  label: { fontWeight: '600', color: '#475569' },
  messageBox: { marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '6px' },
  message: { margin: '6px 0 0', fontSize: '14px', color: '#475569' },
  footer: { marginTop: '12px' },
  status: {
    background: '#fef3c7',
    color: '#92400e',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize'
  }
};

export default PartnerDetail;