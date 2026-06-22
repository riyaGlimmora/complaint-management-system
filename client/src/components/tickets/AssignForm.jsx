// src/components/tickets/AssignForm.jsx
import { useState } from 'react';
import { useTeamStaff } from '../../hooks/useTeams';
import { ErrorAlert } from '../common/index.jsx';

export function AssignForm({ ticket, onSubmit }) {
  const { data: staff, loading } = useTeamStaff(ticket?.assigned_team_id);
  const [staffId,    setStaffId]    = useState('');
  const [note,       setNote]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);

  if (!ticket?.assigned_team_id) return null;

  const handleSubmit = async () => {
    if (!staffId) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(staffId, note);
      setNote('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to reassign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0, fontSize: 15 }}>Reassign Ticket</h3>
      <ErrorAlert message={error} />
      <div className="form-group">
        <label>Assign to</label>
        <select
          className="form-control"
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
          disabled={loading}
        >
          <option value="">Select staff member…</option>
          {(staff || []).map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.role_name})</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Note (optional)</label>
        <textarea
          className="form-control"
          rows={2}
          placeholder="Reason for reassignment…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <button
        className="btn btn-sm"
        onClick={handleSubmit}
        disabled={submitting || !staffId}
      >
        {submitting ? 'Saving…' : 'Reassign'}
      </button>
    </div>
  );
}
