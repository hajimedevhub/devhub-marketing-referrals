import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function Setup() {
  const [secretCode, setSecretCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (secretCode.length < 6) {
      setError('Secret code must be at least 6 characters');
      return;
    }

    if (secretCode !== confirmCode) {
      setError('Secret codes do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/setup', { secretCode });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Setup</h2>
        <p style={styles.subtitle}>Create your secret access code</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter secret code (min 6 chars)"
            value={secretCode}
            onChange={(e) => setSecretCode(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Confirm secret code"
            value={confirmCode}
            onChange={(e) => setConfirmCode(e.target.value)}
            style={styles.input}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating...' : 'Create Admin'}
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '400px'
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
    boxSizing: 'border-box'
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
  error: { color: '#ef4444', fontSize: '13px', marginBottom: '12px' }
};

export default Setup;