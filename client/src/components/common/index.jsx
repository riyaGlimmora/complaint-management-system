// src/components/common/LoadingSpinner.jsx
export function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
      <div className="spinner" role="status" aria-label="Loading" />
    </div>
  );
}

// src/components/common/ErrorAlert.jsx - exported from same file for convenience
export function ErrorAlert({ message }) {
  if (!message) return null;
  return <div className="alert alert-danger" role="alert">{message}</div>;
}

// src/components/common/Pagination.jsx
export function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="pagination" aria-label="Pagination">
      <button
        className="btn btn-secondary btn-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Prev
      </button>

      <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
        Page {page} of {totalPages} ({total} total)
      </span>

      <button
        className="btn btn-secondary btn-sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </div>
  );
}
