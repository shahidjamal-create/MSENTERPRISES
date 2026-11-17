export function Field({ label, error, hint, required, children, className = '', htmlFor }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function Input({ error, className = '', ...props }) {
  return <input className={`input ${className}`} aria-invalid={error ? 'true' : 'false'} {...props} />;
}

export function Select({ error, className = '', children, ...props }) {
  return (
    <select className={`input ${className}`} aria-invalid={error ? 'true' : 'false'} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ error, className = '', ...props }) {
  return <textarea className={`input ${className}`} aria-invalid={error ? 'true' : 'false'} {...props} />;
}

export function Checkbox({ label, checked, onChange, disabled }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input type="checkbox" className="h-4 w-4 accent-brand" checked={!!checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
      {label}
    </label>
  );
}
