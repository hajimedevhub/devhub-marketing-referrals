import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PartnerLayout from '../../components/PartnerLayout';
import { PartnerAPI } from '../../api';
import { useIsMobile } from '../../hooks/useMediaQuery';

const statusColors = {
  new: { bg: '#fef3c7', color: '#92400e', label: 'New' },
  contacted: { bg: '#dbeafe', color: '#1e40af', label: 'Contacted' },
  converted: { bg: '#d1fae5', color: '#065f46', label: 'Converted' },
  lost: { bg: '#fee2e2', color: '#991b1b', label: 'Lost' }
};

function PartnerClientDetail() {
  const isMobile = useIsMobile();
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const res = await PartnerAPI.get(`/partner-clients/${id}`);
      setClient(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        navigate('/partner/clients');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await PartnerAPI.put(`/partner-clients/${id}/status`, { status: newStatus });
      setClient({ ...client, status: newStatus });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <PartnerLayout><div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading...</div></PartnerLayout>;
  }

  if (!client) return null;

  return (
    <PartnerLayout>
      <button
        onClick={() => navigate('/partner/clients')}
        style={{
          background: 'none',
          border: 'none',
          color: '#6366f1',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          padding: '0 0 20px 0'
        }}
      >
        ← Back to clients
      </button>

      <div style={{
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
  gap: '24px',
  alignItems: 'start'
}}>
        {/* Main card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          {/* Header banner */}
          <div style={{
            padding: isMobile ? '24px 20px' : '32px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            padding: '32px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: '700'
              }}>
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 4px' }}>
                  {client.name}
                </h1>
                {client.company && (
                  <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
                    {client.company}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              Contact Information
            </h3>

            <div style={{ display: 'grid', gap: '16px' }}>
              <InfoRow icon="📧" label="Email" value={client.email} link={`mailto:${client.email}`} />
              <InfoRow icon="📱" label="Phone" value={client.phone} link={`tel:${client.phone}`} />
              {client.company && (
                <InfoRow icon="🏢" label="Company" value={client.company} />
              )}
              <InfoRow
                icon="📅"
                label="Referred On"
                value={new Date(client.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              />
            </div>

            {client.message && (
              <>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '32px', marginBottom: '16px' }}>
                  Message
                </h3>
                <div style={{
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#334155',
                  lineHeight: '1.6',
                  borderLeft: '3px solid #6366f1'
                }}>
                  {client.message}
                </div>
              </>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', marginTop: '32px' }}>
              <a
                href={`mailto:${client.email}`}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'center',
                  textDecoration: 'none'
                }}
              >
                📧 Send Email
              </a>
              <a
                href={`tel:${client.phone}`}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'white',
                  color: '#6366f1',
                  border: '1px solid #6366f1',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'center',
                  textDecoration: 'none'
                }}
              >
                📞 Call
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar — status */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          position: 'sticky',
          top: '100px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 0, marginBottom: '16px' }}>
            Status
          </h3>

          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: statusColors[client.status]?.bg,
            color: statusColors[client.status]?.color,
            fontWeight: '600',
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            {statusColors[client.status]?.label}
          </div>

          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
            Update the status to keep track of this client
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(statusColors).map(([key, val]) => (
              <button
                key={key}
                onClick={() => updateStatus(key)}
                disabled={updating || client.status === key}
                style={{
                  padding: '10px 14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: client.status === key ? val.bg : 'white',
                  color: client.status === key ? val.color : '#334155',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: client.status === key ? 'default' : 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                {val.label}
                {client.status === key && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
}

function InfoRow({ icon, label, value, link }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '2px', fontWeight: '600' }}>
          {label}
        </div>
        {link ? (
          <a href={link} style={{ fontSize: '15px', color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>
            {value}
          </a>
        ) : (
          <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>
            {value}
          </div>
        )}
      </div>
    </div>
  );
}

export default PartnerClientDetail;