// src/components/layout/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Wraps a route that requires authentication.
 * `roles` (optional): array of allowed roles. Omit to allow any authenticated user.
 */
export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return (
      <div style={{ padding: '48px 20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          You don't have permission to view this page.
        </p>
        <a href="/">← Back to tickets</a>
      </div>
    );
  }

  return children;
}
