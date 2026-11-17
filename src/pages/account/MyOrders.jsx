import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { orderApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate, formatPrice } from '../../utils/format';

export default function MyOrders() {
  const { data, loading, error, reload } = useAsync(() => orderApi.mine(), []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data.length) {
    return <EmptyState icon={Package} title="No orders yet" message="Orders you place will appear here." action={<Link to="/shop" className="btn btn-primary">Start shopping</Link>} />;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-ink">My Orders</h2>
      {data.map((order) => (
        <Link key={order.id} to={`/account/orders/${order.id}`} className="card flex flex-wrap items-center gap-x-6 gap-y-2 p-4 hover:border-brand">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">{order.order_number}</p>
            <p className="text-xs text-muted">
              {formatDate(order.created_at)} · {order.order_items.length} item{order.order_items.length > 1 ? 's' : ''}
            </p>
          </div>
          <span className="text-sm font-bold">{formatPrice(order.total)}</span>
          <StatusBadge status={order.status} />
        </Link>
      ))}
    </div>
  );
}
