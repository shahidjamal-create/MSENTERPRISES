import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="text-sm font-semibold text-brand">404</p>
      <h1 className="mt-2 text-2xl font-bold text-navy">Page not found</h1>
      <p className="mt-2 text-sm text-muted">The page you are looking for doesn't exist or has moved.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary flex-1 sm:flex-initial">Go home</Link>
        <Link to="/shop" className="btn btn-outline flex-1 sm:flex-initial">Browse shop</Link>
      </div>
    </div>
  );
}
