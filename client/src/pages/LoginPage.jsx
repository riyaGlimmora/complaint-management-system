// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/authApi';
import { ErrorAlert } from '../components/common/index.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,  setForm]  = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy,  setBusy]  = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setBusy(true);
    setError(null);
    try {
      const { token, user } = await loginApi(form);
      login(user, token);
      navigate('/tickets');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Sign in</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, fontSize: 14 }}>
        Complaint Management System
      </p>

      <div className="card">
        <ErrorAlert message={error} />
        <div className="form-group">
          <label>Email</label>
          <input
            className="form-control"
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            className="form-control"
            type="password"
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <button className="btn" style={{ width: '100%' }} onClick={handleSubmit} disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </div>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
        New customer? <Link to="/register">Create account</Link>
      </p>
    </div>
  );
}
