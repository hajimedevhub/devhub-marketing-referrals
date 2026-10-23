import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

function Recover() {
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newSecretCode, setNewSecretCode] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newSecretCode.length < 6) {
      return setError('New secret code must be at least 6 characters');
    }
    if (newSecretCode !== confirm) {
      return setError('Codes do not match');
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/recover', { recoveryKey, newSecretCode });
      localStorage.setItem('adminToken', res.data.token);
      alert('Secret code reset successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Recovery failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '420px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Recover Admin Access</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
          Use your recovery key to reset the secret code
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Recovery key"
            value={recoveryKey}
            onChange={(e) => setRecoveryKey(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '12px', boxSizing: 'border-box' }}
            required
          />
          <input
            type="password"
            placeholder="New secret code"
            value={newSecretCode}
            onChange={(e) => setNewSecretCode(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '12px', boxSizing: 'border-box' }}
            required
          />
          <input
            type="password"
            placeholder="Confirm new secret code"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '12px', boxSizing: 'border-box' }}
            required
          />
          {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
            {loading ? 'Resetting...' : 'Reset Secret Code'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
          <Link to="/login" style={{ color: '#3b82f6' }}>← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Recover;