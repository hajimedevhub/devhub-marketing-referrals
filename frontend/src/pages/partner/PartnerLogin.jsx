import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PartnerAPI } from '../../api';

function PartnerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await PartnerAPI.post('/partner-auth/login', { email, password });
      localStorage.setItem('partnerToken', res.data.token);
      navigate('/partner/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Left — brand panel */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'white'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '60px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '18px'
            }}>D</div>
            <span style={{ fontSize: '18px', fontWeight: '700' }}>DevHub Partner</span>
          </div>

          <h1 style={{ fontSize: '42px', fontWeight: '700', lineHeight: '1.2', marginBottom: '20px' }}>
            Grow your business<br />with DevHub
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.85, maxWidth: '400px', lineHeight: '1.6' }}>
            Track referrals, manage your clients, and watch your commissions grow — all in one place.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { value: '100%', label: 'Transparency' },
            { value: '24/7', label: 'Access' },
            { value: 'Real-time', label: 'Updates' }
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{s.value}</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
            Sign in to access your partner dashboard
          </p>

          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '14px',
                marginBottom: '16px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />

            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '14px',
                marginBottom: '20px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />

            {error && (
              <div style={{
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '24px' }}>
            Forgot password? Contact your DevHub admin.
          </p>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '12px' }}>
            <Link to="/login" style={{ color: '#6366f1', fontWeight: '600', textDecoration: 'none' }}>
              ← Admin login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PartnerLogin;