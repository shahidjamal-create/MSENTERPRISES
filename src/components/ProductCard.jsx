import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';

export function compatibilityText(product) {
  const models = product.compatible_models || [];
  if (models.length >= 10) {
    const top2 = models.slice(0, 2).map((m) => m.name).join(', ');
    return `Fits 10 Models: ${top2} +8 more`;
  }
  if (models.length > 0) {
    const names = models.slice(0, 2).map((m) => m.name).join(', ');
    return `Fits ${names}${models.length > 2 ? ` +${models.length - 2} more` : ''}`;
  }
  if (product.is_universal) return 'Universal — works with most phones';
  return '';
}

export function StockLabel({ stock, threshold = 5 }) {
  if (stock <= 0) return <span className="text-[11px] sm:text-xs font-semibold text-danger">Out of stock</span>;
  if (stock <= threshold) return <span className="text-[11px] sm:text-xs font-semibold text-warning">Only {stock} left</span>;
  return <span className="text-[11px] sm:text-xs font-semibold text-success">In stock</span>;
}

export default function ProductCard({ product }) {
  const { addItem, toggleWishlist, inWishlist } = useCart();
  const toast = useToast();
  const saved = inWishlist(product.id);
  const fits = compatibilityText(product);

  const handleAdd = () => {
    const result = addItem(product, 1);
    toast(result.message, result.ok ? 'success' : 'error');
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_16px_36px_-8px_rgba(15,23,42,0.08)]">
      {/* Product Image Canvas */}
      <div className="relative aspect-square overflow-hidden bg-[#F6F7F9]">
        <Link to={`/product/${product.slug}`} aria-label={product.name} className="block h-full w-full">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/products/case-armor.jpg';
              }}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs sm:text-sm text-slate-400 font-medium">No image</div>
          )}
        </Link>

        {/* Discount Badge */}
        {product.discount_percent > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-slate-900/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
            {product.discount_percent}% OFF
          </span>
        )}

        {/* Wishlist Glass Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute right-2.5 top-2.5 rounded-full bg-white/90 backdrop-blur-md p-2 shadow-sm transition-transform active:scale-90 hover:bg-white hover:text-[#0071E3]"
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={saved}
        >
          <Heart className={`h-3.5 w-3.5 transition-colors ${saved ? 'fill-[#0071E3] text-[#0071E3]' : 'text-slate-500'}`} />
        </button>
      </div>

      {/* Content Container */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {/* Category & Variant Tag */}
        <p className="truncate text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
          {[product.category?.name, product.variant_type].filter(Boolean).join(' · ')}
        </p>

        {/* Title */}
        <Link
          to={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 text-xs sm:text-[13.5px] font-bold leading-snug text-slate-900 group-hover:text-[#0071E3] transition-colors"
        >
          {product.name}
        </Link>

        {/* Compatibility Pill */}
        {fits && (
          <p className="mt-1.5 inline-block line-clamp-1 rounded-md bg-slate-100/80 px-2 py-0.5 text-[10.5px] font-medium text-slate-600">
            {fits}
          </p>
        )}

        {/* Bottom Actions & Price */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-slate-400 line-through font-normal">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex items-center justify-between">
            <StockLabel stock={product.stock} threshold={product.low_stock_threshold} />
            {product.is_sample && (
              <span className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-400">
                Sample
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-slate-900 py-2 px-3 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#0071E3] active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-xs"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="truncate">{product.stock > 0 ? 'Add to Cart' : 'Unavailable'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
