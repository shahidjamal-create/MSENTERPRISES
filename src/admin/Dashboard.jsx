import { Link } from 'react-router-dom';
import { AlertTriangle, Boxes, ClipboardList, IndianRupee, Package, ShoppingBag, Users, Wrench } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AdminHeader } from './AdminLayout';
import { adminApi } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { Alert, ErrorState, PageLoader } from '../components/ui/Feedback';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatPrice } from '../utils/format';

function Stat({ icon: Icon, label, value, tone = 'text-brand bg-brand-soft', to }) {
  const body = (
    <div className="card flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 transition-colors hover:border-brand">
      <span className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] sm:text-xs text-muted">{label}</p>
        <p className="text-base sm:text-lg font-bold text-ink truncate">{value}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

function Panel({ title, link, children }) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {link && <Link to={link} className="text-xs font-semibold text-brand hover:underline">View all</Link>}
      </div>
      {children}
    </section>
  );
}

const Empty = ({ children }) => <p className="px-4 py-8 text-center text-sm text-muted">{children}</p>;

export default function Dashboard() {
  const { can } = useAuth();
  const { data, loading, error, reload } = useAsync(() => adminApi.list('dashboard'), []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const t = data.totals;
  const chart = data.sales.map((d) => ({ ...d, label: d.date.slice(5) }));
  const hasSales = chart.some((d) => d.revenue > 0);

  return (
    <>
      <AdminHeader title="Dashboard" description="Live totals from the store database." />
      {t.sample_products > 0 && (
        <Alert tone="warning" className="mb-5" title={`${t.sample_products} sample products are in the catalogue`}>
          These were added during development and are marked “Sample listing” on the store. Edit or delete them before launch.
        </Alert>
      )}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <Stat icon={IndianRupee} label="Revenue (excl. cancelled)" value={formatPrice(t.revenue)} to={can('reports') ? '/admin/reports' : undefined} />
        <Stat icon={ShoppingBag} label="Orders" value={t.orders} to={can('orders') ? '/admin/orders' : undefined} />
        <Stat icon={Package} label="Products" value={t.products} to={can('products') ? '/admin/products' : undefined} />
        <Stat icon={Users} label="Customers" value={t.customers} to={can('customers') ? '/admin/customers' : undefined} />
        <Stat icon={ClipboardList} label="Repair bookings" value={t.bookings} to={can('bookings') ? '/admin/bookings' : undefined} />
        <Stat icon={Wrench} label="Pending repairs" value={t.pending_repairs} tone="text-warning bg-warning-soft" to={can('bookings') ? '/admin/bookings' : undefined} />
        <Stat icon={Boxes} label="Low-stock products" value={t.low_stock} tone="text-danger bg-danger-soft" to={can('inventory') ? '/admin/inventory' : undefined} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Sales — last 14 days">
          <div className="h-64 p-3">
            {hasSales ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ left: 0, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={50} />
                  <Tooltip formatter={(v) => formatPrice(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="#1677FF" fill="#E8F1FF" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">No sales recorded in the last 14 days.</div>
            )}
          </div>
        </Panel>
        <Panel title="Stock alerts" link={can('inventory') ? '/admin/inventory' : null}>
          {data.stock_alerts.length === 0 ? (
            <Empty>All active products are above their low-stock level.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {data.stock_alerts.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <AlertTriangle className={`h-4 w-4 shrink-0 ${p.stock === 0 ? 'text-danger' : 'text-warning'}`} />
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <span className={`font-semibold ${p.stock === 0 ? 'text-danger' : 'text-warning'}`}>{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Recent orders" link={can('orders') ? '/admin/orders' : null}>
          {data.recent_orders.length === 0 ? (
            <Empty>No orders yet.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {data.recent_orders.map((o) => (
                <li key={o.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{o.order_number}</p>
                    <p className="truncate text-xs text-muted">{o.customer_name} · {formatDate(o.created_at)}</p>
                  </div>
                  <span className="font-semibold">{formatPrice(o.total)}</span>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Recent repair bookings" link={can('bookings') ? '/admin/bookings' : null}>
          {data.recent_bookings.length === 0 ? (
            <Empty>No bookings yet.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {data.recent_bookings.map((b) => (
                <li key={b.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{b.booking_code} · {b.customer_name}</p>
                    <p className="truncate text-xs text-muted">{b.brand_name} {b.model_name} · {b.service_name}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Latest enquiries" link={can('enquiries') ? '/admin/enquiries' : null}>
          {data.enquiries.length === 0 ? (
            <Empty>No enquiries yet.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {data.enquiries.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{e.subject}</p>
                    <p className="truncate text-xs text-muted">{e.name} · {formatDate(e.created_at)}</p>
                  </div>
                  <StatusBadge status={e.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
