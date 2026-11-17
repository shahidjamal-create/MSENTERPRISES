import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Boxes, ClipboardList, ExternalLink, FolderTree, Inbox, LayoutDashboard, LogOut, Mail, Menu, Package,
  Settings, ShieldCheck, ShoppingBag, Smartphone, Tablet, Tags, Truck, UserCog, Users, Wrench, X, Headphones,
} from 'lucide-react';
import { LogoMark } from '../components/Logo';
import { PageLoader } from '../components/ui/Feedback';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/constants';

export const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard', end: true },
  { to: '/admin/products', label: 'Products', icon: Package, perm: 'products' },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree, perm: 'catalog' },
  { to: '/admin/brands', label: 'Brands', icon: Tags, perm: 'catalog' },
  { to: '/admin/models', label: 'Models', icon: Smartphone, perm: 'catalog' },
  { to: '/admin/tempered-glass', label: 'Tempered Glass', icon: ShieldCheck, perm: 'products' },
  { to: '/admin/pouches', label: 'Pouches', icon: Tablet, perm: 'products' },
  { to: '/admin/accessories', label: 'Accessories', icon: Headphones, perm: 'products' },
  { to: '/admin/services', label: 'Repair Services', icon: Wrench, perm: 'catalog' },
  { to: '/admin/bookings', label: 'Repair Bookings', icon: ClipboardList, perm: 'bookings' },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag, perm: 'orders' },
  { to: '/admin/customers', label: 'Customers', icon: Users, perm: 'customers' },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes, perm: 'inventory' },
  { to: '/admin/suppliers', label: 'Suppliers', icon: Truck, perm: 'suppliers' },
  { to: '/admin/staff', label: 'Staff', icon: UserCog, perm: 'staff' },
  { to: '/admin/emails', label: 'Email Management', icon: Mail, perm: 'emails' },
  { to: '/admin/enquiries', label: 'Enquiries & Reviews', icon: Inbox, perm: 'enquiries' },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3, perm: 'reports' },
  { to: '/admin/settings', label: 'Settings', icon: Settings, perm: 'settings' },
];

export function AdminHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-navy md:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export default function AdminLayout() {
  const { user, can, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);

  const signOut = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-2.5 px-4 py-4">
        <LogoMark className="h-8 w-8" />
        <span className="leading-tight">
          <span className="block text-sm font-extrabold tracking-wide text-white">MS ENTERPRISES</span>
          <span className="block text-[11px] text-white/50">Admin Panel</span>
        </span>
      </Link>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4" aria-label="Admin">
        {ADMIN_NAV.filter((item) => can(item.perm)).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-brand text-white' : 'text-white/75 hover:bg-white/5 hover:text-white'}`
            }
          >
            <Icon className="h-4 w-4 shrink-0" /> {label}
          </NavLink>
        ))}
        <button onClick={signOut} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/75 hover:bg-white/5 hover:text-white">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-60 bg-navy lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 max-w-[85vw] bg-navy">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="no-print sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white px-4 md:px-6">
          <button className="rounded-lg p-1.5 hover:bg-surface lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" target="_blank" className="hidden items-center gap-1 text-sm text-muted hover:text-brand sm:flex">
            View store <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <div className="ml-auto flex min-w-0 items-center gap-3 text-right">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user?.full_name || user?.email}</p>
              <p className="text-xs text-muted">{ROLE_LABELS[user?.role]}</p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
              {(user?.full_name || user?.email || '?').charAt(0).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="p-4 md:p-6">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
