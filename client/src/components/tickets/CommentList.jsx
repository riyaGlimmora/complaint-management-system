// src/components/tickets/CommentList.jsx
import { formatDate } from '../../utils/roleHelpers';

export function CommentList({ comments }) {
  if (!comments.length) {
    return <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No comments yet.</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {comments.map((c) => (
        <div
          key={c.id}
          style={{
            background: c.is_internal ? '#fdf8ed' : 'var(--color-surface)',
            border: `1px solid ${c.is_internal ? '#e8d99b' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius)',
            padding: '12px 14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 500, fontSize: 14 }}>{c.author_name}</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {c.is_internal && (
                <span
                  style={{
                    fontSize: 11,
                    background: '#e8d99b',
                    color: '#7a5c00',
                    borderRadius: 999,
                    padding: '2px 8px',
                    fontWeight: 600,
                  }}
                >
                  Internal note
                </span>
              )}
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                {formatDate(c.created_at)}
              </span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 14, whiteSpace: 'pre-wrap' }}>{c.comment_text}</p>
        </div>
      ))}
    </div>
  );
}
