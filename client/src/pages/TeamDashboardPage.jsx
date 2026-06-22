// src/pages/TeamDashboardPage.jsx
import { useParams } from 'react-router-dom';
import { useTeamDashboard } from '../hooks/useDashboard';
import { StatCard } from '../components/dashboard/StatCard';
import { StaffBreakdownTable } from '../components/dashboard/StaffBreakdownTable';
import { LoadingSpinner, ErrorAlert } from '../components/common/index.jsx';
import { formatInterval } from '../utils/roleHelpers';

export default function TeamDashboardPage() {
  const { id } = useParams();
  const { data, loading, error } = useTeamDashboard(id);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorAlert message={error} />;
  if (!data)   return null;

  const { summary, staffBreakdown } = data;

  return (
    <div>
      <div className="page-header">
        <h1>Team Performance</h1>
      </div>

      <div className="stat-grid">
        <StatCard value={summary.total_tickets} label="Total Tickets" />
        <StatCard value={summary.completed} label="Completed" accent="var(--color-resolved)" />
        <StatCard value={summary.backlog}    label="Backlog"   accent="var(--color-in_progress)" />
        <StatCard
          value={formatInterval(summary.avg_resolution_time)}
          label="Avg Resolution Time"
          accent="var(--color-accent)"
        />
      </div>

      <div className="page-header" style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 17, margin: 0 }}>Staff Breakdown</h2>
      </div>
      <StaffBreakdownTable rows={staffBreakdown} />
    </div>
  );
}
