// src/pages/TicketDetailPage.jsx
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTicketDetail } from '../hooks/useTicketDetail';
import { StatusBadge, PriorityBadge } from '../components/tickets/StatusBadge';
import TicketHistoryTimeline from '../components/tickets/TicketHistoryTimeline';
import { CommentList } from '../components/tickets/CommentList';
import { CommentForm } from '../components/tickets/CommentForm';
import { StatusChangeForm } from '../components/tickets/StatusChangeForm';
import { AssignForm } from '../components/tickets/AssignForm';
import { LoadingSpinner, ErrorAlert } from '../components/common/index.jsx';
import { formatDate, isAdmin, isManager, isInternal } from '../utils/roleHelpers';

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const {
    ticket, history, comments, loading, error,
    doChangeStatus, doAssign, doAddComment,
  } = useTicketDetail(id);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorAlert message={error} />;
  if (!ticket) return null;

  const canChangeStatus = isInternal(user?.role);
  const canAssign       = isAdmin(user?.role) || isManager(user?.role);

  return (
    <div>
      {/* Breadcrumb */}
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>
        <Link to="/tickets">← All tickets</Link>
      </p>

      {/* Header */}
      <div className="page-header">
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-muted)' }}>
            {ticket.ticket_number}
          </span>
          <h1 style={{ marginTop: 4 }}>{ticket.title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      {/* Two-column layout: main left, sidebar right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Description */}
          <div className="card">
            <h2 style={{ fontSize: 15, marginTop: 0 }}>Description</h2>
            <p style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 14 }}>{ticket.description}</p>
          </div>

          {/* Comments */}
          <div className="card">
            <h2 style={{ fontSize: 15, marginTop: 0 }}>
              Comments ({comments.length})
            </h2>
            <CommentList comments={comments} />
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
            <CommentForm onSubmit={doAddComment} />
          </div>

          {/* History */}
          <div className="card">
            <h2 style={{ fontSize: 15, marginTop: 0 }}>Activity log</h2>
            <TicketHistoryTimeline history={history} />
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Ticket meta */}
          <div className="card">
            <h2 style={{ fontSize: 15, marginTop: 0 }}>Details</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', fontSize: 13, margin: 0 }}>
              <dt style={{ color: 'var(--color-text-muted)' }}>Product</dt>
              <dd style={{ margin: 0 }}>{ticket.product_name}</dd>

              <dt style={{ color: 'var(--color-text-muted)' }}>Customer</dt>
              <dd style={{ margin: 0 }}>{ticket.customer_name}</dd>

              {isInternal(user?.role) && (
                <>
                  <dt style={{ color: 'var(--color-text-muted)' }}>Team</dt>
                  <dd style={{ margin: 0 }}>{ticket.assigned_team_name || '—'}</dd>

                  <dt style={{ color: 'var(--color-text-muted)' }}>Assigned to</dt>
                  <dd style={{ margin: 0 }}>{ticket.assigned_staff_name || '—'}</dd>
                </>
              )}

              <dt style={{ color: 'var(--color-text-muted)' }}>Created</dt>
              <dd style={{ margin: 0 }}>{formatDate(ticket.created_at)}</dd>

              {ticket.resolved_at && (
                <>
                  <dt style={{ color: 'var(--color-text-muted)' }}>Resolved</dt>
                  <dd style={{ margin: 0 }}>{formatDate(ticket.resolved_at)}</dd>
                </>
              )}
            </dl>
          </div>

          {/* Status update - staff/manager/admin */}
          {canChangeStatus && (
            <StatusChangeForm
              currentStatus={ticket.status}
              userRole={user?.role}
              onSubmit={doChangeStatus}
            />
          )}

          {/* Reassign - manager/admin */}
          {canAssign && ticket.assigned_team_id && (
            <AssignForm ticket={ticket} onSubmit={doAssign} />
          )}
        </div>
      </div>
    </div>
  );
}
