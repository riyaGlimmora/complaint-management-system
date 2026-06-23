// src/utils/roleHelpers.js

export const ROLES = { ADMIN: 'admin', MANAGER: 'manager', STAFF: 'staff', CUSTOMER: 'customer' };

export const isAdmin    = (role) => role === ROLES.ADMIN;
export const isManager  = (role) => role === ROLES.MANAGER;
export const isStaff    = (role) => role === ROLES.STAFF;
export const isCustomer = (role) => role === ROLES.CUSTOMER;
export const isInternal = (role) => [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF].includes(role);

// The status transitions a given role is allowed to trigger from a current status.
const TRANSITIONS = {
  open:        ['in_progress'],
  in_progress: ['resolved'],
  resolved:    ['closed', 'reopened'],
  reopened:    ['in_progress'],
  closed:      [],
};

export function allowedNextStatuses(currentStatus, role) {
  if (isCustomer(role)) return [];          // customers never change status
  if (currentStatus === 'resolved' && isStaff(role)) return ['closed']; // staff can only close, not reopen
  return TRANSITIONS[currentStatus] || [];
}

// Format Postgres interval (e.g. "1 day 03:12:00") into readable string.
export function formatInterval(interval) {
  if (!interval) return '—';
  if (typeof interval === 'object') {
    // PostgreSQL returns interval as { hours, minutes, seconds, days, ... }
    const h = interval.hours || 0;
    const m = interval.minutes || 0;
    const d = interval.days || 0;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
  const str = String(interval);
  const match = str.match(/(\d+) day[s]? (\d{2}):(\d{2})/);
  if (match) return `${match[1]}d ${match[2]}h ${match[3]}m`;
  const hmatch = str.match(/(\d{2}):(\d{2})/);
  if (hmatch) return `${hmatch[1]}h ${hmatch[2]}m`;
  return str;
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatDateShort(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export const STATUS_LABELS = {
  open: 'Open', in_progress: 'In Progress', resolved: 'Resolved',
  closed: 'Closed', reopened: 'Reopened',
};
export const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };
