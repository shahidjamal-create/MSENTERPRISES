import { NavLink, Outlet } from 'react-router-dom';
import { Heart, KeyRound, LogOut, Package, User, Wrench } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/account', label: 'Profile', icon: User, end: true },
  { to: '/account/orders', label: 'My Orders', icon: Package },
  { to: '/account/repairs', label: 'My Repairs', icon: Wrench },
  { to: '/account/security', label: 'Password', icon: KeyRound },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
];

export default function AccountLayout() {
  const { user, logout } = useAuth();
  return (
    <>
      <PageHeader title="My Account" description={`Signed in as ${user?.email}`} crumbs={[['My Account']]} />
      <div className="container-page grid gap-6 py-6 sm:py-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-white p-1.5 lg:flex-col no-scrollbar">
            {LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium whitespace-nowrap ${
                    isActive ? 'bg-brand-soft text-brand font-semibold' : 'text-ink hover:bg-surface'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" /> {label}
              </NavLink>
            ))}
            <button onClick={logout} className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-xs sm:text-sm font-medium whitespace-nowrap text-danger hover:bg-danger-soft">
              <LogOut className="h-4 w-4 shrink-0" /> Logout
            </button>
          </nav>
        </aside>
        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </>
  );
}
