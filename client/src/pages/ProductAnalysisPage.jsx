// src/pages/ProductAnalysisPage.jsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, CartesianGrid,
} from 'recharts';
import { useProductDashboard } from '../hooks/useDashboard';
import { useTeams } from '../hooks/useTeams';
import { LoadingSpinner, ErrorAlert } from '../components/common/index.jsx';
import { formatInterval } from '../utils/roleHelpers';
import { Link } from 'react-router-dom';

export default function ProductAnalysisPage() {
  const { data: products, loading, error } = useProductDashboard();
  const { data: teams } = useTeams();

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorAlert message={error} />;
  if (!products) return null;

  // Recharts needs numeric values; Postgres returns bigint/numeric as strings.
  const chartData = products.map((p) => ({
    name:         p.product_name,
    Total:        parseInt(p.total_complaints)  || 0,
    Open:         parseInt(p.open_complaints)   || 0,
  }));

  return (
    <div>
      <div className="page-header">
        <h1>Product-wise Analysis</h1>

        {/* Dashboard nav for admin/manager */}
        <nav style={{ display: 'flex', gap: 10, fontSize: 13, flexWrap: 'wrap' }}>
          {(teams || []).map((t) => (
            <Link key={t.id} to={`/dashboard/team/${t.id}`} className="btn btn-secondary btn-sm">
              {t.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bar chart — complaints per product */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, marginTop: 0 }}>Complaints per Product</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ fontSize: 13, borderRadius: 6, border: '1px solid var(--color-border)' }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar dataKey="Total" fill="var(--color-primary)" radius={[4,4,0,0]} />
            <Bar dataKey="Open"  fill="var(--color-open)"    radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed table */}
      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Total Complaints</th>
              <th>Open</th>
              <th>Avg Resolution Time</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.product_id}>
                <td>{p.product_name}</td>
                <td>{p.total_complaints}</td>
                <td style={{ color: parseInt(p.open_complaints) > 0 ? 'var(--color-open)' : undefined }}>
                  {p.open_complaints}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                  {formatInterval(p.avg_resolution_time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
