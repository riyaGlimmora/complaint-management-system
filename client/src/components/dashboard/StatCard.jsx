// src/components/dashboard/StatCard.jsx
export function StatCard({ value, label, accent }) {
  return (
    <div className="stat-card">
      <div
        className="stat-value"
        style={{ color: accent || 'var(--color-primary)' }}
      >
        {value ?? '—'}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
