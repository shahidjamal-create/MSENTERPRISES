import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import PageHeader, { SectionHeading } from '../components/PageHeader';
import { catalogApi } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { EmptyState, ErrorState, PageLoader } from '../components/ui/Feedback';
import { serviceIcon } from '../utils/icons';
import { formatPrice } from '../utils/format';

const STEPS = [
  ['Book online or walk in', 'Share your phone model and the problem. You get a booking ID straight away.'],
  ['Diagnosis & estimate', 'A technician checks the device and confirms the cost before repairing.'],
  ['Repair', 'Parts are replaced or fixed. Status updates appear on the tracking page.'],
  ['Quality check & delivery', 'We test the phone and hand it back once you are happy.'],
];

export default function Services() {
  const { data, loading, error, reload } = useAsync(() => catalogApi.services(), []);

  return (
    <>
      <PageHeader
        title="Repair Services"
        description="Repairs for Apple, Samsung, Vivo, Oppo, OnePlus, Realme, Redmi, Xiaomi, Motorola and other brands. The final cost depends on your model and the parts needed — we confirm it before starting work."
        crumbs={[['Repair Services']]}
      />
      <div className="container-page py-6 sm:py-10">
        {loading && <PageLoader />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {data && data.length === 0 && <EmptyState title="No services listed" message="Please contact the store for repair enquiries." />}
        {data && data.length > 0 && (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
            {data.map((s) => {
              const Icon = serviceIcon(s.slug);
              return (
                <div key={s.id} className="card flex flex-col gap-3 sm:gap-4 p-4 sm:p-5 sm:flex-row">
                  <span className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-base font-semibold text-ink">{s.name}</h2>
                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted">{s.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
                      <span className="font-semibold text-ink">{s.price_from != null ? `From ${formatPrice(s.price_from)}` : 'Quote after diagnosis'}</span>
                      {s.duration && (
                        <span className="flex items-center gap-1 text-muted">
                          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {s.duration}
                        </span>
                      )}
                      <Link to={`/book-repair?service=${s.id}`} className="btn btn-primary btn-sm ml-auto">
                        Book
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 sm:mt-14">
          <SectionHeading eyebrow="How it works" title="Repair process" />
          <ol className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="rounded-xl bg-surface p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">{i + 1}</span>
                <h3 className="mt-3 font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/book-repair" className="btn btn-primary">
              Book a Repair
            </Link>
            <Link to="/track-repair" className="btn btn-outline">
              Track an existing repair
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
