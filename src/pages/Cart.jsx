import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { EmptyState } from '../components/ui/Feedback';
import { useCart } from '../context/CartContext';
import { usePublicSettings, shippingFor } from '../hooks/usePublicSettings';
import { formatPrice } from '../utils/format';

export function OrderSummary({ subtotal, settings, children }) {
  const shipping = shippingFor(subtotal, settings);
  const freeAbove = settings?.store?.free_shipping_above;
  return (
    <div className="card p-5">
      <h2 className="font-semibold text-ink">Order summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Delivery</dt>
          <dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
          <dt>Total</dt>
          <dd>{formatPrice(subtotal + shipping)}</dd>
        </div>
      </dl>
      {freeAbove > 0 && shipping > 0 && <p className="mt-3 text-xs text-muted">Free delivery on orders above {formatPrice(freeAbove)}.</p>}
      {children}
    </div>
  );
}

export default function Cart() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const settings = usePublicSettings();

  return (
    <>
      <PageHeader title="Shopping Cart" crumbs={[['Cart']]} />
      <div className="container-page py-8">
        {items.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Your cart is empty" message="Find tempered glass, pouches and accessories for your phone." action={<Link to="/shop" className="btn btn-primary">Start shopping</Link>} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <ul className="card divide-y divide-line">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 sm:gap-4 p-3 sm:p-4">
                  <Link to={`/product/${item.slug}`} className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg bg-surface">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted">No img</div>
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <Link to={`/product/${item.slug}`} className="line-clamp-2 text-xs sm:text-sm font-semibold text-ink hover:text-brand">
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs sm:text-sm text-muted">{formatPrice(item.price)} each</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:gap-4 sm:justify-end">
                      <div className="flex items-center rounded-lg border border-line bg-surface/40">
                        <button className="p-1.5 sm:p-2 text-muted hover:text-ink disabled:opacity-40" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Decrease">
                          <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                        <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-semibold">{item.quantity}</span>
                        <button className="p-1.5 sm:p-2 text-muted hover:text-ink disabled:opacity-40" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= Math.min(item.stock || 20, 20)} aria-label="Increase">
                          <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                      </div>
                      <span className="w-16 sm:w-20 text-right text-xs sm:text-sm font-bold text-ink">{formatPrice(item.price * item.quantity)}</span>
                      <button className="p-1.5 text-muted hover:text-danger" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div>
              <OrderSummary subtotal={subtotal} settings={settings}>
                <Link to="/checkout" className="btn btn-primary mt-5 w-full">
                  Proceed to Checkout
                </Link>
                <Link to="/shop" className="mt-3 block text-center text-sm font-medium text-brand hover:underline">
                  Continue shopping
                </Link>
              </OrderSummary>
              <p className="mt-3 text-xs text-muted">Prices and stock are confirmed by the store when you place the order.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
