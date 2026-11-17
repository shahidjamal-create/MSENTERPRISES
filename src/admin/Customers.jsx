import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { AdminHeader } from './AdminLayout';
import { Input } from '../components/ui/Form';
import { EmptyState, ErrorState, PageLoader } from '../components/ui/Feedback';
import StatusBadge from '../components/ui/StatusBadge';
import { adminApi, errorMessage } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { useToast } from '../context/ToastContext';
import { formatDate, formatPrice } from '../utils/format';

export default function Customers() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const { data, loading, error, reload } = useAsync(() => adminApi.list('customers'), []);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data || []).filter((c) => !term || [c.full_name, c.email, c.phone, c.city].some((v) => String(v || '').toLowerCase().includes(term)));
  }, [data, search]);

  const toggle = async (customer) => {
    const action = customer.is_active ? 'Disable' : 'Enable';
    if (!window.confirm(`${action} ${customer.email}? Disabled customers cannot log in or place orders.`)) return;
    try {
      await adminApi.update('customers', { id: customer.id, is_active: !customer.is_active });
      toast(`Customer ${customer.is_active ? 'disabled' : 'enabled'}.`);
      reload();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  return (
    <>
      <AdminHeader title="Customers" description="Registered customer accounts with their order totals." />
      <div className="relative mb-4 w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input className="pl-9" placeholder="Name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState title="No customers yet" message="Customers appear here after they register on the website." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Customer</th><th>Phone</th><th>City</th><th className="text-right">Orders</th><th className="text-right">Spent</th><th>Joined</th><th>Status</th><th /></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="min-w-[180px]">{c.full_name || '—'}<span className="block break-all text-xs text-muted">{c.email}</span></td>
                  <td className="whitespace-nowrap">{c.phone || '—'}</td>
                  <td>{c.city || '—'}</td>
                  <td className="text-right">{c.order_count}</td>
                  <td className="whitespace-nowrap text-right">{formatPrice(c.total_spent)}</td>
                  <td className="whitespace-nowrap">{formatDate(c.created_at)}</td>
                  <td><StatusBadge status={c.is_active ? 'active' : 'inactive'} label={c.is_active ? 'Active' : 'Disabled'} /></td>
                  <td className="text-right"><button className="btn btn-outline btn-sm" onClick={() => toggle(c)}>{c.is_active ? 'Disable' : 'Enable'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
