import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({ title, description, crumbs = [] }) {
  return (
    <section className="border-b border-line bg-surface">
      <div className="container-page py-7 md:py-9">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand">
            Home
          </Link>
          {crumbs.map(([label, to]) => (
            <span key={label} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              {to ? (
                <Link to={to} className="hover:text-brand">
                  {label}
                </Link>
              ) : (
                <span className="text-ink">{label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="mt-2 text-2xl font-bold text-navy md:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted md:text-[15px]">{description}</p>}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-brand">{eyebrow}</p>}
        <h2 className="mt-1 text-xl font-bold text-navy md:text-2xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
