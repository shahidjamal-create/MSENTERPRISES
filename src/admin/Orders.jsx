import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search } from 'lucide-react';
import { AdminHeader } from './AdminLayout';
import Modal from '../components/ui/Modal';
import { Field, Input, Select } from '../components/ui/Form';
import { Alert, EmptyState, ErrorState, PageLoader } from '../components/ui/Feedback';
import StatusBadge from '../components/ui/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import { opsApi, errorMessage } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { useToast } from '../context/ToastContext';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../utils/constants';
import { capitalize, formatDateTime, formatPrice } from '../utils/format';

function ManageOrder({ order, onClose, onSaved }) {
  const [form, setForm] = useState({ status: order.status, payment_status: order.payment_status, note: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const locked = ['completed', 'cancelled'].includes(order.status);

  const save = async () => {
    if (form.status === 'cancelled' && order.status !== 'cancelled' && !window.confirm('Cancel this order? Stock will be returned to inventory.')) return;
    setSaving(true);
    setError('');
    try {
      const res = await opsApi.update('orders', { id: order.id, ...form });
      onSaved(res.email_status);
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      size="lg"
      title={`Order ${order.order_number}`}
      onClose={onClose}
      footer={
        <>
          <Link to={`/invoice/${order.id}`} className="btn btn-outline mr-auto"><FileText className="h-4 w-4" /> Invoice</Link>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </>
      }
    >
      {error && <Alert tone="error" className="mb-4">{error}</Alert>}
      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-muted">Customer</p>
          <p className="font-medium">{order.customer_name}</p>
          <p>{order.phone} · <span className="break-all">{order.email}</span></p>
          <p className="mt-1 text-muted">{order.address}, {order.city} – {order.pincode}</p>
          {order.notes && <p className="mt-1"><span className="text-muted">Note:</span> {order.notes}</p>}
        </div>
        <div>
          <p className="text-muted">Placed</p>
          <p className="font-medium">{formatDateTime(order.created_at)}</p>
          <p className="mt-1 text-muted">Payment</p>
          <p className="font-medium">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}</p>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-line">
        <table className="table-base">
          <thead><tr><th>Item</th><th className="text-right">Qty</th><th className="text-right">Total</th></tr></thead>
          <tbody>
            {order.order_items.map((i) => (
              <tr key={i.id}><td>{i.product_name}<span className="block text-xs text-muted">{i.sku}</span></td><td className="text-right">{i.quantity}</td><td className="text-right">{formatPrice(i.line_total)}</td></tr>
            ))}
            <tr><td colSpan={2} className="text-right text-muted">Delivery</td><td className="text-right">{formatPrice(order.shipping_fee)}</td></tr>
            <tr><td colSpan={2} className="text-right font-semibold">Total</td><td className="text-right font-bold">{formatPrice(order.total)}</td></tr>
          </tbody>
        </table>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Field label="Order status" hint={locked ? `Order is ${order.status}; status is final.` : undefined}>
          <Select value={form.status} disabled={locked} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{capitalize(s)}</option>)}
          </Select>
        </Field>
        <Field label="Payment status">
          <Select value={form.payment_status} onChange={(e) => setForm({ ...form, payment_status: e.target.value })}>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{capitalize(s)}</option>)}
          </Select>
        </Field>
        <Field label="Status note">
          <Input value={form.note} maxLength={200} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </Field>
      </div>
      <div className="mt-5">
        <h3 className="mb-2 text-sm font-semibold">History</h3>
        <StatusTimeline steps={[]} current="" history={order.status_history || []} />
      </div>
    </Modal>
  );
}

export default function Orders() {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const { data, loading, error, reload } = useAsync(() => opsApi.list('orders', { status }), [status]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data || []).filter((o) => !term || [o.order_number, o.customer_name, o.phone, o.email].some((v) => String(v).toLowerCase().includes(term)));
  }, [data, search]);

  return (
    <>
      <AdminHeader title="Orders" description="Manage order status, payment and delivery. Cancelling returns stock to inventory." />
      <div className="mb-4 flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input className="pl-9 text-sm" placeholder="Order no, customer, phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select className="w-full sm:w-48 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{capitalize(s)}</option>)}
        </Select>
      </div>
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState title="No orders found" message="Orders placed on the website appear here." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Order</th><th>Customer</th><th className="text-right">Items</th><th className="text-right">Total</th><th>Payment</th><th>Status</th><th /></tr></thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td className="whitespace-nowrap"><span className="font-semibold">{o.order_number}</span><span className="block text-xs text-muted">{formatDateTime(o.created_at)}</span></td>
                  <td className="whitespace-nowrap">{o.customer_name}<span className="block text-xs text-muted">{o.phone}</span></td>
                  <td className="text-right">{o.order_items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className="whitespace-nowrap text-right font-semibold">{formatPrice(o.total)}</td>
                  <td><StatusBadge status={o.payment_status} label={`${o.payment_method.toUpperCase()} · ${capitalize(o.payment_status)}`} /></td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="text-right"><button className="btn btn-outline btn-sm" onClick={() => setSelected(o)}>Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selected && (
        <ManageOrder
          order={selected}
          onClose={() => setSelected(null)}
          onSaved={(emailStatus) => {
            toast(emailStatus ? `Order updated. Customer email: ${capitalize(emailStatus)}.` : 'Order updated.');
            setSelected(null);
            reload();
          }}
        />
      )}
    </>
  );
}
