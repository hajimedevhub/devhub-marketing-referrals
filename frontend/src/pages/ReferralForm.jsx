import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';

function ReferralForm() {
  const { code } = useParams();
  const [partner, setPartner] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [status, setStatus] = useState('loading'); // loading, ready, error, success
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPartner();
  }, [code]);

  const fetchPartner = async () => {
    try {
      const res = await API.get(`/partners/referral/${code}`);
      setPartner(res.data);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Invalid referral link');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await API.post(`/clients/submit/${code}`, form);
      setStatus('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div style={styles.container}>
        <p style={{ color: 'white' }}>Loading...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Invalid Link</h2>
          <p style={styles.subtitle}>{error}</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.title}>Thank You!</h2>
          <p style={styles.subtitle}>
            Your information has been submitted successfully. 
            Our team will contact you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Get in Touch</h2>
        <p style={styles.subtitle}>
          Referred by <strong>{partner?.company || partner?.name}</strong>
        </p>

        <form onSubmit={handleSubmit}>
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
            placeholder="Phone *"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={styles.input}
            required
          />
          <input
            placeholder="Company (optional)"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            style={styles.input}
          />
          <textarea
            placeholder="Message (optional)"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={submitting} style={styles.button}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '480px'
  },
  title: { fontSize: '24px', marginBottom: '8px', textAlign: 'center', color: '#1e293b' },
  subtitle: { color: '#64748b', textAlign: 'center', marginBottom: '24px', fontSize: '14px' },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    marginBottom: '12px',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  error: { color: '#ef4444', fontSize: '13px', marginBottom: '12px' },
  successIcon: {
    width: '64px',
    height: '64px',
    background: '#d1fae5',
    color: '#10b981',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 auto 20px'
  }
};

export default ReferralForm;