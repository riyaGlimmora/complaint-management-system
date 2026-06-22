// src/components/dashboard/StaffBreakdownTable.jsx
import { formatInterval } from '../../utils/roleHelpers';
import { Link } from 'react-router-dom';

export function StaffBreakdownTable({ rows }) {
  if (!rows?.length) {
    return <p style={{ color: 'var(--color-text-muted)' }}>No staff data available.</p>;
  }
  return (
    <div className="card" style={{ padding: 0, overflow: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Staff Member</th>
            <th>Assigned</th>
            <th>Completed</th>
            <th>Pending</th>
            <th>Avg Resolution</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.staff_id}>
              <td>{r.staff_name}</td>
              <td>{r.total_assigned}</td>
              <td style={{ color: 'var(--color-resolved)', fontWeight: 500 }}>{r.completed}</td>
              <td style={{ color: 'var(--color-in_progress)', fontWeight: 500 }}>{r.pending}</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                {formatInterval(r.avg_resolution_time)}
              </td>
              <td>
                <Link
                  to={`/dashboard/staff/${r.staff_id}`}
                  style={{ fontSize: 13 }}
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
