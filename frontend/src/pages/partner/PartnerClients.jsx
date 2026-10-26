import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PartnerLayout from '../../components/PartnerLayout';
import { PartnerAPI } from '../../api';

const statusColors = {
  new: { bg: '#fef3c7', color: '#92400e', label: 'New' },
  contacted: { bg: '#dbeafe', color: '#1e40af', label: 'Contacted' },
  converted: { bg: '#d1fae5', color: '#065f46', label: 'Converted' },
  lost: { bg: '#fee2e2', color: '#991b1b', label: 'Lost' }
};

function PartnerClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, [statusFilter, search]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await PartnerAPI.get(`/partner-clients?${params.toString()}`);
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statuses = [
    { key: 'all', label: 'All', count: clients.length },
    { key: 'new', label: 'New' },
    { key: 'contacted', label: 'Contacted' },
    { key: 'converted', label: 'Converted' },
    { key: 'lost', label: 'Lost' }
  ];

  return (
    <PartnerLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>
          My Clients
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          Manage all clients referred through your link
        </p>
      </div>

      {/* Filters row */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '4px',
          display: 'flex',
          gap: '2px'
        }}>
          {statuses.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                background: statusFilter === s.key ? '#6366f1' : 'transparent',
                color: statusFilter === s.key ? 'white' : '#64748b',
                transition: 'all 0.15s'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="🔍 Search by name, email, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '240px',
            padding: '11px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '14px',
            outline: 'none',
            background: 'white'
          }}
        />
      </div>

      {/* Table */}
      <div style={{
        background: 'white',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              No clients found
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Client', 'Contact', 'Status', 'Date', ''].map((h) => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '14px 20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#64748b',
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
                <tr
                  key={client._id}
                  onClick={() => navigate(`/partner/clients/${client._id}`)}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#4f46e5',
                        fontWeight: '700',
                        fontSize: '14px'
                      }}>
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                          {client.name}
                        </div>
                        {client.company && (
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {client.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '13px', color: '#334155' }}>{client.email}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{client.phone}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: statusColors[client.status]?.bg,
                      color: statusColors[client.status]?.color
                    }}>
                      {statusColors[client.status]?.label}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b' }}>
                    {new Date(client.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <span style={{ color: '#cbd5e1', fontSize: '18px' }}>›</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PartnerLayout>
  );
}

export default PartnerClients;