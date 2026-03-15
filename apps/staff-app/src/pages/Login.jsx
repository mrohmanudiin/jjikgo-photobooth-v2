import React, { useState } from 'react';
import { login } from '../utils/api';
import '../index.css';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await login(username, password);
      
      // Save to localStorage just like Cashier does but in staff-store
      const storeData = {
        state: {
          user: {
            id: data.id,
            username: data.username,
            full_name: data.full_name,
            role: data.role,
            branch_id: data.branch_id,
            token: data.token
          },
          branch: data.branch
        }
      };
      localStorage.setItem('jjikgo-staff-store', JSON.stringify(storeData));
      
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      color: 'var(--text)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="ambient-glow">
        <div className="glow-1" />
        <div className="glow-2" />
      </div>
      
      <div className="glass-panel" style={{
        padding: '3rem',
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            JJIKGO STAFF
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Enter your credentials to access the booth queue</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '1rem',
            borderRadius: '12px',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="glass-panel"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text)',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="glass-panel"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text)',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: 'var(--primary)',
              color: '#000',
              border: 'none',
              padding: '1rem',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '0.5rem',
              transition: 'all 0.2s',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In as Staff'}
          </button>
        </form>
      </div>
    </div>
  );
}
