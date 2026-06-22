// src/pages/CreateTicketPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../services/ticketApi';
import { useProducts } from '../hooks/useProducts';
import { ErrorAlert, LoadingSpinner } from '../components/common/index.jsx';

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { data: products, loading: loadingProducts } = useProducts();
  const [form, setForm] = useState({
    title: '', description: '', productId: '', priority: 'medium',
  });
  const [error,      setError]      = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.productId) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await createTicket(form);
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProducts) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: 620 }}>
      <div className="page-header">
        <h1>New Complaint</h1>
      </div>

      <div className="card">
        <ErrorAlert message={error} />

        <div className="form-group">
          <label>Product <span style={{ color: 'var(--color-reopened)' }}>*</span></label>
          <select
            className="form-control"
            name="productId"
            value={form.productId}
            onChange={handleChange}
          >
            <option value="">Select a product…</option>
            {(products || []).map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.category}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Title <span style={{ color: 'var(--color-reopened)' }}>*</span></label>
          <input
            className="form-control"
            name="title"
            placeholder="Brief summary of the issue"
            value={form.title}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Description <span style={{ color: 'var(--color-reopened)' }}>*</span></label>
          <textarea
            className="form-control"
            name="description"
            rows={5}
            placeholder="Describe the issue in detail: what happened, when, and any steps to reproduce…"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Priority</label>
          <select
            className="form-control"
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/tickets')}
          >
            Cancel
          </button>
          <button className="btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Complaint'}
          </button>
        </div>
      </div>
    </div>
  );
}
