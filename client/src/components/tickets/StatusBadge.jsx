// src/components/tickets/StatusBadge.jsx
import { STATUS_LABELS } from '../../utils/roleHelpers';

const COLOR = {
  open:        'var(--color-open)',
  in_progress: 'var(--color-in_progress)',
  resolved:    'var(--color-resolved)',
  closed:      'var(--color-closed)',
  reopened:    'var(--color-reopened)',
};

export function StatusBadge({ status }) {
  return (
    <span
      className="badge"
      style={{ background: COLOR[status] || 'var(--color-closed)' }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// PriorityBadge
const PCOL = {
  low:    'var(--color-low)',
  medium: 'var(--color-medium)',
  high:   'var(--color-high)',
  urgent: 'var(--color-urgent)',
};

import { PRIORITY_LABELS } from '../../utils/roleHelpers';

export function PriorityBadge({ priority }) {
  return (
    <span
      className="badge"
      style={{ background: PCOL[priority] || 'var(--color-low)' }}
    >
      {PRIORITY_LABELS[priority] || priority}
    </span>
  );
}
