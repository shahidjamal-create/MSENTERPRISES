import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" /> Prev
      </button>
      <span className="px-2 text-sm text-muted">
        Page {page} of {pages}
      </span>
      <button className="btn btn-outline btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
