import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useIsMobile } from '../hooks/useMediaQuery';
import API from '../api';

function ReferralForm() {
  const isMobile = useIsMobile();
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

  /* ────────────────────────────────────────────── */
  /*  LOADING                                        */
  /* ────────────────────────────────────────────── */
  if (status === 'loading') {
    return (
      <div style={pageStyle}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ margin: 0, fontSize: '15px', opacity: 0.9 }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────── */
  /*  ERROR                                          */
  /* ────────────────────────────────────────────── */
  if (status === 'error') {
    return (
      <div style={pageStyle}>
        <div style={{
          ...cardStyle,
          padding: isMobile ? '32px 24px' : '48px 40px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: '#fee2e2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            margin: '0 auto 20px'
          }}>
            ⚠️
          </div>
          <h2 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: '0 0 8px'
          }}>
            Invalid Link
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            margin: 0,
            lineHeight: '1.6'
          }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────── */
  /*  SUCCESS                                        */
  /* ────────────────────────────────────────────── */
  if (status === 'success') {
    return (
      <div style={pageStyle}>
        <div style={{
          ...cardStyle,
          padding: isMobile ? '40px 24px' : '56px 40px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: 'var(--success-light)',
            color: 'var(--success)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            fontWeight: '700',
            margin: '0 auto 20px',
            animation: 'pop 0.5s ease-out'
          }}>
            ✓
          </div>
          <h2 style={{
            fontSize: isMobile ? '22px' : '26px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: '0 0 12px'
          }}>
            Thank You!
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '15px',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Your information has been submitted successfully.
            Our team will contact you soon.
          </p>
          <style>{`
            @keyframes pop {
              0% { transform: scale(0); opacity: 0; }
              60% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(1); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────── */
  /*  FORM                                           */
  /* ────────────────────────────────────────────── */
  return (
    <div style={pageStyle}>
      <div style={{
        ...cardStyle,
        padding: isMobile ? '28px 20px' : '40px',
        maxWidth: '480px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 auto 16px',
            boxShadow: 'var(--shadow-primary)'
          }}>
            D
          </div>
          <h2 style={{
            fontSize: isMobile ? '22px' : '26px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: '0 0 8px'
          }}>
            Get in Touch
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Referred by{' '}
            <strong style={{ color: 'var(--primary)' }}>
              {partner?.company || partner?.name}
            </strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Full Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
            style={{ marginBottom: '12px' }}
            required
          />
          <input
            type="email"
            placeholder="Email *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
            style={{ marginBottom: '12px' }}
            required
          />
          <input
            type="tel"
            placeholder="Phone *"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="input"
            style={{ marginBottom: '12px' }}
            required
          />
          <input
            placeholder="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="input"
            style={{ marginBottom: '12px' }}
          />
          <textarea
            placeholder="Message (optional)"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="input"
            style={{ marginBottom: '16px', minHeight: '96px', resize: 'vertical' }}
          />
          {error && (
            <p style={{
              color: 'var(--danger)',
              fontSize: '13px',
              marginBottom: '12px',
              margin: '0 0 12px'
            }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-block"
            style={{ padding: '13px', fontSize: '15px' }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginTop: '20px',
          marginBottom: 0
        }}>
          🔒 Your information is safe and secure
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────── */
/*  STYLES                                         */
/* ────────────────────────────────────────────── */

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
  padding: '20px',
  position: 'relative',
  overflow: 'hidden'
};

const cardStyle = {
  background: 'white',
  borderRadius: 'var(--radius-lg)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  width: '100%',
  position: 'relative',
  zIndex: 1
};

export default ReferralForm;