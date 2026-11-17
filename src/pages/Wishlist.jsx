import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { EmptyState } from '../components/ui/Feedback';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useCart();
  return (
    <>
      <PageHeader title="Wishlist" description="Items you saved for later. Stock and price are confirmed on the product page." crumbs={[['Wishlist']]} />
      <div className="container-page py-8">
        {wishlist.length === 0 ? (
          <EmptyState icon={Heart} title="Your wishlist is empty" message="Tap the heart on any product to save it here." action={<Link to="/shop" className="btn btn-primary">Browse products</Link>} />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {wishlist.map((item) => (
              <li key={item.id} className="card flex items-center gap-3 sm:gap-4 p-3">
                <Link to={`/product/${item.slug}`} className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-lg bg-surface">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted">No img</div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${item.slug}`} className="line-clamp-2 text-xs sm:text-sm font-semibold text-ink hover:text-brand">
                    {item.name}
                  </Link>
                  <p className="text-xs sm:text-sm text-muted">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link to={`/product/${item.slug}`} className="btn btn-outline btn-sm text-xs px-2.5">
                    View
                  </Link>
                  <button onClick={() => toggleWishlist(item)} className="p-1.5 text-muted hover:text-danger" aria-label={`Remove ${item.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
