import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function Login() {
  const [secretCode, setSecretCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const res = await API.get('/auth/check');
      if (!res.data.exists) {
        navigate('/setup');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { secretCode });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>DevHub Admin</h2>
        <p style={styles.subtitle}>Enter your secret code to continue</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Secret code"
            value={secretCode}
            onChange={(e) => setSecretCode(e.target.value)}
            style={styles.input}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#64748b' }}>
  Forgot your code?{' '}
  <Link to="/recover" style={{ color: '#3b82f6', fontWeight: '600' }}>
    Recover access
  </Link>
</p>
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
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
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

export default Login;