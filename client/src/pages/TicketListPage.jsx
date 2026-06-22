// src/pages/TicketListPage.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../hooks/useTickets';
import TicketTable from '../components/tickets/TicketTable';
import TicketFilters from '../components/tickets/TicketFilters';
import { LoadingSpinner, ErrorAlert, Pagination } from '../components/common/index.jsx';

export default function TicketListPage() {
  const { user } = useAuth();
  const { tickets, total, page, pageSize, filters, updateFilter, setPage, loading, error } =
    useTickets();

  return (
    <div>
      <div className="page-header">
        <h1>
          {user?.role === 'customer' ? 'My Complaints' : 'Tickets'}
          {!loading && (
            <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 10 }}>
              {total} total
            </span>
          )}
        </h1>
        {user?.role === 'customer' && (
          <Link to="/tickets/new" className="btn">
            + New Complaint
          </Link>
        )}
      </div>

      <TicketFilters filters={filters} onFilter={updateFilter} />

      <ErrorAlert message={error} />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <TicketTable tickets={tickets} />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
