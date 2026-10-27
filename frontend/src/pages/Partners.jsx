import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useIsMobile } from '../hooks/useMediaQuery';
import API from '../api';

function Partners() {
  const isMobile = useIsMobile();
  const [partners, setPartners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  const [newCredentials, setNewCredentials] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await API.get('/partners');
      setPartners(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/partners', form);
      setNewCredentials(res.data.credentials);
      setForm({ name: '', email: '', company: '', phone: '' });
      setShowForm(false);
      fetchPartners();
    } catch (err) {
      console.error('Create partner error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create partner');
    }
  };

  const copyLink = (code) => {
    const link = `${window.location.origin}/referral/${code}`;
    navigator.clipboard.writeText(link);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleStatus = async (partner) => {
    try {
      await API.put(`/partners/${partner._id}`, {
        ...partner,
        status: partner.status === 'active' ? 'inactive' : 'active'
      });
      fetchPartners();
    } catch (err) {
      console.error(err);
    }
  };

  const resetPassword = async (partner) => {
    if (!window.confirm(`Reset password for ${partner.name}? The old password will stop working immediately.`)) return;
    try {
      const res = await API.put(`/partners/${partner._id}`, { resetPassword: true });
      setNewCredentials(res.data.credentials);
      fetchPartners();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleDelete = async (partner) => {
    const clientCount = partner.clientCount || 0;
    const warning = clientCount > 0
      ? `\n\n👥 This partner has ${clientCount} client(s). They will be preserved in the database but marked as "orphaned" (no longer linked to any partner).`
      : '';

    const confirmed = window.confirm(
      `⚠️ DELETE "${partner.name}" permanently?\n\n` +
      `📧 ${partner.email}${warning}\n\n` +
      `This action CANNOT be undone.`
    );
    if (!confirmed) return;

    setDeletingId(partner._id);
    try {
      const res = await API.delete(`/partners/${partner._id}`);
      const { orphanedClients } = res.data;

      if (orphanedClients > 0) {
        alert(
          `✅ Partner deleted.\n\n` +
          `${orphanedClients} client(s) preserved but now unlinked.`
        );
      } else {
        alert(`✅ Partner "${partner.name}" deleted successfully.`);
      }
      fetchPartners();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete partner');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      {/* ============ PAGE HEADER (OUTSIDE LOOP — ONE ONLY) ============ */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div>
          <h2 style={{
            fontSize: isMobile ? '22px' : '28px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Marketing Partners
          </h2>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {partners.length} {partners.length === 1 ? 'partner' : 'partners'} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? '✕ Cancel' : '+ Add Partner'}
        </button>
      </div>

      {/* ============ ADD PARTNER FORM ============ */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>New Partner</h3>
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <input
                placeholder="Full Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                required
              />
              <input
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                required
              />
              <input
                placeholder="Company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="input"
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" className="btn btn-success btn-block">
              Create Partner & Generate Link
            </button>
          </form>
        </div>
      )}

      {/* ============ PARTNER LIST ============ */}
      {loading ? (
        <p>Loading...</p>
      ) : partners.length === 0 ? (
        <div style={styles.emptyCard}>
          <p style={styles.empty}>No partners yet. Add your first marketing partner!</p>
        </div>
      ) : (
        <div style={styles.partnerList}>
          {partners.map((partner) => (
            <div key={partner._id} style={styles.partnerCard}>

              {/* === PARTNER CARD HEADER — shows THIS partner's name === */}
              <div style={styles.partnerHeader}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={styles.partnerName}>{partner.name}</h3>
                  <p style={styles.partnerMeta}>{partner.email}</p>
                  {partner.company && (
                    <p style={styles.partnerMeta}>{partner.company}</p>
                  )}
                </div>
                <span
                  style={{
                    ...styles.statusBadge,
                    background: partner.status === 'active' ? '#d1fae5' : '#fee2e2',
                    color: partner.status === 'active' ? '#065f46' : '#991b1b'
                  }}
                >
                  {partner.status}
                </span>
              </div>

              {/* === REFERRAL LINK === */}
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'stretch',
                background: 'var(--bg)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <code style={{
                  flex: 1,
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  padding: '8px',
                  background: 'white',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  border: '1px solid var(--border)'
                }}>
                  {window.location.origin}/referral/{partner.referralCode}
                </code>
                <button
                  onClick={() => copyLink(partner.referralCode)}
                  className="btn btn-primary btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {copied === partner.referralCode ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {/* === CARD FOOTER — client count + action buttons === */}
              <div style={{
                ...styles.partnerFooter,
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: isMobile ? 'center' : 'flex-start'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px'
                  }}>👥</div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>
                    {partner.clientCount || 0} {partner.clientCount === 1 ? 'client' : 'clients'}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr 1fr' : 'auto auto auto auto',
                  gap: '8px'
                }}>
                  <Link to={`/admin/partners/${partner._id}`} className="btn btn-secondary btn-sm">
                    View
                  </Link>
                  <button onClick={() => resetPassword(partner)} className="btn btn-secondary btn-sm">
                    🔑 Reset
                  </button>
                  <button onClick={() => toggleStatus(partner)} className="btn btn-secondary btn-sm">
                    {partner.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDelete(partner)}
                    disabled={deletingId === partner._id}
                    className="btn btn-danger btn-sm"
                  >
                    {deletingId === partner._id ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============ CREDENTIALS MODAL ============ */}
      {newCredentials && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', padding: '32px', borderRadius: '16px',
            maxWidth: '440px', width: '100%', margin: '20px'
          }}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>✅ Credentials Ready</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Share these with your partner. <strong>The password won't be shown again.</strong>
            </p>
            <div style={{
              background: '#f8fafc', padding: '16px', borderRadius: '10px',
              marginBottom: '16px', fontFamily: 'monospace', fontSize: '14px'
            }}>
              <div><strong>Email:</strong> {newCredentials.email}</div>
              <div style={{ marginTop: '6px' }}><strong>Password:</strong> {newCredentials.password}</div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `Email: ${newCredentials.email}\nPassword: ${newCredentials.password}`
                );
                alert('Credentials copied to clipboard!');
              }}
              style={{
                width: '100%', padding: '12px', background: '#6366f1',
                color: 'white', border: 'none', borderRadius: '10px',
                fontWeight: '600', cursor: 'pointer', marginBottom: '8px'
              }}
            >
              📋 Copy Credentials
            </button>
            <button
              onClick={() => setNewCredentials(null)}
              style={{
                width: '100%', padding: '12px', background: '#f1f5f9',
                color: '#334155', border: 'none', borderRadius: '10px',
                fontWeight: '600', cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

const styles = {
  formCard: {
    background: 'white', padding: '24px', borderRadius: '10px',
    marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  formTitle: { margin: '0 0 16px', fontSize: '18px', color: 'var(--text-primary)' },
  error: { color: 'var(--danger)', fontSize: '13px' },
  emptyCard: { background: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center' },
  empty: { color: 'var(--text-muted)' },
  partnerList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  partnerCard: {
    background: 'white', padding: '20px', borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)'
  },
  partnerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    gap: '12px'
  },
  partnerName: {
    margin: '0 0 4px',
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  partnerMeta: { margin: '2px 0', fontSize: '13px', color: 'var(--text-muted)' },
  statusBadge: {
    padding: '4px 12px', borderRadius: '12px',
    fontSize: '12px', fontWeight: '600', height: 'fit-content',
    textTransform: 'capitalize'
  },
  partnerFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  }
};

export default Partners;