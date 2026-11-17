import { useState } from 'react';
import { Download } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AdminHeader } from './AdminLayout';
import { Field, Input } from '../components/ui/Form';
import { ErrorState, PageLoader } from '../components/ui/Feedback';
import { adminApi } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { capitalize, downloadCsv, formatDate, formatPrice, todayISO } from '../utils/format';

function ChartCard({ title, children, empty }) {
  return (
    <section className="card p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <div className="h-60">{empty ? <div className="flex h-full items-center justify-center text-sm text-muted">No data for this period.</div> : children}</div>
    </section>
  );
}

export default function Reports() {
  const [range, setRange] = useState({ from: todayISO(-29), to: todayISO() });
  const { data, loading, error, reload } = useAsync(() => adminApi.list('reports', range), [range.from, range.to]);

  const exportOrders = () =>
    downloadCsv(
      `orders-${range.from}-to-${range.to}.csv`,
      data.orders.map((o) => ({ order: o.order_number, date: formatDate(o.created_at), customer: o.customer_name, items: o.items, total: o.total, status: o.status, payment: o.payment_status }))
    );

  return (
    <>
      <AdminHeader
        title="Reports"
        description="Sales, repairs and inventory for the selected period."
        actions={data?.orders?.length > 0 && <button className="btn btn-outline btn-sm" onClick={exportOrders}><Download className="h-4 w-4" /> Export orders CSV</button>}
      />
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <Field label="From" className="flex-1 sm:max-w-xs"><Input type="date" value={range.from} max={range.to} onChange={(e) => e.target.value && setRange({ ...range, from: e.target.value })} /></Field>
        <Field label="To" className="flex-1 sm:max-w-xs"><Input type="date" value={range.to} min={range.from} max={todayISO()} onChange={(e) => e.target.value && setRange({ ...range, to: e.target.value })} /></Field>
      </div>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-6">
            {[
              ['Revenue', formatPrice(data.summary.revenue)],
              ['Orders', `${data.summary.orders} (${data.summary.cancelled} cancelled)`],
              ['Average order', formatPrice(data.summary.average_order)],
              ['Repair bookings', data.summary.bookings],
              ['Units in stock', data.summary.units_in_stock],
              ['Stock value', formatPrice(data.summary.stock_value)],
            ].map(([label, value]) => (
              <div key={label} className="card p-4"><p className="text-xs text-muted">{label}</p><p className="text-lg font-bold">{value}</p></div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <ChartCard title="Daily revenue" empty={!data.series.some((d) => d.revenue > 0)}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.series.map((d) => ({ ...d, label: d.date.slice(5) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={50} />
                  <Tooltip formatter={(v) => formatPrice(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="#1677FF" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Orders by status" empty={!data.orders_by_status.length}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.orders_by_status.map((d) => ({ ...d, name: capitalize(d.name) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={30} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10243A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Repair bookings by service" empty={!data.bookings_by_service.length}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.bookings_by_service} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1677FF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <section className="card overflow-hidden">
              <h2 className="border-b border-line p-4 text-sm font-semibold">Top-selling products</h2>
              {data.top_products.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted">No sales in this period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table-base">
                    <thead><tr><th>Product</th><th className="text-right">Units</th><th className="text-right">Revenue</th></tr></thead>
                    <tbody>{data.top_products.map((p) => <tr key={p.name}><td>{p.name}</td><td className="text-right">{p.quantity}</td><td className="text-right">{formatPrice(p.revenue)}</td></tr>)}</tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
