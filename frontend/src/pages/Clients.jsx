import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import API from '../api';
import { useIsMobile } from '../hooks/useMediaQuery';

const statusColors = {
  new: { bg: 'var(--warning-light)', color: '#92400e', label: 'New' },
  contacted: { bg: 'var(--info-light)', color: '#1e40af', label: 'Contacted' },
  converted: { bg: 'var(--success-light)', color: '#065f46', label: 'Converted' },
  lost: { bg: 'var(--danger-light)', color: '#991b1b', label: 'Lost' }
};

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
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
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: isMobile ? '22px' : '28px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          margin: 0
        }}>
          {partnerId ? 'Partner Clients' : 'All Clients'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          {clients.length} {clients.length === 1 ? 'client' : 'clients'} total
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading...
        </div>
      ) : clients.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>No clients yet</p>
        </div>
      ) : isMobile ? (
        /* MOBILE — CARD VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {clients.map((client) => (
            <div key={client._id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-light), #c7d2fe)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    fontWeight: '700',
                    fontSize: '15px',
                    flexShrink: 0
                  }}>
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '15px' }}>
                      {client.name}
                    </div>
                    {client.company && (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {client.company}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px',
                background: 'var(--bg)',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>📧 Email</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right', wordBreak: 'break-all', marginLeft: '8px' }}>
                    {client.email}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>📱 Phone</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{client.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>🤝 Partner</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{client.partnerName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>📅 Date</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                    {new Date(client.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <select
                value={client.status}
                onChange={(e) => updateStatus(client._id, e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '8px',
                  background: statusColors[client.status]?.bg,
                  color: statusColors[client.status]?.color,
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          ))}
        </div>
      ) : (
        /* DESKTOP — TABLE VIEW */
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['Client', 'Contact', 'Partner', 'Date', 'Status'].map((h) => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '14px 20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{client.name}</div>
                    {client.company && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{client.company}</div>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>{client.email}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{client.phone}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      background: '#ede9fe',
                      color: '#6b21a8',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {client.partnerName}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <select
                      value={client.status}
                      onChange={(e) => updateStatus(client._id, e.target.value)}
                      style={{
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: statusColors[client.status]?.bg,
                        color: statusColors[client.status]?.color,
                        outline: 'none'
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

export default Clients;