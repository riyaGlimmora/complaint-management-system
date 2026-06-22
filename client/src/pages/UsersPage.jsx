// src/pages/UsersPage.jsx
import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { getUsers, createUser } from '../services/userApi';
import { useTeams } from '../hooks/useTeams';
import { LoadingSpinner, ErrorAlert } from '../components/common/index.jsx';

const BLANK = { name: '', email: '', password: '', role: 'staff', teamId: '' };

export default function UsersPage() {
  const { data: users, loading, error, refetch } = useFetch(() => getUsers(), []);
  const { data: teams } = useTeams();
  const [form,       setForm]       = useState(BLANK);
  const [formError,  setFormError]  = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm,   setShowForm]   = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const needsTeam = ['staff', 'manager'].includes(form.role);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      setFormError('Name, email, and password are required.');
      return;
    }
    if (needsTeam && !form.teamId) {
      setFormError('Team is required for staff and manager accounts.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await createUser({ ...form, teamId: needsTeam ? form.teamId : null });
      setForm(BLANK);
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.error?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <button className="btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, marginTop: 0 }}>New User</h2>
          <ErrorAlert message={formError} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <select className="form-control" name="role" value={form.role} onChange={handleChange}>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {needsTeam && (
              <div className="form-group">
                <label>Team *</label>
                <select className="form-control" name="teamId" value={form.teamId} onChange={handleChange}>
                  <option value="">Select team…</option>
                  {(teams || []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <button className="btn btn-sm" onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create User'}
          </button>
        </div>
      )}

      <ErrorAlert message={error} />
      {loading ? <LoadingSpinner /> : (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Active</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{u.email}</td>
                  <td>
                    <span
                      className="badge"
                      style={{ background: 'var(--color-primary)', fontSize: 11 }}
                    >
                      {u.role_name}
                    </span>
                  </td>
                  <td>{u.is_active ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
