import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ModelPicker, { useModels, useBrands } from '../components/ModelPicker';
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid';
import Pagination from '../components/ui/Pagination';
import { Checkbox, Field, Select } from '../components/ui/Form';
import { Alert, EmptyState, ErrorState } from '../components/ui/Feedback';
import { catalogApi } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { VARIANTS_BY_TYPE, TOP_10_MODELS } from '../utils/constants';

const SORTS = [
  ['newest', 'Newest first'],
  ['price_asc', 'Price: low to high'],
  ['price_desc', 'Price: high to low'],
  ['discount', 'Biggest discount'],
];

export default function Shop({ type = '', category = '', title, description, crumb }) {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filters = Object.fromEntries(params.entries());
  const brand = filters.brand || '';
  const model = filters.model || '';

  const activeCategory = category || filters.category || '';
  const activeType = type || filters.type || '';

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  const { data, loading, error, reload } = useAsync(
    () => catalogApi.products({ ...filters, type: activeType, category: activeCategory }),
    [type, category, params.toString()]
  );
  const { data: categories } = useAsync(() => catalogApi.categories(), []);
  const { brands } = useBrands();
  const { models } = useModels(brand);

  const variants = VARIANTS_BY_TYPE[activeType] || [];
  const categoryOptions = (categories || []).filter((c) => !activeType || c.kind === activeType);
  const selectedModel = TOP_10_MODELS.find((m) => String(m.id) === model) || models.find((m) => String(m.id) === model);
  const modelName = selectedModel?.name;
  const brandName = brands.find((b) => String(b.id) === (brand || selectedModel?.brand_id))?.name;
  const hasFilters = ['brand', 'model', 'variant', 'category', 'q', 'in_stock', 'type'].some((k) => filters[k]);

  const filterPanel = (
    <div className="space-y-5">
      <Field label="Your phone">
        <ModelPicker layout="stack" brandId={brand} modelId={model} onChange={({ brandId, modelId }) => update({ brand: brandId, model: modelId })} />
      </Field>
      {!type && (
        <Field label="Product type">
          <Select value={filters.type || ''} onChange={(e) => update({ type: e.target.value, variant: '', category: '' })}>
            <option value="">All types</option>
            <option value="tempered_glass">Tempered Glass</option>
            <option value="pouch">Mobile Pouches</option>
            <option value="accessory">Accessories & Power</option>
          </Select>
        </Field>
      )}
      {variants.length > 0 && (
        <Field label={activeType === 'pouch' ? 'Pouch type' : activeType === 'accessory' ? 'Accessory type' : 'Glass type'}>
          <Select value={filters.variant || ''} onChange={(e) => update({ variant: e.target.value })}>
            <option value="">All</option>
            {variants.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Select>
        </Field>
      )}
      {categoryOptions.length > 1 && (
        <Field label="Category">
          <Select value={filters.category || ''} onChange={(e) => update({ category: e.target.value })}>
            <option value="">All categories</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Checkbox label="In stock only" checked={filters.in_stock === '1'} onChange={(checked) => update({ in_stock: checked ? '1' : '' })} />
      {hasFilters && (
        <button className="btn btn-outline btn-sm w-full" onClick={() => setParams(new URLSearchParams())}>
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <PageHeader title={title} description={description} crumbs={[[crumb || title]]} />
      <div className="container-page grid gap-6 sm:gap-8 py-6 sm:py-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-36 rounded-2xl border border-slate-200/90 p-5 bg-white shadow-xs">{filterPanel}</div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                className="btn btn-outline btn-sm lg:hidden flex items-center gap-1.5 rounded-full"
                onClick={() => setFiltersOpen(true)}
                aria-expanded={filtersOpen}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#0071E3]" />
                <span>Filters</span>
                {hasFilters && <span className="h-2 w-2 rounded-full bg-[#0071E3]" />}
              </button>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">{loading ? 'Loading…' : `${data?.total ?? 0} products`}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-slate-400 font-medium">Sort:</span>
              <Select className="!w-auto text-xs sm:text-sm py-1.5 rounded-xl border-slate-200" value={filters.sort || 'newest'} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort products">
                {SORTS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {filtersOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4 lg:hidden" onClick={() => setFiltersOpen(false)}>
              <div
                className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-[#0071E3]" /> Filters
                  </h2>
                  <button onClick={() => setFiltersOpen(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close filters">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="overflow-y-auto p-6">{filterPanel}</div>
                <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-3.5 bg-slate-50 rounded-b-3xl">
                  {hasFilters && (
                    <button className="text-xs font-semibold text-rose-500 hover:underline" onClick={() => { setParams(new URLSearchParams()); setFiltersOpen(false); }}>
                      Reset filters
                    </button>
                  )}
                  <button className="btn btn-primary btn-sm ml-auto" onClick={() => setFiltersOpen(false)}>
                    Show {data?.total ?? 0} results
                  </button>
                </div>
              </div>
            </div>
          )}

          {filters.q && (
            <p className="mb-4 text-xs sm:text-sm text-slate-900">
              Search results for <strong>“{filters.q}”</strong>{' '}
              <button className="text-[#0071E3] hover:underline" onClick={() => update({ q: '' })}>
                clear
              </button>
            </p>
          )}

          {modelName && (
            <div className="mb-5 flex items-center justify-between gap-2 rounded-2xl border border-blue-200/90 bg-blue-50/70 px-4 py-3 text-xs font-semibold text-[#0071E3] shadow-xs">
              <span className="flex items-center gap-2">
                <span>📱</span>
                <span>Showing verified compatible accessories for: <strong className="text-slate-900">{modelName}</strong></span>
              </span>
              <button
                type="button"
                className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-rose-600 shadow-xs transition-colors"
                onClick={() => update({ model: '' })}
              >
                Clear model ×
              </button>
            </div>
          )}
          {model && modelName && (
            <Alert tone="info" className="mb-5 text-xs sm:text-sm">
              Showing products verified compatible with <strong>{brandName} {modelName}</strong>, plus universal accessories.
            </Alert>
          )}

          {loading && <ProductGridSkeleton count={6} />}
          {!loading && error && <ErrorState message={error} onRetry={reload} />}
          {!loading && !error && data?.items.length === 0 && (
            <EmptyState
              title={model ? 'No verified products for this model yet' : 'No products found'}
              message={model ? 'We only list items confirmed to fit your phone. Call or WhatsApp the store — we may have it in stock.' : 'Try removing some filters or searching for something else.'}
              action={hasFilters && <button className="btn btn-outline btn-sm" onClick={() => setParams(new URLSearchParams())}>Clear filters</button>}
            />
          )}
          {!loading && !error && data?.items.length > 0 && (
            <>
              <ProductGrid products={data.items} columns="xl:grid-cols-3 2xl:grid-cols-4" />
              <Pagination page={data.page} pages={data.pages} onChange={(page) => update({ page: String(page) })} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
