import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { orderApi } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { ErrorState, PageLoader } from '../components/ui/Feedback';
import { LogoMark } from '../components/Logo';
import { BUSINESS } from '../utils/constants';
import { capitalize, formatDate, formatPriceExact } from '../utils/format';

export default function Invoice() {
  const { id } = useParams();
  const { data: order, loading, error, reload } = useAsync(() => orderApi.get(id), [id]);

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-6 print:bg-white print:py-0">
      <div className="no-print container-page mb-4 flex max-w-3xl justify-between">
        <button onClick={() => window.history.back()} className="btn btn-outline btn-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button onClick={() => window.print()} className="btn btn-primary btn-sm">
          <Printer className="h-4 w-4" /> Print / Save PDF
        </button>
      </div>
      <article className="mx-auto max-w-3xl bg-white p-4 sm:p-10 print:p-0 rounded-xl sm:rounded-2xl border border-line sm:border-line">
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 border-b border-line pb-6">
          <div className="flex items-center gap-3">
            <LogoMark className="h-10 w-10 sm:h-11 sm:w-11 shrink-0" />
            <div>
              <p className="text-base sm:text-lg font-extrabold text-navy">MS ENTERPRISES</p>
              <p className="text-xs text-muted">{BUSINESS.phone} · {BUSINESS.email}</p>
            </div>
          </div>
          <div className="sm:text-right text-xs sm:text-sm">
            <p className="text-lg sm:text-xl font-bold text-ink">INVOICE</p>
            <p className="text-muted">{order.order_number}</p>
            <p className="text-muted">Date: {formatDate(order.created_at)}</p>
          </div>
        </header>
        <section className="grid gap-6 py-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-muted">Bill to</p>
            <p className="mt-1 font-semibold text-ink">{order.customer_name}</p>
            <p className="text-muted">{order.address}, {order.city} – {order.pincode}</p>
            <p className="text-muted">{order.phone} · {order.email}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase text-muted">Payment</p>
            <p className="mt-1 text-ink">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}</p>
            <p className="text-muted">Status: {capitalize(order.payment_status)}</p>
            <p className="text-muted">Order: {capitalize(order.status)}</p>
          </div>
        </section>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>#</th><th>Item</th><th className="text-right">Rate</th><th className="text-right">Qty</th><th className="text-right">Amount</th></tr>
            </thead>
            <tbody>
              {order.order_items.map((item, i) => (
                <tr key={item.id}>
                  <td>{i + 1}</td>
                  <td>{item.product_name}<span className="block text-xs text-muted">{item.sku}</span></td>
                  <td className="text-right">{formatPriceExact(item.price)}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{formatPriceExact(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="ml-auto mt-4 max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPriceExact(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{formatPriceExact(order.shipping_fee)}</dd></div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>Total</dt><dd>{formatPriceExact(order.total)}</dd></div>
        </dl>
        <p className="mt-10 border-t border-line pt-4 text-center text-xs text-muted">Thank you for shopping with MS ENTERPRISES. This is a computer-generated invoice.</p>
      </article>
      <p className="no-print mt-4 text-center text-sm">
        <Link to="/" className="text-brand hover:underline">Return to store</Link>
      </p>
    </div>
  );
}
