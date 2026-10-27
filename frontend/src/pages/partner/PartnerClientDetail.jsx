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
    return (
      <PartnerLayout>
        <div style={{ padding: '60px 16px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
      </PartnerLayout>
    );
  }

  if (!client) return null;

  const sectionPadding = isMobile ? '20px' : '32px';

  const sectionHeading = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  return (
    <PartnerLayout>
      <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <button
          onClick={() => navigate('/partner/clients')}
          style={{
            background: 'none',
            border: 'none',
            color: '#6366f1',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            padding: isMobile ? '10px 0' : '0 0 20px 0',
            marginBottom: isMobile ? '6px' : 0,
            minHeight: isMobile ? '44px' : 'auto'
          }}
        >
          ← Back to clients
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: isMobile ? '16px' : '24px',
            alignItems: 'start'
          }}
        >
          {/* Main card */}
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              minWidth: 0
            }}
          >
            {/* Header banner */}
            <div
              style={{
                // Fixed: the original declared padding twice, so the mobile value was overridden
                padding: isMobile ? '24px 20px' : '32px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: 'white'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '14px' : '20px'
                }}
              >
                <div
                  style={{
                    width: isMobile ? '56px' : '72px',
                    height: isMobile ? '56px' : '72px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '22px' : '28px',
                    fontWeight: '700',
                    flexShrink: 0
                  }}
                >
                  {client.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h1
                    style={{
                      fontSize: isMobile ? '20px' : '26px',
                      fontWeight: '700',
                      margin: '0 0 4px',
                      lineHeight: 1.25,
                      overflowWrap: 'anywhere'
                    }}
                  >
                    {client.name}
                  </h1>
                  {client.company && (
                    <p style={{ fontSize: '14px', opacity: 0.9, margin: 0, overflowWrap: 'anywhere' }}>
                      {client.company}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div style={{ padding: sectionPadding }}>
              <h3 style={{ ...sectionHeading, marginTop: 0, marginBottom: '16px' }}>
                Contact Information
              </h3>

              <div style={{ display: 'grid', gap: '16px' }}>
                <InfoRow icon="📧" label="Email" value={client.email} link={`mailto:${client.email}`} />
                <InfoRow icon="📱" label="Phone" value={client.phone} link={`tel:${client.phone}`} />
                {client.company && <InfoRow icon="🏢" label="Company" value={client.company} />}
                <InfoRow
                  icon="📅"
                  label="Referred On"
                  value={new Date(client.createdAt).toLocaleDateString('en-US', {
                    weekday: isMobile ? 'short' : 'long',
                    year: 'numeric',
                    month: isMobile ? 'short' : 'long',
                    day: 'numeric'
                  })}
                />
              </div>

              {client.message && (
                <>
                  <h3 style={{ ...sectionHeading, marginTop: isMobile ? '24px' : '32px', marginBottom: '16px' }}>
                    Message
                  </h3>
                  <div
                    style={{
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      fontSize: '14px',
                      color: '#334155',
                      lineHeight: '1.6',
                      borderLeft: '3px solid #6366f1',
                      overflowWrap: 'anywhere',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {client.message}
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '12px',
                  marginTop: isMobile ? '24px' : '32px'
                }}
              >
                <a
                  href={`mailto:${client.email}`}
                  style={{
                    flex: 1,
                    padding: '14px 12px',
                    minHeight: '44px',
                    boxSizing: 'border-box',
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
                    padding: '14px 12px',
                    minHeight: '44px',
                    boxSizing: 'border-box',
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
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: isMobile ? '20px' : '24px',
              // Sticky only makes sense beside the main card; on mobile it just stacks below
              position: isMobile ? 'static' : 'sticky',
              top: isMobile ? 'auto' : '100px',
              minWidth: 0,
              boxSizing: 'border-box'
            }}
          >
            <h3 style={{ ...sectionHeading, marginTop: 0, marginBottom: '16px' }}>Status</h3>

            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: statusColors[client.status]?.bg,
                color: statusColors[client.status]?.color,
                fontWeight: '600',
                fontSize: '14px',
                textAlign: 'center',
                marginBottom: '20px'
              }}
            >
              {statusColors[client.status]?.label}
            </div>

            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
              Update the status to keep track of this client
            </p>

            {/* 2x2 grid on mobile, single column on desktop */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                gap: '8px'
              }}
            >
              {Object.entries(statusColors).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => updateStatus(key)}
                  disabled={updating || client.status === key}
                  style={{
                    padding: '10px 14px',
                    minHeight: '44px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: client.status === key ? val.bg : 'white',
                    color: client.status === key ? val.color : '#334155',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: client.status === key ? 'default' : 'pointer',
                    opacity: updating && client.status !== key ? 0.6 : 1,
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {val.label}
                  {client.status === key && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
}

function InfoRow({ icon, label, value, link }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', minWidth: 0 }}>
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      {/* minWidth 0 + overflowWrap lets long emails/phone numbers wrap instead of overflowing */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '2px', fontWeight: '600' }}>
          {label}
        </div>
        {link ? (
          <a
            href={link}
            style={{
              fontSize: '15px',
              color: '#6366f1',
              textDecoration: 'none',
              fontWeight: '500',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word'
            }}
          >
            {value}
          </a>
        ) : (
          <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500', overflowWrap: 'anywhere' }}>
            {value}
          </div>
        )}
      </div>
    </div>
  );
}

export default PartnerClientDetail;