import { capitalize } from '../../utils/format';

const TONES = {
  green: 'bg-success-soft text-success',
  amber: 'bg-warning-soft text-warning',
  red: 'bg-danger-soft text-danger',
  blue: 'bg-brand-soft text-brand',
  grey: 'bg-surface text-muted',
};

const STATUS_TONE = {
  pending: 'amber',
  processing: 'blue',
  shipped: 'blue',
  completed: 'green',
  cancelled: 'red',
  paid: 'green',
  refunded: 'grey',
  failed: 'red',
  sent: 'green',
  not_configured: 'amber',
  disabled: 'grey',
  new: 'blue',
  in_progress: 'amber',
  resolved: 'green',
  Pending: 'amber',
  Accepted: 'blue',
  Diagnosis: 'blue',
  'Waiting for Parts': 'amber',
  'Repair in Progress': 'blue',
  Completed: 'green',
  Delivered: 'green',
  Cancelled: 'red',
  active: 'green',
  inactive: 'grey',
};

export default function StatusBadge({ status, tone, label }) {
  const color = TONES[tone || STATUS_TONE[status] || 'grey'];
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {label || capitalize(String(status))}
    </span>
  );
}
