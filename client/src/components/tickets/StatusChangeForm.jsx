// src/components/tickets/StatusChangeForm.jsx
import { useState } from 'react';
import { allowedNextStatuses, STATUS_LABELS } from '../../utils/roleHelpers';
import { ErrorAlert } from '../common/index.jsx';

export function StatusChangeForm({ currentStatus, userRole, onSubmit }) {
  const options = allowedNextStatuses(currentStatus, userRole);
  const [status,     setStatus]     = useState(options[0] || '');
  const [note,       setNote]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);

  if (!options.length) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(status, note);
      setNote('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0, fontSize: 15 }}>Update Status</h3>
      <ErrorAlert message={error} />
      <div className="form-group">
        <label>New status</label>
        <select
          className="form-control"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {options.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Note (optional)</label>
        <textarea
          className="form-control"
          rows={2}
          placeholder="Reason for status change…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <button className="btn btn-sm" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Saving…' : 'Update'}
      </button>
    </div>
  );
}
