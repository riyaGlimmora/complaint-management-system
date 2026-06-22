// src/components/tickets/TicketHistoryTimeline.jsx
import { formatDate } from '../../utils/roleHelpers';

const ACTION_LABEL = {
  created:       '🎫 Ticket created',
  status_change: '🔄 Status changed',
  assignment:    '👤 Assigned',
  comment:       '💬 Comment added',
};

export default function TicketHistoryTimeline({ history }) {
  if (!history.length) return <p style={{ color: 'var(--color-text-muted)' }}>No activity yet.</p>;

  return (
    <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {history.map((entry) => (
        <li
          key={entry.id}
          style={{
            display: 'flex',
            gap: 12,
            paddingBottom: 16,
            borderLeft: '2px solid var(--color-border)',
            paddingLeft: 16,
            marginLeft: 8,
            position: 'relative',
          }}
        >
          {/* timeline dot */}
          <span
            style={{
              position: 'absolute',
              left: -7,
              top: 2,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'var(--color-primary)',
              border: '2px solid var(--color-bg)',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {ACTION_LABEL[entry.action_type] || entry.action_type}
            </div>
            {entry.old_value && entry.new_value && (
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                {entry.old_value} → {entry.new_value}
              </div>
            )}
            {entry.note && (
              <div style={{ fontSize: 13, marginTop: 2 }}>{entry.note}</div>
            )}
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
              {entry.actor_name || 'System'} · {formatDate(entry.created_at)}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
