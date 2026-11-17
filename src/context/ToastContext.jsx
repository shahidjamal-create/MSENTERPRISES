import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  const show = useCallback(
    (message, tone = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
      setTimeout(() => dismiss(id), 3800);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="no-print fixed bottom-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-4 sm:translate-x-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-2 rounded-lg border bg-white p-3 text-sm shadow-lg ${t.tone === 'error' ? 'border-danger/30' : 'border-line'}`}
          >
            {t.tone === 'error' ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            )}
            <p className="flex-1 text-ink">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-muted hover:text-ink" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
