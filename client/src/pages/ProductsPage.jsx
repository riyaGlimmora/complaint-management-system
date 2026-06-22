// src/pages/ProductsPage.jsx
import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useTeams } from '../hooks/useTeams';
import { createProduct } from '../services/productApi';
import { LoadingSpinner, ErrorAlert } from '../components/common/index.jsx';

export default function ProductsPage() {
  const { data: products, loading, error, refetch } = useProducts();
  const { data: teams } = useTeams();
  const [form,        setForm]        = useState({ name: '', category: '', teamId: '' });
  const [formError,   setFormError]   = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [showForm,    setShowForm]    = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreate = async () => {
    if (!form.name || !form.teamId) {
      setFormError('Name and team are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await createProduct(form);
      setForm({ name: '', category: '', teamId: '' });
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.error?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, marginTop: 0 }}>New Product</h2>
          <ErrorAlert message={formError} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Name *</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input className="form-control" name="category" value={form.category} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Handling Team *</label>
              <select className="form-control" name="teamId" value={form.teamId} onChange={handleChange}>
                <option value="">Select team…</option>
                {(teams || []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-sm" onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Product'}
          </button>
        </div>
      )}

      <ErrorAlert message={error} />
      {loading ? <LoadingSpinner /> : (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Handling Team</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {(products || []).map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{p.category || '—'}</td>
                  <td>{p.team_name || '—'}</td>
                  <td>{p.is_active ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
