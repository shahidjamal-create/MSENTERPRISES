import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, title, onClose, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }[size];

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-navy/50 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[90vh] sm:max-h-[85vh] w-full ${width} flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-xl`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5 sm:py-3.5">
          <h2 className="text-sm sm:text-base font-semibold text-ink truncate pr-2">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-muted hover:bg-surface hover:text-ink shrink-0" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-4 py-3 sm:px-5">{footer}</div>}
      </div>
    </div>
  );
}
