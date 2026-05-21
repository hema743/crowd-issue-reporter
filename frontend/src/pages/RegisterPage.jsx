import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f8faff',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: '16px', padding: '36px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏙️</div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 6px' }}>
            Join CivicAlert
          </h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
            Create an account to report issues
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fde8e8', color: '#e02424',
            padding: '10px 14px', borderRadius: '8px',
            fontSize: '13px', marginBottom: '16px',
          }}>❌ {error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text" name="name" value={form.name}
              onChange={handleChange} placeholder="Your full name"
              required style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="you@example.com"
              required style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password" name="password" value={form.password}
              onChange={handleChange} placeholder="At least 6 characters"
              required style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password" name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange} placeholder="Repeat password"
              required style={inputStyle}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '11px',
              background: loading ? '#93c5fd' : '#1a56db',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
            }}
          >{loading ? 'Creating account...' : 'Create Account'}</button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1a56db', fontWeight: '700', textDecoration: 'none' }}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#374151' };
const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box' };