// src/pages/TeamsPage.jsx
import { useState } from 'react';
import { useTeams } from '../hooks/useTeams';
import { createTeam } from '../services/teamApi';
import { LoadingSpinner, ErrorAlert } from '../components/common/index.jsx';
import { Link } from 'react-router-dom';

export default function TeamsPage() {
  const { data: teams, loading, error, refetch } = useTeams();
  const [name,       setName]       = useState('');
  const [formError,  setFormError]  = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm,   setShowForm]   = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { setFormError('Team name is required.'); return; }
    setSubmitting(true);
    setFormError(null);
    try {
      await createTeam({ name: name.trim() });
      setName('');
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.error?.message || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Teams</h1>
        <button className="btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add Team'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, maxWidth: 400 }}>
          <h2 style={{ fontSize: 15, marginTop: 0 }}>New Team</h2>
          <ErrorAlert message={formError} />
          <div className="form-group">
            <label>Team Name *</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <button className="btn btn-sm" onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Team'}
          </button>
        </div>
      )}

      <ErrorAlert message={error} />
      {loading ? <LoadingSpinner /> : (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr><th>Name</th><th>Created</th><th></th></tr>
            </thead>
            <tbody>
              {(teams || []).map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <Link to={`/dashboard/team/${t.id}`} style={{ fontSize: 13 }}>
                      Dashboard →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
