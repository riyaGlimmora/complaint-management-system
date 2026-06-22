// src/components/tickets/CommentForm.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isInternal } from '../../utils/roleHelpers';
import { ErrorAlert } from '../common/index.jsx';

export function CommentForm({ onSubmit }) {
  const { user } = useAuth();
  const [text,       setText]       = useState('');
  const [internal,   setInternal]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(text.trim(), internal);
      setText('');
      setInternal(false);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <ErrorAlert message={error} />
      <textarea
        className="form-control"
        rows={3}
        placeholder="Write a comment…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {isInternal(user?.role) && (
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={internal}
              onChange={(e) => setInternal(e.target.checked)}
            />
            Internal note (hidden from customer)
          </label>
        )}
        <button
          className="btn btn-sm"
          onClick={handleSubmit}
          disabled={submitting || !text.trim()}
          style={{ marginLeft: 'auto' }}
        >
          {submitting ? 'Posting…' : 'Post comment'}
        </button>
      </div>
    </div>
  );
}
