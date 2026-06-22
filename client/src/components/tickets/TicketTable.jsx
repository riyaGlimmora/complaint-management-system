// src/components/tickets/TicketTable.jsx
// One table component used by every role. Columns are conditionally shown
// based on role - no duplicating the table per role.
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { isInternal, isAdmin, isManager, formatDateShort } from '../../utils/roleHelpers';

export default function TicketTable({ tickets }) {
  const { user } = useAuth();
  const internal = isInternal(user?.role);
  const adminOrManager = isAdmin(user?.role) || isManager(user?.role);

  if (!tickets.length) {
    return (
      <div className="empty-state">
        <p>No tickets match your filters.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Ticket #</th>
            <th>Title</th>
            <th>Product</th>
            {internal && <th>Customer</th>}
            {adminOrManager && <th>Assigned To</th>}
            <th>Status</th>
            <th>Priority</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id}>
              <td>
                <Link
                  to={`/tickets/${t.id}`}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}
                >
                  {t.ticket_number}
                </Link>
              </td>
              <td style={{ maxWidth: 260 }}>
                <Link to={`/tickets/${t.id}`}>{t.title}</Link>
              </td>
              <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                {t.product_name}
              </td>
              {internal && (
                <td style={{ fontSize: 13 }}>{t.customer_name || '—'}</td>
              )}
              {adminOrManager && (
                <td style={{ fontSize: 13 }}>{t.assigned_staff_name || '—'}</td>
              )}
              <td><StatusBadge status={t.status} /></td>
              <td><PriorityBadge priority={t.priority} /></td>
              <td style={{ fontSize: 13, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                {formatDateShort(t.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
