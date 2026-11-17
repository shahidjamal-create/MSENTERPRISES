import ProductCard from './ProductCard';

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-line bg-white">
          <div className="aspect-square bg-surface" />
          <div className="space-y-2 p-2.5 sm:p-3.5">
            <div className="h-3 w-1/3 rounded bg-surface" />
            <div className="h-4 w-4/5 rounded bg-surface" />
            <div className="h-4 w-1/2 rounded bg-surface" />
            <div className="h-8 rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductGrid({ products, columns = 'xl:grid-cols-4' }) {
  return (
    <div className={`grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 ${columns}`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
