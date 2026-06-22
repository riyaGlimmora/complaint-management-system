// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi, login as loginApi } from '../services/authApi';
import { ErrorAlert } from '../components/common/index.jsx';

export default function RegisterPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form,  setForm]  = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy,  setBusy]  = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setBusy(true);
    setError(null);
    try {
      await registerApi(form);
      // Auto-login after registration so the user lands directly in the app.
      const { token, user } = await loginApi({ email: form.email, password: form.password });
      login(user, token);
      navigate('/tickets');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Create account</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, fontSize: 14 }}>
        Raise and track complaints against your products
      </p>

      <div className="card">
        <ErrorAlert message={error} />
        <div className="form-group">
          <label>Full name</label>
          <input className="form-control" name="name" value={form.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Password <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>(min 8 characters)</span></label>
          <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} />
        </div>
        <button className="btn" style={{ width: '100%' }} onClick={handleSubmit} disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </div>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
