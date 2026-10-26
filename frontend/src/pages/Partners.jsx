import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import API from '../api';

function Partners() {
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
      <div style={styles.header}>
        <h2 style={styles.heading}>Marketing Partners</h2>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? 'Cancel' : '+ Add Partner'}
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>New Partner</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <input
                placeholder="Full Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={styles.input}
                required
              />
              <input
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={styles.input}
                required
              />
              <input
                placeholder="Company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                style={styles.input}
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={styles.input}
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.submitBtn}>
              Create Partner & Generate Link
            </button>
          </form>
        </div>
      )}

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
              <div style={styles.partnerHeader}>
                <div>
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

              <div style={styles.linkBox}>
                <code style={styles.linkText}>
                  {window.location.origin}/referral/{partner.referralCode}
                </code>
                <button
                  onClick={() => copyLink(partner.referralCode)}
                  style={styles.copyBtn}
                >
                  {copied === partner.referralCode ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              <div style={styles.partnerFooter}>
                <span style={styles.clientCount}>
                  {partner.clientCount || 0} clients
                </span>
                <div style={styles.btnGroup}>
                  <Link
                    to={`/admin/partners/${partner._id}`}
                    style={styles.viewBtn}
                  >
                    View Clients
                  </Link>
                  <button
                    onClick={() => resetPassword(partner)}
                    style={styles.resetBtn}
                  >
                    🔑 Reset
                  </button>
                  <button
                    onClick={() => toggleStatus(partner)}
                    style={styles.toggleBtn}
                  >
                    {partner.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(partner)}
                    disabled={deletingId === partner._id}
                    style={{
                      ...styles.deleteBtn,
                      opacity: deletingId === partner._id ? 0.5 : 1,
                      cursor: deletingId === partner._id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {deletingId === partner._id ? 'Deleting...' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  heading: { fontSize: '24px', color: '#1e293b', margin: 0 },
  addBtn: {
    background: '#3b82f6', color: 'white', border: 'none',
    padding: '10px 20px', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  formCard: {
    background: 'white', padding: '24px', borderRadius: '10px',
    marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  formTitle: { margin: '0 0 16px', fontSize: '18px', color: '#1e293b' },
  formGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px', marginBottom: '12px'
  },
  input: {
    padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px',
    fontSize: '14px', boxSizing: 'border-box'
  },
  submitBtn: {
    background: '#10b981', color: 'white', border: 'none',
    padding: '12px 24px', borderRadius: '6px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  error: { color: '#ef4444', fontSize: '13px' },
  emptyCard: { background: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center' },
  empty: { color: '#94a3b8' },
  partnerList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  partnerCard: {
    background: 'white', padding: '20px', borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  partnerHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' },
  partnerName: { margin: '0 0 4px', fontSize: '18px', color: '#1e293b' },
  partnerMeta: { margin: '2px 0', fontSize: '13px', color: '#64748b' },
  statusBadge: {
    padding: '4px 12px', borderRadius: '12px',
    fontSize: '12px', fontWeight: '600', height: 'fit-content'
  },
  linkBox: {
    display: 'flex', gap: '8px', alignItems: 'center',
    background: '#f8fafc', padding: '10px',
    borderRadius: '6px', marginBottom: '16px'
  },
  linkText: { flex: 1, fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis' },
  copyBtn: {
    background: '#3b82f6', color: 'white', border: 'none',
    padding: '6px 14px', borderRadius: '6px',
    fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap'
  },
  partnerFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  clientCount: { fontSize: '14px', fontWeight: '600', color: '#1e40af' },
  btnGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  viewBtn: {
    background: 'white', color: '#3b82f6', border: '1px solid #3b82f6',
    padding: '6px 14px', borderRadius: '6px', fontSize: '12px',
    fontWeight: '600', textDecoration: 'none'
  },
  resetBtn: {
    background: 'white', color: '#f59e0b', border: '1px solid #f59e0b',
    padding: '6px 14px', borderRadius: '6px', fontSize: '12px',
    fontWeight: '600', cursor: 'pointer'
  },
  toggleBtn: {
    background: 'white', color: '#64748b', border: '1px solid #cbd5e1',
    padding: '6px 14px', borderRadius: '6px', fontSize: '12px',
    fontWeight: '600', cursor: 'pointer'
  },
  deleteBtn: {
    background: '#ef4444', color: 'white', border: 'none',
    padding: '6px 14px', borderRadius: '6px', fontSize: '12px',
    fontWeight: '600', cursor: 'pointer'
  }
};

export default Partners;