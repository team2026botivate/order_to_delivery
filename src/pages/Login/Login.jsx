import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDummyLogin = (role) => {
    setError('');
    try {
      login(role, role);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Ace Mark ERP</h2>
        <p className="login-subtitle">Sign in to your account</p>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary login-btn">
            Login
          </button>
        </form>

        <div className="dummy-login-container" style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <p style={{ textAlign: 'center', marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Quick Login (Demo)</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ flex: 1, fontSize: '0.85rem' }}
              onClick={() => handleDummyLogin('admin')}
            >
              Admin
            </button>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ flex: 1, fontSize: '0.85rem' }}
              onClick={() => handleDummyLogin('user')}
            >
              User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
