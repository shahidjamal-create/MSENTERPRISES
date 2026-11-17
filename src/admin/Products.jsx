import { useMemo, useState } from 'react';
import { AlertTriangle, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { AdminHeader } from './AdminLayout';
import ProductForm from './ProductForm';
import { Input, Select } from '../components/ui/Form';
import { EmptyState, ErrorState, PageLoader } from '../components/ui/Feedback';
import { adminApi, errorMessage } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { useToast } from '../context/ToastContext';
import { PRODUCT_TYPE_LABELS } from '../utils/constants';
import { formatPrice } from '../utils/format';

const TITLES = {
  '': ['Products', 'All products across tempered glass, pouches and accessories.'],
  tempered_glass: ['Tempered Glass', 'Screen protectors. Assign verified models so they appear in the store.'],
  pouch: ['Pouches', 'Mobile covers and cases. Assign verified models so they appear in the store.'],
  accessory: ['Accessories', 'Chargers, cables, audio, power banks and more.'],
};

export default function Products({ productType = '' }) {
  const toast = useToast();
  const [title, description] = TITLES[productType];
  const products = useAsync(() => adminApi.list('products', productType ? { type: productType } : {}), [productType]);
  const lookups = useAsync(async () => {
    const [categories, brands, models, suppliers] = await Promise.all(['categories', 'brands', 'models', 'suppliers'].map((r) => adminApi.list(r)));
    return { categories, brands, models, suppliers };
  }, []);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | product

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (products.data || []).filter((p) => {
      if (typeFilter && p.product_type !== typeFilter) return false;
      if (statusFilter === 'active' && !p.is_active) return false;
      if (statusFilter === 'inactive' && p.is_active) return false;
      if (statusFilter === 'hidden' && !(p.product_type !== 'accessory' && p.compatible_models.length === 0)) return false;
      if (!term) return true;
      return [p.name, p.sku, p.variant_type, p.category?.name].some((v) => String(v || '').toLowerCase().includes(term));
    });
  }, [products.data, search, typeFilter, statusFilter]);

  const toggle = async (product, field) => {
    try {
      await adminApi.update('products', { id: product.id, toggle: field, value: !product[field] });
      products.reload();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? Its stock history will also be removed. Past orders keep the item name.`)) return;
    try {
      await adminApi.remove('products', product.id);
      toast('Product deleted.');
      products.reload();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  return (
    <>
      <AdminHeader
        title={title}
        description={description}
        actions={<button className="btn btn-primary btn-sm" onClick={() => setEditing('new')} disabled={!lookups.data}><Plus className="h-4 w-4" /> Add product</button>}
      />
      <div className="mb-4 flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input className="pl-9 text-sm" placeholder="Search name, SKU, type…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {!productType && (
          <Select className="w-full sm:w-48 text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            {Object.entries(PRODUCT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        )}
        <Select className="w-full sm:w-56 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="hidden">Hidden — no verified models</option>
        </Select>
      </div>
      {lookups.error && <ErrorState message={lookups.error} onRetry={lookups.reload} />}

      {products.loading ? (
        <PageLoader />
      ) : products.error ? (
        <ErrorState message={products.error} onRetry={products.reload} />
      ) : rows.length === 0 ? (
        <EmptyState title="No products found" message={search || statusFilter ? 'Try different filters.' : 'Add your first product.'} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th className="text-right">Price</th>
                <th className="text-right">Stock</th>
                <th>Compatibility</th>
                <th>Active</th>
                <th>Featured</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const hidden = p.product_type !== 'accessory' && p.compatible_models.length === 0;
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="flex min-w-[220px] items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-surface">{p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}</div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-medium text-ink">{p.name}</p>
                          <p className="text-xs text-muted">{p.sku}{p.is_sample && <span className="ml-2 rounded bg-warning-soft px-1.5 text-[10px] font-semibold uppercase text-warning">Sample</span>}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-xs">{PRODUCT_TYPE_LABELS[p.product_type]}<span className="block text-muted">{p.variant_type || p.category?.name}</span></td>
                    <td className="whitespace-nowrap text-right">{formatPrice(p.price)}<span className="block text-xs text-muted line-through">{p.mrp > p.price ? formatPrice(p.mrp) : ''}</span></td>
                    <td className={`text-right font-semibold ${p.stock <= p.low_stock_threshold ? 'text-danger' : ''}`}>{p.stock}</td>
                    <td className="whitespace-nowrap text-xs">
                      {hidden ? (
                        <span className="flex items-center gap-1 text-warning"><AlertTriangle className="h-3.5 w-3.5" /> Hidden — none verified</span>
                      ) : p.compatible_models.length ? (
                        `${p.compatible_models.length} model${p.compatible_models.length > 1 ? 's' : ''}`
                      ) : p.is_universal ? 'Universal' : '—'}
                    </td>
                    <td>
                      <button onClick={() => toggle(p, 'is_active')} className={`relative h-5 w-9 rounded-full transition-colors ${p.is_active ? 'bg-success' : 'bg-line'}`} aria-label="Toggle active" aria-pressed={p.is_active}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${p.is_active ? 'left-[18px]' : 'left-0.5'}`} />
                      </button>
                    </td>
                    <td>
                      <button onClick={() => toggle(p, 'is_featured')} aria-label="Toggle featured" aria-pressed={p.is_featured}>
                        <Star className={`h-4 w-4 ${p.is_featured ? 'fill-amber-400 text-amber-400' : 'text-line'}`} />
                      </button>
                    </td>
                    <td className="whitespace-nowrap text-right">
                      <button className="rounded p-1.5 text-muted hover:bg-surface hover:text-brand disabled:opacity-40" onClick={() => setEditing(p)} disabled={!lookups.data} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                      <button className="rounded p-1.5 text-muted hover:bg-danger-soft hover:text-danger" onClick={() => remove(p)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && lookups.data && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          fixedType={productType}
          lookups={lookups.data}
          onClose={() => setEditing(null)}
          onSaved={() => {
            toast('Product saved.');
            setEditing(null);
            products.reload();
          }}
        />
      )}
    </>
  );
}
