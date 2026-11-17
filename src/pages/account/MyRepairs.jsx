import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { bookingApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate } from '../../utils/format';

export default function MyRepairs() {
  const { data, loading, error, reload } = useAsync(() => bookingApi.mine(), []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data.length) {
    return <EmptyState icon={Wrench} title="No repair bookings" message="Bookings made with your account email appear here." action={<Link to="/book-repair" className="btn btn-primary">Book a repair</Link>} />;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-ink">My Repairs</h2>
      {data.map((b) => (
        <div key={b.booking_code} className="card flex flex-wrap items-center gap-x-6 gap-y-2 p-4">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">{b.booking_code}</p>
            <p className="text-xs text-muted">
              {b.brand_name} {b.model_name} · {b.service_name} · {formatDate(b.appointment_date)}
            </p>
          </div>
          <StatusBadge status={b.status} />
          <Link to={`/track-repair?code=${b.booking_code}`} className="text-sm font-semibold text-brand hover:underline">
            Track
          </Link>
        </div>
      ))}
    </div>
  );
}
