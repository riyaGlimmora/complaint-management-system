// src/components/tickets/TicketFilters.jsx
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../context/AuthContext';
import { isInternal } from '../../utils/roleHelpers';

export default function TicketFilters({ filters, onFilter }) {
  const { user } = useAuth();
  const { data: products } = useProducts();

  return (
    <div className="filter-bar card" style={{ marginBottom: 16 }}>
      {/* Free text */}
      <div className="form-group">
        <label>Search</label>
        <input
          className="form-control"
          placeholder="Ticket # or title…"
          value={filters.q || ''}
          onChange={(e) => onFilter('q', e.target.value || undefined)}
        />
      </div>

      {/* Status */}
      <div className="form-group">
        <label>Status</label>
        <select
          className="form-control"
          value={filters.status || ''}
          onChange={(e) => onFilter('status', e.target.value || undefined)}
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="reopened">Reopened</option>
        </select>
      </div>

      {/* Priority */}
      <div className="form-group">
        <label>Priority</label>
        <select
          className="form-control"
          value={filters.priority || ''}
          onChange={(e) => onFilter('priority', e.target.value || undefined)}
        >
          <option value="">All</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Product filter — available to all roles */}
      <div className="form-group">
        <label>Product</label>
        <select
          className="form-control"
          value={filters.productId || ''}
          onChange={(e) => onFilter('productId', e.target.value || undefined)}
        >
          <option value="">All products</option>
          {(products || []).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Date range - visible to internal roles */}
      {isInternal(user?.role) && (
        <>
          <div className="form-group">
            <label>From</label>
            <input
              type="date"
              className="form-control"
              value={filters.dateFrom || ''}
              onChange={(e) => onFilter('dateFrom', e.target.value || undefined)}
            />
          </div>
          <div className="form-group">
            <label>To</label>
            <input
              type="date"
              className="form-control"
              value={filters.dateTo || ''}
              onChange={(e) => onFilter('dateTo', e.target.value || undefined)}
            />
          </div>
        </>
      )}
    </div>
  );
}
