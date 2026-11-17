import { Check } from 'lucide-react';
import { formatDateTime, capitalize } from '../utils/format';

// Shows a status stepper plus the recorded history entries.
export default function StatusTimeline({ steps = [], current = '', history = [] }) {
  const cancelled = /cancel/i.test(current);
  const currentIndex = steps.indexOf(current);

  return (
    <div>
      {!cancelled && steps.length > 0 && (
        <ol className="mb-6 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:gap-y-3 sm:overflow-visible">
          {steps.map((step, i) => {
            const done = i <= currentIndex;
            return (
              <li key={step} className="flex min-w-[95px] shrink-0 sm:shrink sm:min-w-[110px] sm:flex-1 items-center gap-1.5 sm:gap-2">
                <span className={`flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold ${done ? 'bg-brand text-white' : 'bg-surface text-muted ring-1 ring-line'}`}>
                  {done ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : i + 1}
                </span>
                <span className={`text-[11px] sm:text-xs truncate ${done ? 'font-semibold text-ink' : 'text-muted'}`}>{capitalize(step)}</span>
              </li>
            );
          })}
        </ol>
      )}
      {history.length > 0 && (
        <ul className="space-y-3 border-l-2 border-line pl-4">
          {[...history].reverse().map((h, i) => (
            <li key={i} className="relative">
              <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-brand' : 'bg-line'}`} />
              <p className="text-xs sm:text-sm font-semibold text-ink">{capitalize(h.status)}</p>
              <p className="text-[11px] sm:text-xs text-muted">
                {formatDateTime(h.at)}
                {h.note ? ` — ${h.note}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
