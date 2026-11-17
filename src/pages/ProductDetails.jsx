import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, Minus, Plus, ShieldCheck, ShoppingCart } from 'lucide-react';
import PageHeader, { SectionHeading } from '../components/PageHeader';
import ProductGrid from '../components/ProductGrid';
import { StockLabel } from '../components/ProductCard';
import { ErrorState, PageLoader } from '../components/ui/Feedback';
import { catalogApi } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';
import { PRODUCT_TYPE_LABELS } from '../utils/constants';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, toggleWishlist, inWishlist } = useCart();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const { data, loading, error, reload } = useAsync(() => catalogApi.product(slug), [slug]);

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorState message={error} onRetry={reload} />
        <div className="mt-6 text-center">
          <Link to="/shop" className="btn btn-outline">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const { product, compatible_brands: brands, related } = data;
  const maxQty = Math.min(product.stock, 20);
  const saved = inWishlist(product.id);
  const add = (thenCheckout) => {
    const result = addItem(product, quantity);
    toast(result.message, result.ok ? 'success' : 'error');
    if (thenCheckout && result.ok) navigate('/cart');
  };

  return (
    <>
      <PageHeader
        title={product.name}
        crumbs={[
          ['Shop', '/shop'],
          [product.category?.name || 'Product', product.product_type === 'tempered_glass' ? '/tempered-glass' : product.product_type === 'pouch' ? '/pouches' : '/accessories'],
          [product.name],
        ]}
      />
      <div className="container-page grid gap-8 py-8 md:grid-cols-2 lg:gap-14">
        {/* Apple-style Product Canvas Container */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-[#F6F7F9] p-4 sm:p-8 flex items-center justify-center shadow-xs">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="aspect-square w-full object-contain rounded-2xl transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-slate-400 font-medium">No image</div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0071E3]">
            {PRODUCT_TYPE_LABELS[product.product_type]} {product.variant_type && `· ${product.variant_type}`}
          </p>
          <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{product.name}</h2>
          <p className="mt-1 text-xs text-slate-400 font-medium">SKU: {product.sku}</p>
          {product.is_sample && (
            <p className="mt-2.5 inline-block rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
              Sample listing — details for demonstration
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatPrice(product.price)}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-base text-slate-400 line-through font-normal">MRP {formatPrice(product.mrp)}</span>
                <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white">{product.discount_percent}% off</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">Inclusive of all taxes · Express same-day shipping</p>
          <div className="mt-3.5">
            <StockLabel stock={product.stock} threshold={product.low_stock_threshold} />
          </div>

          {product.stock > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                <button
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-white transition-all disabled:opacity-40"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-slate-900" aria-live="polite">{quantity}</span>
                <button
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-white transition-all disabled:opacity-40"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95 flex-1 sm:flex-initial"
                onClick={() => add(false)}
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>

              <button
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] px-7 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-[#005bb5] active:scale-95 flex-1 sm:flex-initial"
                onClick={() => add(true)}
              >
                Buy Now
              </button>
            </div>
          )}

          <button
            onClick={() => toggleWishlist(product)}
            className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0071E3] transition-colors"
          >
            <Heart className={`h-4 w-4 ${saved ? 'fill-[#0071E3] text-[#0071E3]' : ''}`} />
            <span>{saved ? 'Saved to wishlist' : 'Add to wishlist'}</span>
          </button>

          {/* Compatibility Card */}
          <div className="mt-7 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Model Compatibility Guarantee
            </h3>
            {product.compatible_models.length > 0 ? (
              <div className="mt-3 space-y-2">
                {brands.map((b) => (
                  <div key={b.id} className="text-xs sm:text-sm">
                    <span className="font-bold text-slate-800">{b.name}: </span>
                    <span className="text-slate-500">
                      {product.compatible_models.filter((m) => m.brand_id === b.id).map((m) => m.name).join(', ')}
                    </span>
                  </div>
                ))}
                <p className="pt-2 text-[11px] text-slate-400 font-medium">100% verified fit by store technicians. Need confirmation? Reach us on WhatsApp.</p>
              </div>
            ) : (
              <p className="mt-2 text-xs sm:text-sm text-slate-500">{product.is_universal ? 'Universal accessory — verified to work with all standard phones.' : 'Check with store staff for custom model confirmation.'}</p>
            )}
          </div>

          {product.description && (
            <div className="mt-7">
              <h3 className="text-sm font-bold text-slate-900">Product Specifications</h3>
              <p className="mt-2 whitespace-pre-line text-xs sm:text-sm leading-relaxed text-slate-600">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-page mt-6">
          <SectionHeading title="Related products" />
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}
