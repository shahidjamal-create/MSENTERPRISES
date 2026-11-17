import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { AdminHeader } from './AdminLayout';
import Modal from '../components/ui/Modal';
import { Checkbox, Field, Input, Select } from '../components/ui/Form';
import { Alert, EmptyState, ErrorState, PageLoader } from '../components/ui/Feedback';
import StatusBadge from '../components/ui/StatusBadge';
import { adminApi, opsApi, errorMessage } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { useToast } from '../context/ToastContext';
import { PRODUCT_TYPE_LABELS } from '../utils/constants';
import { formatDateTime, formatPrice } from '../utils/format';

const MOVEMENT_LABELS = { in: 'Stock in', out: 'Stock out', adjustment: 'Adjustment', sale: 'Sale', cancel_return: 'Cancelled order return' };

function MovementForm({ product, suppliers, onClose, onSaved }) {
  const [form, setForm] = useState({ movement_type: 'in', quantity: '', supplier_id: product.supplier_id || '', reference: '', note: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const qty = Number(form.quantity);
  const preview = form.quantity === '' ? null : form.movement_type === 'in' ? product.stock + qty : form.movement_type === 'out' ? product.stock - qty : qty;

  const save = async (e) => {
    e.preventDefault();
    if (form.quantity === '' || !Number.isInteger(qty) || qty < (form.movement_type === 'adjustment' ? 0 : 1)) return setError('Enter a valid whole number.');
    if (form.movement_type === 'out' && qty > product.stock) return setError(`Only ${product.stock} in stock.`);
    if (form.movement_type !== 'in' && !form.note.trim()) return setError('Please add a reason for this change.');
    setSaving(true);
    setError('');
    try {
      const res = await opsApi.post('inventory', { ...form, product_id: product.id });
      onSaved(res);
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={`Update stock — ${product.name}`}
      onClose={onClose}
      footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" form="movement-form" disabled={saving}>{saving ? 'Saving…' : 'Record'}</button></>}
    >
      <form id="movement-form" onSubmit={save} className="space-y-4" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <p className="text-sm text-muted">SKU {product.sku} · Current stock <strong className="text-ink">{product.stock}</strong></p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <Select value={form.movement_type} onChange={set('movement_type')}>
              <option value="in">Stock in (purchase / return)</option>
              <option value="out">Stock out (damage / loss / use)</option>
              <option value="adjustment">Adjustment (set counted stock)</option>
            </Select>
          </Field>
          <Field label={form.movement_type === 'adjustment' ? 'Counted stock' : 'Quantity'} hint={preview != null && preview >= 0 ? `New stock will be ${preview}` : undefined}>
            <Input type="number" min="0" value={form.quantity} onChange={set('quantity')} />
          </Field>
          {form.movement_type === 'in' && (
            <Field label="Supplier">
              <Select value={form.supplier_id} onChange={set('supplier_id')}>
                <option value="">None</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </Field>
          )}
          <Field label="Reference" hint="Invoice / bill number">
            <Input value={form.reference} onChange={set('reference')} maxLength={60} />
          </Field>
          <Field label={form.movement_type === 'in' ? 'Note' : 'Reason'} required={form.movement_type !== 'in'} className="sm:col-span-2">
            <Input value={form.note} onChange={set('note')} maxLength={300} />
          </Field>
        </div>
      </form>
    </Modal>
  );
}

function History({ productId }) {
  const { data, loading, error, reload } = useAsync(() => opsApi.list('movements', productId ? { product_id: productId } : {}), [productId]);
  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data.length) return <EmptyState title="No stock movements yet" />;
  return (
    <div className="card overflow-x-auto">
      <table className="table-base">
        <thead><tr><th>Date</th><th>Product</th><th>Type</th><th className="text-right">Change</th><th className="text-right">Stock after</th><th>Supplier / Ref</th><th>Note</th><th>By</th></tr></thead>
        <tbody>
          {data.map((m) => (
            <tr key={m.id}>
              <td className="whitespace-nowrap text-xs">{formatDateTime(m.created_at)}</td>
              <td className="min-w-[160px]">{m.products?.name || 'Deleted product'}<span className="block text-xs text-muted">{m.products?.sku}</span></td>
              <td className="whitespace-nowrap">{MOVEMENT_LABELS[m.movement_type] || m.movement_type}</td>
              <td className={`text-right font-semibold ${m.quantity < 0 ? 'text-danger' : 'text-success'}`}>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</td>
              <td className="text-right">{m.stock_after}</td>
              <td className="text-xs">{[m.suppliers?.name, m.reference].filter(Boolean).join(' · ') || '—'}</td>
              <td className="min-w-[140px] text-xs">{m.note || '—'}</td>
              <td className="text-xs text-muted">{m.created_by}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Inventory() {
  const toast = useToast();
  const [tab, setTab] = useState('stock');
  const [search, setSearch] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [historyProduct, setHistoryProduct] = useState('');
  const [selected, setSelected] = useState(null);
  const { data, loading, error, reload } = useAsync(() => opsApi.list('inventory'), []);
  const suppliers = useAsync(() => adminApi.list('suppliers'), []);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data || []).filter((p) => {
      if (lowOnly && p.stock > p.low_stock_threshold) return false;
      return !term || [p.name, p.sku].some((v) => String(v).toLowerCase().includes(term));
    });
  }, [data, search, lowOnly]);

  const totals = useMemo(() => {
    const list = data || [];
    return {
      units: list.reduce((s, p) => s + p.stock, 0),
      value: list.reduce((s, p) => s + p.stock * Number(p.price), 0),
      low: list.filter((p) => p.is_active && p.stock <= p.low_stock_threshold).length,
    };
  }, [data]);

  return (
    <>
      <AdminHeader title="Inventory" description="Record stock in/out, adjust counts and review the full stock history. Orders deduct stock automatically." />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="card p-4"><p className="text-xs text-muted">Units in stock</p><p className="text-lg font-bold">{totals.units}</p></div>
        <div className="card p-4"><p className="text-xs text-muted">Stock value (selling price)</p><p className="text-lg font-bold">{formatPrice(totals.value)}</p></div>
        <div className="card p-4"><p className="text-xs text-muted">Low-stock active products</p><p className="text-lg font-bold text-danger">{totals.low}</p></div>
      </div>
      <div className="mb-4 flex gap-1 border-b border-line">
        {[['stock', 'Stock levels'], ['history', 'Stock history']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${tab === key ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'}`}>{label}</button>
        ))}
      </div>

      {tab === 'stock' ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input className="pl-9" placeholder="Search name or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Checkbox label="Low stock only" checked={lowOnly} onChange={setLowOnly} />
          </div>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : rows.length === 0 ? (
            <EmptyState title="No products match" />
          ) : (
            <div className="card overflow-x-auto">
              <table className="table-base">
                <thead><tr><th>Product</th><th>Type</th><th>Supplier</th><th className="text-right">Stock</th><th className="text-right">Alert at</th><th>Level</th><th /></tr></thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id}>
                      <td className="min-w-[200px]">{p.name}<span className="block text-xs text-muted">{p.sku}{!p.is_active && ' · inactive'}</span></td>
                      <td className="whitespace-nowrap text-xs">{PRODUCT_TYPE_LABELS[p.product_type]}</td>
                      <td className="text-xs">{p.suppliers?.name || '—'}</td>
                      <td className="text-right font-semibold">{p.stock}</td>
                      <td className="text-right text-muted">{p.low_stock_threshold}</td>
                      <td>{p.stock === 0 ? <StatusBadge tone="red" label="Out of stock" /> : p.stock <= p.low_stock_threshold ? <StatusBadge tone="amber" label="Low" /> : <StatusBadge tone="green" label="OK" />}</td>
                      <td className="whitespace-nowrap text-right">
                        <button className="btn btn-outline btn-sm mr-1" onClick={() => { setHistoryProduct(String(p.id)); setTab('history'); }}>History</button>
                        <button className="btn btn-primary btn-sm" onClick={() => setSelected(p)}>Update</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <Select className="mb-4 w-full sm:w-80" value={historyProduct} onChange={(e) => setHistoryProduct(e.target.value)}>
            <option value="">All products (latest 300)</option>
            {(data || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <History productId={historyProduct} />
        </>
      )}

      {selected && (
        <MovementForm
          product={selected}
          suppliers={suppliers.data || []}
          onClose={() => setSelected(null)}
          onSaved={(res) => {
            toast(`Stock updated: ${res.before} → ${res.after}.`);
            setSelected(null);
            reload();
          }}
        />
      )}
    </>
  );
}
