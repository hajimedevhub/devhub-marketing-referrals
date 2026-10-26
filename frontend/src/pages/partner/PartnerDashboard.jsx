import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PartnerLayout from '../../components/PartnerLayout';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { PartnerAPI } from '../../api';

const statusColors = {
  new: { bg: '#fef3c7', color: '#92400e', label: 'New' },
  contacted: { bg: '#dbeafe', color: '#1e40af', label: 'Contacted' },
  converted: { bg: '#d1fae5', color: '#065f46', label: 'Converted' },
  lost: { bg: '#fee2e2', color: '#991b1b', label: 'Lost' }
};

function PartnerDashboard() {
  const isMobile = useIsMobile();
  const [data, setData] = useState(null);
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [meRes, clientsRes] = await Promise.all([
        PartnerAPI.get('/partner-auth/me'),
        PartnerAPI.get('/partner-clients')
      ]);
      setData(meRes.data);
      setRecentClients(clientsRes.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!data?.partner?.referralCode) return;
    const link = `${window.location.origin}/referral/${data.partner.referralCode}`;
    navigator.clipboard.writeText(link);
    alert('Referral link copied!');
  };

  if (loading) {
    return <PartnerLayout><div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading...</div></PartnerLayout>;
  }

  const { partner, stats } = data || {};

  const statCards = [
    { label: 'Total Clients', value: stats?.total || 0, icon: '👥', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    { label: 'New Leads', value: stats?.new || 0, icon: '✨', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' },
    { label: 'Converted', value: stats?.converted || 0, icon: '🎯', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { label: 'Last 7 Days', value: stats?.recent || 0, icon: '📈', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' }
  ];

  return (
    <PartnerLayout>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: isMobile ? '22px' : '28px', /* ... */ }}>
          Welcome back, {partner?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          Here's how your referrals are performing
        </p>
      </div>

      {/* Referral link card */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', opacity: 0.85, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Your Referral Link
            </div>
            <code style={{
    fontSize: '13px',
    fontFamily: 'monospace',
    background: 'rgba(255,255,255,0.15)',
    padding: '10px 14px',
    borderRadius: '8px',
    wordBreak: 'break-all',
    width: isMobile ? '100%' : 'auto',
    boxSizing: 'border-box'
  }}>
              {window.location.origin}/referral/{partner?.referralCode}
            </code>
          </div>
          <button
            onClick={copyReferralLink}
            style={{ padding: '12px 24px', width: isMobile ? '100%' : 'auto', /* ...rest */ }}
          >
            📋 Copy Link
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
  display: 'grid',
  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
  gap: isMobile ? '12px' : '20px',
  marginBottom: '32px'
}}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: 'white',
            padding: '24px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: card.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              {card.icon}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '10px' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a' }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent clients */}
      <div style={{
        background: 'white',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Recent Clients
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
              Your latest referrals
            </p>
          </div>
          <button
            onClick={() => navigate('/partner/clients')}
            style={{
              padding: '8px 16px',
              background: '#eef2ff',
              color: '#6366f1',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            View all →
          </button>
        </div>

        {recentClients.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              No clients yet. Share your referral link to get started!
            </p>
          </div>
        ) : (
          <div>
            {recentClients.map((client) => (
              <div
                key={client._id}
                onClick={() => navigate(`/partner/clients/${client._id}`)}
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f46e5',
                  fontWeight: '700',
                  fontSize: '15px',
                  flexShrink: 0
                }}>
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                    {client.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    {client.email} · {client.phone}
                  </div>
                </div>
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
                <span style={{ fontSize: '13px', color: '#94a3b8', minWidth: '80px', textAlign: 'right' }}>
                  {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}

export default PartnerDashboard;