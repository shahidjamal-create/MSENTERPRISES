import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { orderApi, errorMessage } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { Alert, ErrorState, PageLoader } from '../../components/ui/Feedback';
import StatusBadge from '../../components/ui/StatusBadge';
import StatusTimeline from '../../components/StatusTimeline';
import { useToast } from '../../context/ToastContext';
import { capitalize, formatDateTime, formatPrice } from '../../utils/format';

const STEPS = ['pending', 'processing', 'shipped', 'completed'];

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const toast = useToast();
  const [cancelling, setCancelling] = useState(false);
  const { data: order, loading, error, reload } = useAsync(() => orderApi.get(id), [id]);

  const cancel = async () => {
    if (!window.confirm('Cancel this order? Items will be returned to stock.')) return;
    setCancelling(true);
    try {
      await orderApi.cancel(order.id);
      toast('Order cancelled.');
      reload();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const placed = location.state?.placed;
  const emailStatus = location.state?.emailStatus;

  return (
    <div className="space-y-5">
      <Link to="/account/orders" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>
      {placed && (
        <Alert tone="success" title="Order placed successfully">
          Your order number is <strong>{order.order_number}</strong>. An order confirmation invoice copy has been sent to your email (<strong>{order.email}</strong>) via Brevo Emailing Service.
        </Alert>
      )}

      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">{order.order_number}</h2>
            <p className="text-xs text-muted">Placed {formatDateTime(order.created_at)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.payment_status} label={`Payment: ${capitalize(order.payment_status)}`} />
          </div>
        </div>
        <div className="mt-5">
          <StatusTimeline steps={STEPS} current={order.status} history={order.status_history} />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Item</th>
              <th className="text-right">Price</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id}>
                <td>
                  <p className="font-medium text-ink">{item.product_name}</p>
                  <p className="text-xs text-muted">{item.sku}</p>
                </td>
                <td className="text-right">{formatPrice(item.price)}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right font-semibold">{formatPrice(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="space-y-1.5 border-t border-line p-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{Number(order.shipping_fee) ? formatPrice(order.shipping_fee) : 'Free'}</dd></div>
          <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
        </dl>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5 text-sm">
          <h3 className="font-semibold text-ink">Delivery address</h3>
          <p className="mt-2 text-muted">
            {order.customer_name}<br />{order.address}<br />{order.city} – {order.pincode}<br />Phone: {order.phone}
          </p>
        </div>
        <div className="card p-5 text-sm">
          <h3 className="font-semibold text-ink">Payment</h3>
          <p className="mt-2 text-muted">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'} · {capitalize(order.payment_status)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={`/invoice/${order.id}`} className="btn btn-outline btn-sm">
              <FileText className="h-4 w-4" /> View invoice
            </Link>
            {order.status === 'pending' && (
              <button className="btn btn-sm border border-danger/30 text-danger hover:bg-danger-soft" onClick={cancel} disabled={cancelling}>
                {cancelling ? 'Cancelling…' : 'Cancel order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
