import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './ui/Feedback';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}

export function AdminRoute({ children, permission }) {
  const { user, loading, isStaff, can } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user || !isStaff) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (permission && !can(permission)) {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">Access restricted</h2>
        <p className="mt-2 text-sm text-muted">Your role does not have permission to view this section.</p>
      </div>
    );
  }
  return children;
}
