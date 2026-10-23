import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import API from '../api';

const statusColors = {
  new: { bg: '#fef3c7', color: '#92400e' },
  contacted: { bg: '#dbeafe', color: '#1e40af' },
  converted: { bg: '#d1fae5', color: '#065f46' },
  lost: { bg: '#fee2e2', color: '#991b1b' }
};

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get('partner');

  useEffect(() => {
    fetchClients();
  }, [partnerId]);

  const fetchClients = async () => {
    try {
      const url = partnerId ? `/clients?partnerId=${partnerId}` : '/clients';
      const res = await API.get(url);
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (clientId, status) => {
    try {
      await API.put(`/clients/${clientId}/status`, { status });
      setClients(clients.map(c => c._id === clientId ? { ...c, status } : c));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <h2 style={styles.heading}>
        {partnerId ? 'Partner Clients' : 'All Clients'}
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : clients.length === 0 ? (
        <div style={styles.emptyCard}>
          <p style={styles.empty}>No clients yet</p>
        </div>
      ) : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Client</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Partner</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.clientName}>{client.name}</div>
                    {client.company && (
                      <div style={styles.clientCompany}>{client.company}</div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.contactLine}>{client.email}</div>
                    <div style={styles.contactLine}>{client.phone}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.partnerTag}>{client.partnerName}</span>
                  </td>
                  <td style={styles.td}>
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <select
                      value={client.status}
                      onChange={(e) => updateStatus(client._id, e.target.value)}
                      style={{
                        ...styles.statusSelect,
                        background: statusColors[client.status]?.bg,
                        color: statusColors[client.status]?.color
                      }}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

const styles = {
  heading: { fontSize: '24px', color: '#1e293b', marginBottom: '24px' },
  emptyCard: { background: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center' },
  empty: { color: '#94a3b8' },
  tableCard: {
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'auto'
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  th: {
    textAlign: 'left',
    padding: '14px 16px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#334155' },
  clientName: { fontWeight: '600', color: '#1e293b' },
  clientCompany: { fontSize: '12px', color: '#94a3b8' },
  contactLine: { fontSize: '13px', color: '#475569' },
  partnerTag: {
    background: '#ede9fe',
    color: '#6b21a8',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  statusSelect: {
    border: 'none',
    padding: '6px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default Clients;