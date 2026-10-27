import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PartnerLayout from '../../components/PartnerLayout';
import { PartnerAPI } from '../../api';
import { useIsMobile } from '../../hooks/useMediaQuery';

const statusColors = {
  new: { bg: '#fef3c7', color: '#92400e', label: 'New' },
  contacted: { bg: '#dbeafe', color: '#1e40af', label: 'Contacted' },
  converted: { bg: '#d1fae5', color: '#065f46', label: 'Converted' },
  lost: { bg: '#fee2e2', color: '#991b1b', label: 'Lost' }
};

function PartnerClients() {
  const isMobile = useIsMobile();
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

  const StatusBadge = ({ status }) => (
    <span
      style={{
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        background: statusColors[status]?.bg,
        color: statusColors[status]?.color
      }}
    >
      {statusColors[status]?.label}
    </span>
  );

  const Avatar = ({ name, size }) => (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#4f46e5',
        fontWeight: '700',
        fontSize: '14px',
        flexShrink: 0
      }}
    >
      {name?.charAt(0).toUpperCase()}
    </div>
  );

  const ellipsis = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  return (
    <PartnerLayout>
      <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
          <h1
            style={{
              fontSize: isMobile ? '22px' : '28px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 6px'
            }}
          >
            My Clients
          </h1>
          <p style={{ fontSize: isMobile ? '14px' : '15px', color: '#64748b', margin: 0 }}>
            Manage all clients referred through your link
          </p>
        </div>

        {/* Filters row */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '12px',
            marginBottom: '20px',
            alignItems: isMobile ? 'stretch' : 'center',
            flexWrap: 'wrap'
          }}
        >
          {/* Status pills: scroll sideways on small screens instead of wrapping or overflowing */}
          <div
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '4px',
              display: 'flex',
              gap: '2px',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            {statuses.map((s) => (
              <button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                style={{
                  padding: isMobile ? '10px 14px' : '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
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
              // The old fixed 240px minimum could overflow narrow phones
              minWidth: isMobile ? 0 : '240px',
              width: isMobile ? '100%' : 'auto',
              boxSizing: 'border-box',
              padding: '11px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              // 16px stops iOS Safari from zooming the page when the input is focused
              fontSize: isMobile ? '16px' : '14px',
              outline: 'none',
              background: 'white'
            }}
          />
        </div>

        {/* Results */}
        <div
          style={{
            background: 'white',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}
        >
          {loading ? (
            <div style={{ padding: '60px 16px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
          ) : clients.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No clients found</p>
            </div>
          ) : isMobile ? (
            /* Mobile: card-style rows instead of a 5-column table */
            <div>
              {clients.map((client) => (
                <div
                  key={client._id}
                  onClick={() => navigate(`/partner/clients/${client._id}`)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <Avatar name={client.name} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', ...ellipsis }}>
                      {client.name}
                    </div>
                    {client.company && (
                      <div style={{ fontSize: '12px', color: '#94a3b8', ...ellipsis }}>{client.company}</div>
                    )}
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '2px', ...ellipsis }}>
                      {client.email}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', ...ellipsis }}>{client.phone}</div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '6px',
                      flexShrink: 0
                    }}
                  >
                    <StatusBadge status={client.status} />
                    <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {new Date(client.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Desktop/tablet: table, scrolls inside its own container on narrower screens */
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    {['Client', 'Contact', 'Status', 'Date', ''].map((h, i) => (
                      <th
                        key={`${h}-${i}`}
                        style={{
                          textAlign: 'left',
                          padding: '14px 20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          whiteSpace: 'nowrap'
                        }}
                      >
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
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Avatar name={client.name} size={38} />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                              {client.name}
                            </div>
                            {client.company && (
                              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{client.company}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '13px', color: '#334155' }}>{client.email}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{client.phone}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <StatusBadge status={client.status} />
                      </td>
                      <td
                        style={{
                          padding: '16px 20px',
                          fontSize: '13px',
                          color: '#64748b',
                          whiteSpace: 'nowrap'
                        }}
                      >
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
            </div>
          )}
        </div>
      </div>
    </PartnerLayout>
  );
}

export default PartnerClients;