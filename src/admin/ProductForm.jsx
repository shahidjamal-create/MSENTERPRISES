import { useMemo, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { Checkbox, Field, Input, Select, Textarea } from '../components/ui/Form';
import { Alert, Spinner } from '../components/ui/Feedback';
import { adminApi, errorMessage, uploadImage } from '../services/api';
import { PRODUCT_TYPE_LABELS, VARIANTS_BY_TYPE } from '../utils/constants';

const EMPTY = {
  name: '', product_type: 'tempered_glass', category_id: '', brand_id: '', variant_type: '', sku: '', mrp: '', price: '',
  stock: 0, low_stock_threshold: 5, supplier_id: '', image_url: '', description: '', is_active: true, is_featured: false,
  is_universal: false, model_ids: [],
};

const TOP_10_IDS = [101, 105, 106, 201, 205, 203, 301, 303, 401, 501];

function CompatibilityEditor({ models, brands, selected, onChange }) {
  const [brandId, setBrandId] = useState('');
  const [term, setTerm] = useState('');
  const selectedSet = new Set(selected);
  const visible = models.filter((m) => (!brandId || String(m.brand_id) === brandId) && m.name.toLowerCase().includes(term.toLowerCase()));
  const toggle = (id) => onChange(selectedSet.has(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  const byId = new Map(models.map((m) => [m.id, m]));

  const selectTop10 = () => {
    const availableTop10 = models.filter((m) => TOP_10_IDS.includes(m.id)).map((m) => m.id);
    const combined = Array.from(new Set([...selected, ...(availableTop10.length ? availableTop10 : models.slice(0, 10).map((m) => m.id))]));
    onChange(combined);
  };

  const top10List = models.filter((m) => TOP_10_IDS.includes(m.id)).slice(0, 10);
  const displayTop10 = top10List.length >= 10 ? top10List : models.slice(0, 10);

  return (
    <div className="rounded-lg border border-line p-3">
      {/* 10 Model Spaces Quick Bar */}
      <div className="mb-3 rounded-lg border border-brand/20 bg-brand-soft/40 p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-navy flex items-center gap-1.5">
            📱 10 Model Spaces (Quick Assignment)
          </span>
          <button
            type="button"
            onClick={selectTop10}
            className="rounded bg-brand px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-brand/90 transition-colors"
          >
            + Add All 10 Top Models
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {displayTop10.map((m, idx) => {
            const isChecked = selectedSet.has(m.id);
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => toggle(m.id)}
                className={`flex items-center gap-1 rounded border px-2 py-1 text-[11px] transition-colors text-left ${
                  isChecked
                    ? 'border-brand bg-brand text-white font-semibold'
                    : 'border-line bg-white text-ink hover:border-brand/60'
                }`}
              >
                <span className="opacity-70 text-[10px]">#{idx + 1}</span>
                <span className="truncate">{m.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selected.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {selected.map((id) => (
            <span key={id} className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">
              {byId.get(id)?.mobile_brands?.name} {byId.get(id)?.name}
              <button type="button" onClick={() => toggle(id)} aria-label="Remove"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-xs text-muted">No models selected yet. Click the 10 model spaces above or search below.</p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <Select value={brandId} onChange={(e) => setBrandId(e.target.value)} aria-label="Filter by brand">
          <option value="">All brands</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
        <Input placeholder="Search models…" value={term} onChange={(e) => setTerm(e.target.value)} />
      </div>
      <div className="mt-2 max-h-44 overflow-y-auto rounded border border-line">
        {visible.length === 0 ? (
          <p className="p-3 text-xs text-muted">No models match. Add models under Admin → Models.</p>
        ) : (
          visible.map((m) => (
            <label key={m.id} className="flex cursor-pointer items-center gap-2 border-b border-line px-3 py-1.5 text-sm last:border-0 hover:bg-surface">
              <input type="checkbox" className="accent-brand" checked={selectedSet.has(m.id)} onChange={() => toggle(m.id)} />
              <span className="text-muted">{m.mobile_brands?.name}</span> {m.name}
            </label>
          ))
        )}
      </div>
    </div>
  );
}

export default function ProductForm({ product, fixedType, lookups, onClose, onSaved }) {
  const [form, setForm] = useState(() => (product ? { ...EMPTY, ...product, brand_id: product.brand_id || '', supplier_id: product.supplier_id || '' } : { ...EMPTY, product_type: fixedType || EMPTY.product_type }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const type = form.product_type;
  const needsCompat = type !== 'accessory';
  const categories = lookups.categories.filter((c) => c.kind === type);
  const variants = VARIANTS_BY_TYPE[type];
  const discount = useMemo(() => {
    const mrp = Number(form.mrp);
    const price = Number(form.price);
    return mrp > 0 && price > 0 && price <= mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
  }, [form.mrp, form.price]);

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setFormError('');
    try {
      set('image_url', await uploadImage(file));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 3) next.name = 'Name must be at least 3 characters.';
    if (!form.category_id) next.category_id = 'Choose a category.';
    if (form.sku.trim().length < 3) next.sku = 'SKU must be at least 3 characters.';
    if (!(Number(form.mrp) > 0)) next.mrp = 'Enter MRP.';
    if (!(Number(form.price) > 0)) next.price = 'Enter selling price.';
    if (Number(form.price) > Number(form.mrp)) next.price = 'Selling price cannot exceed MRP.';
    if (!product && (form.stock === '' || Number(form.stock) < 0 || !Number.isInteger(Number(form.stock)))) next.stock = 'Enter a whole number.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setFormError('');
    try {
      if (product) await adminApi.update('products', { ...form, id: product.id });
      else await adminApi.create('products', form);
      onSaved();
    } catch (err) {
      setFormError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      size="lg"
      title={product ? `Edit: ${product.name}` : `Add ${PRODUCT_TYPE_LABELS[type]}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" form="product-form" disabled={saving || uploading}>{saving ? 'Saving…' : 'Save product'}</button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} noValidate className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product name" required error={errors.name} className="sm:col-span-2">
            <Input value={form.name} error={errors.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Product type" required>
            <Select value={type} disabled={!!fixedType || !!product} onChange={(e) => setForm((f) => ({ ...f, product_type: e.target.value, category_id: '', variant_type: '', is_universal: false }))}>
              {Object.entries(PRODUCT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <Field label="Category" required error={errors.category_id}>
            <Select value={form.category_id} error={errors.category_id} onChange={(e) => set('category_id', e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label={type === 'tempered_glass' ? 'Glass type' : type === 'pouch' ? 'Pouch type' : 'Variant / spec'}>
            {variants.length ? (
              <Select value={form.variant_type} onChange={(e) => set('variant_type', e.target.value)}>
                <option value="">Select type</option>
                {variants.map((v) => <option key={v}>{v}</option>)}
              </Select>
            ) : (
              <Input value={form.variant_type} onChange={(e) => set('variant_type', e.target.value)} placeholder="e.g. 20W Type-C" />
            )}
          </Field>
          <Field label={needsCompat ? 'Phone brand' : 'Brand (optional)'}>
            <Select value={form.brand_id} onChange={(e) => set('brand_id', e.target.value)}>
              <option value="">None</option>
              {lookups.brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </Field>
          <Field label="SKU" required error={errors.sku}>
            <Input value={form.sku} error={errors.sku} onChange={(e) => set('sku', e.target.value.toUpperCase())} />
          </Field>
          <Field label="Supplier">
            <Select value={form.supplier_id} onChange={(e) => set('supplier_id', e.target.value)}>
              <option value="">None</option>
              {lookups.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="MRP (₹)" required error={errors.mrp}>
            <Input type="number" min="1" value={form.mrp} error={errors.mrp} onChange={(e) => set('mrp', e.target.value)} />
          </Field>
          <Field label="Selling price (₹)" required error={errors.price} hint={discount ? `${discount}% discount` : undefined}>
            <Input type="number" min="1" value={form.price} error={errors.price} onChange={(e) => set('price', e.target.value)} />
          </Field>
          {!product ? (
            <Field label="Opening stock" required error={errors.stock} hint="Later changes go through Inventory.">
              <Input type="number" min="0" value={form.stock} error={errors.stock} onChange={(e) => set('stock', e.target.value)} />
            </Field>
          ) : (
            <Field label="Current stock" hint="Use Inventory to record stock changes.">
              <Input value={product.stock} disabled />
            </Field>
          )}
          <Field label="Low-stock alert at">
            <Input type="number" min="0" value={form.low_stock_threshold} onChange={(e) => set('low_stock_threshold', e.target.value)} />
          </Field>
        </div>

        <Field label="Product image">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface">
              {uploading ? <Spinner /> : form.image_url ? <img src={form.image_url} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-muted" />}
            </div>
            <div className="space-y-2">
              <label className="btn btn-outline btn-sm cursor-pointer">
                Upload image
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onImage} />
              </label>
              {form.image_url && <button type="button" className="block text-xs text-danger hover:underline" onClick={() => set('image_url', '')}>Remove image</button>}
              <p className="text-xs text-muted">JPG, PNG or WEBP. Resized automatically.</p>
            </div>
          </div>
        </Field>

        <Field label="Description">
          <Textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </Field>

        {needsCompat ? (
          <Field label="Compatible models (verified)" hint="Glass and pouches stay hidden from the store until at least one verified model is assigned.">
            <CompatibilityEditor models={lookups.models} brands={lookups.brands} selected={form.model_ids.map(Number)} onChange={(ids) => set('model_ids', ids)} />
          </Field>
        ) : (
          <div className="space-y-3">
            <Checkbox label="Universal accessory (works with most phones)" checked={form.is_universal} onChange={(v) => set('is_universal', v)} />
            {!form.is_universal && (
              <Field label="Compatible models (optional)">
                <CompatibilityEditor models={lookups.models} brands={lookups.brands} selected={form.model_ids.map(Number)} onChange={(ids) => set('model_ids', ids)} />
              </Field>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-6">
          <Checkbox label="Active (visible in store)" checked={form.is_active} onChange={(v) => set('is_active', v)} />
          <Checkbox label="Featured on homepage" checked={form.is_featured} onChange={(v) => set('is_featured', v)} />
        </div>
      </form>
    </Modal>
  );
}
