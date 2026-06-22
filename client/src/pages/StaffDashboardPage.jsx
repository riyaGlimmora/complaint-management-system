// src/pages/StaffDashboardPage.jsx
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useStaffDashboard } from '../hooks/useDashboard';
import { StatCard } from '../components/dashboard/StatCard';
import { LoadingSpinner, ErrorAlert } from '../components/common/index.jsx';
import { formatInterval, formatDateShort } from '../utils/roleHelpers';

export default function StaffDashboardPage() {
  const { id } = useParams();
  const { data, loading, error } = useStaffDashboard(id);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorAlert message={error} />;
  if (!data)   return null;

  const { summary, ticketTimings } = data;

  // Recharts data for the summary bar chart
  const chartData = [
    { name: 'Assigned',  value: parseInt(summary.total_assigned) || 0, fill: 'var(--color-primary)' },
    { name: 'Completed', value: parseInt(summary.completed)      || 0, fill: 'var(--color-resolved)' },
    { name: 'Pending',   value: parseInt(summary.pending)        || 0, fill: 'var(--color-in_progress)' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Staff Performance</h1>
      </div>

      {/* Summary stat cards */}
      <div className="stat-grid">
        <StatCard value={summary.total_assigned} label="Total Assigned" />
        <StatCard value={summary.completed} label="Completed" accent="var(--color-resolved)" />
        <StatCard value={summary.pending}   label="Pending"   accent="var(--color-in_progress)" />
        <StatCard
          value={formatInterval(summary.avg_resolution_time)}
          label="Avg Resolution Time"
          accent="var(--color-accent)"
        />
      </div>

      {/* Bar chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, marginTop: 0 }}>Ticket Summary</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
            <Tooltip
              contentStyle={{ fontSize: 13, borderRadius: 6, border: '1px solid var(--color-border)' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-ticket timings table */}
      {ticketTimings.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <div style={{ padding: '14px 16px 0' }}>
            <h2 style={{ fontSize: 15, margin: 0 }}>Ticket Timings</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Title</th>
                <th>Status</th>
                <th>Created</th>
                <th>Resolved</th>
                <th>Time Taken</th>
              </tr>
            </thead>
            <tbody>
              {ticketTimings.map((t) => (
                <tr key={t.ticket_number}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{t.ticket_number}</td>
                  <td style={{ maxWidth: 240 }}>{t.title}</td>
                  <td>{t.status}</td>
                  <td style={{ fontSize: 13 }}>{formatDateShort(t.created_at)}</td>
                  <td style={{ fontSize: 13 }}>{formatDateShort(t.resolved_at)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                    {formatInterval(t.resolution_time)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
