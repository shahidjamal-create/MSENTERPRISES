import { AlertTriangle, CheckCircle2, Info, Loader2, PackageOpen, RotateCcw, XCircle } from 'lucide-react';

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin text-brand ${className}`} aria-hidden="true" />;
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-muted" role="status">
      <Spinner className="h-7 w-7" />
      {label}
    </div>
  );
}

export function EmptyState({ icon: Icon = PackageOpen, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
      <Icon className="h-10 w-10 text-muted/60" />
      <h3 className="mt-3 font-semibold text-ink">{title}</h3>
      {message && <p className="mt-1 max-w-md text-sm text-muted">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-danger/20 bg-danger-soft px-6 py-10 text-center">
      <XCircle className="h-9 w-9 text-danger" />
      <p className="mt-3 max-w-md text-sm text-ink">{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button className="btn btn-outline btn-sm mt-4" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  );
}

const ALERT_STYLES = {
  info: ['bg-brand-soft border-brand/20 text-ink', Info, 'text-brand'],
  success: ['bg-success-soft border-success/20 text-ink', CheckCircle2, 'text-success'],
  warning: ['bg-warning-soft border-warning/25 text-ink', AlertTriangle, 'text-warning'],
  error: ['bg-danger-soft border-danger/20 text-ink', XCircle, 'text-danger'],
};

export function Alert({ tone = 'info', title, children, className = '' }) {
  const [style, Icon, iconColor] = ALERT_STYLES[tone];
  return (
    <div className={`flex gap-3 rounded-lg border p-3 text-sm ${style} ${className}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5 text-muted' : ''}>{children}</div>}
      </div>
    </div>
  );
}
