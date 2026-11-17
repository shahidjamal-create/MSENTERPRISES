import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUp,
  ChevronDown,
  ChevronRight,
  FileText,
  Flame,
  Headphones,
  Heart,
  Home,
  Layers,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  User,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BUSINESS, TOP_10_MODELS } from '../utils/constants';

// Clean primary navigation links: all product categories live inside the Categories mega-menu
const NAV = [
  { to: '/', label: 'Home', end: true, icon: Home },
  { to: '/about', label: 'About', end: true, icon: FileText },
  { to: '/shop', label: 'All Products', end: true, icon: Smartphone, hasDropdown: true },
  { to: '/services', label: 'Mobile Services', end: true, icon: Headphones, hasDropdown: true },
  { to: '/contact', label: 'Contact', end: true, icon: ShieldCheck },
];

// Rich Categories Mega Menu items with visual cards
const CATEGORY_ITEMS = [
  {
    to: '/tempered-glass',
    label: 'Tempered Glass',
    badge: '11D & UV',
    desc: '2.5D, 9D, 11D Full Glue, Privacy Matte & UV Liquid screen protectors for all models',
    icon: Smartphone,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    to: '/pouches',
    label: 'Mobile Pouches & Covers',
    badge: 'Top Selling',
    desc: 'Liquid silicone, rotating metal kickstand, tough armor & leather card pouches',
    icon: Layers,
    color: 'text-indigo-600 bg-indigo-50',
  },
  {
    to: '/power-banks',
    label: 'Power Banks & Batteries',
    badge: 'Hot / New',
    badgeColor: 'bg-amber-500 text-white',
    desc: '10,000mAh to 20,000mAh fast charge, MagSafe wireless & replacement phone batteries',
    icon: Flame,
    color: 'text-amber-600 bg-amber-50',
  },
  {
    to: '/shop?category=3',
    label: 'Chargers & Power Adapters',
    badge: '65W GaN',
    desc: '65W GaN dual Type-C wall adapters, QC 3.0 chargers & rapid phone power bricks',
    icon: Zap,
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    to: '/accessories',
    label: 'All Phone Accessories',
    badge: '100% Genuine',
    desc: '100W braided cables, car mounts, memory cards, OTG adapters & earphones',
    icon: ShoppingBag,
    color: 'text-purple-600 bg-purple-50',
  },
  {
    to: '/services',
    label: 'Mobile Repair Services',
    badge: '45-Min Fix',
    badgeColor: 'bg-emerald-600 text-white',
    desc: 'Screen replacement, battery revival, charging port repair & IC diagnosis in Shivaji Nagar',
    icon: Wrench,
    color: 'text-rose-600 bg-rose-50',
  },
  {
    to: '/track-repair',
    label: 'Track Live Repair',
    badge: 'Live Status',
    badgeColor: 'bg-blue-600 text-white',
    desc: 'Enter your booking ID (MSR-XXXXXX) to track diagnosis, repair progress and pickup time',
    icon: Wrench,
    color: 'text-cyan-600 bg-cyan-50',
  },
];

function SearchBox({ onDone, className = '' }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const q = term.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
    onDone?.();
  };

  return (
    <form onSubmit={submit} className={`relative flex items-center w-full max-w-lg mx-auto ${className}`} role="search">
      <div className="relative flex items-center w-full">
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="h-10 w-full rounded-full border border-slate-200/90 bg-white pl-10 pr-24 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0066FF] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 shadow-xs transition-all"
          placeholder="Search for products..."
          aria-label="Search products"
        />
        <button
          type="submit"
          className="absolute right-1.5 flex h-7.5 items-center justify-center rounded-full bg-[#0066FF] hover:bg-[#0055D6] px-4 text-xs font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          Search
        </button>
      </div>
    </form>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [productsDropdown, setProductsDropdown] = useState(false);
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const dropdownRef = useRef(null);
  const { count, wishlist } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 20);
      setShowScrollTop(y > 280);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setCategoryDropdown(false);
    setProductsDropdown(false);
    setServicesDropdown(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCategoryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header
        className={`no-print sticky top-0 z-50 transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
            : 'bg-white border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
        }`}
      >
      {/* 1. TOP MAIN HEADER ROW (Matching Photo 2) */}
      <div className="container-page flex h-16 sm:h-[74px] items-center justify-between gap-3 sm:gap-4 lg:gap-6">
        {/* Brand Logo with orbital swoosh icon */}
        <Logo />

        {/* Center Search Bar matching Photo 2 */}
        <div className="hidden flex-1 md:block max-w-md mx-auto">
          <SearchBox />
        </div>

        {/* Right Actions matching Photo 2 */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Book a Repair -> Button */}
          <Link
            to="/book-repair"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#0066FF] hover:bg-[#0055D6] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all active:scale-95 tracking-wide"
          >
            <Wrench className="h-3.5 w-3.5 text-white" />
            <span>Book a Repair →</span>
          </Link>

          {/* Wishlist Icon Button */}
          <Link
            to="/wishlist"
            className="relative hidden sm:flex items-center justify-center h-9 w-9 rounded-full bg-slate-100/80 hover:bg-blue-50 text-slate-700 hover:text-[#0066FF] transition-all"
            aria-label="Wishlist"
          >
            <Heart className="h-4.5 w-4.5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* User Account / Login with down chevron */}
          <Link
            to={user ? '/account' : '/login'}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold text-slate-800 hover:text-[#0066FF] transition-colors"
            aria-label="Account"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden xl:inline text-xs font-bold text-slate-800">
              {user ? user.full_name?.split(' ')[0] || 'Account' : 'Account'}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </Link>

          {/* Cart Icon with blue count badge */}
          <Link
            to="/cart"
            className="relative flex items-center justify-center h-9 w-9 text-slate-800 hover:text-[#0066FF] transition-colors"
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#0066FF] px-1 text-[9px] font-extrabold text-white ring-2 ring-white shadow-xs">
              {count > 99 ? '99+' : count}
            </span>
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button
            className="rounded-full p-2 text-ink hover:bg-slate-100 md:hidden transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* 2. SUB-NAVBAR ROW (Comfortable Connected Layout from Photo 2) */}
      <nav className="hidden border-t border-slate-200/80 md:block bg-[#F8FAFD] relative z-40" aria-label="Main Navigation">
        <div className="container-page flex h-12 items-center gap-2 xl:gap-3">
          {/* 1. FIRST SIDE: Categories Solid Blue Pill Button matching Photo 2 */}
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => setCategoryDropdown(true)}
            onMouseLeave={() => setCategoryDropdown(false)}
          >
            <button
              type="button"
              onClick={() => setCategoryDropdown((v) => !v)}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-[#0066FF] hover:bg-[#0055D6] rounded-full shadow-xs transition-all cursor-pointer select-none"
              aria-expanded={categoryDropdown}
            >
              <Layers className="h-4 w-4 text-white" />
              <span className="font-bold tracking-wide">Categories</span>
              <ChevronDown className={`h-3.5 w-3.5 text-white transition-transform duration-200 ${categoryDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Mega Dropdown Panel */}
            {categoryDropdown && (
              <div className="fixed inset-x-3 top-[108px] sm:top-[120px] md:absolute md:inset-x-auto md:left-0 md:top-full z-[100] pt-1.5 w-auto md:w-[540px] max-w-[calc(100vw-24px)]">
                <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 ring-1 ring-black/5 max-h-[75vh] overflow-y-auto">
                  <div className="mb-3 px-1 flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Explore Product Categories</span>
                      <span className="text-[11px] text-muted">All phone accessories & repair services in one place</span>
                    </div>
                    <Link
                      to="/shop"
                      onClick={() => setCategoryDropdown(false)}
                      className="text-xs font-bold text-[#0066FF] hover:underline flex items-center gap-0.5 shrink-0"
                    >
                      <span>View All Products</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                    {CATEGORY_ITEMS.map((c) => {
                      const Icon = c.icon;
                      return (
                        <Link
                          key={c.label}
                          to={c.to}
                          onClick={() => setCategoryDropdown(false)}
                          className="group flex flex-col justify-between rounded-xl border border-slate-100 p-2.5 transition-all hover:border-[#0066FF]/40 hover:bg-blue-50/40 hover:shadow-xs"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1.5">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${c.color || 'bg-slate-100 text-slate-700'}`}>
                                  <Icon className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-xs font-bold text-ink group-hover:text-[#0066FF] transition-colors line-clamp-1">
                                  {c.label}
                                </span>
                              </div>
                              {c.badge && (
                                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${c.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                                  {c.badge}
                                </span>
                              )}
                            </div>
                            <span className="block text-[11px] text-muted line-clamp-2 leading-relaxed">
                              {c.desc}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <div className="h-4 w-[1px] bg-slate-300 mx-1.5" />

          {/* 2. Home Link with Icon & Active Underline */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `relative flex items-center gap-1.5 px-3 py-3.5 text-xs font-bold transition-all whitespace-nowrap ${
                isActive ? 'text-[#0066FF]' : 'text-slate-700 hover:text-[#0066FF]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Home className="h-4 w-4" />
                <span>Home</span>
                {isActive && <span className="absolute bottom-0 inset-x-2.5 h-[2.5px] bg-[#0066FF] rounded-full" />}
              </>
            )}
          </NavLink>

          {/* 3. About Link with Icon & Active Underline */}
          <NavLink
            to="/about"
            end
            className={({ isActive }) =>
              `relative flex items-center gap-1.5 px-3 py-3.5 text-xs font-bold transition-all whitespace-nowrap ${
                isActive ? 'text-[#0066FF]' : 'text-slate-700 hover:text-[#0066FF]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <FileText className="h-4 w-4" />
                <span>About</span>
                {isActive && <span className="absolute bottom-0 inset-x-2.5 h-[2.5px] bg-[#0066FF] rounded-full" />}
              </>
            )}
          </NavLink>

          {/* 4. All Products with Icon & Dropdown Chevron */}
          <div
            className="relative"
            onMouseEnter={() => setProductsDropdown(true)}
            onMouseLeave={() => setProductsDropdown(false)}
          >
            <NavLink
              to="/shop"
              end
              className={({ isActive }) =>
                `relative flex items-center gap-1.5 px-3 py-3.5 text-xs font-bold transition-all whitespace-nowrap ${
                  isActive ? 'text-[#0066FF]' : 'text-slate-700 hover:text-[#0066FF]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Smartphone className="h-4 w-4" />
                  <span>All Products</span>
                  <ChevronDown className={`h-3 w-3 opacity-70 transition-transform duration-200 ${productsDropdown ? 'rotate-180' : ''}`} />
                  {isActive && <span className="absolute bottom-0 inset-x-2.5 h-[2.5px] bg-[#0066FF] rounded-full" />}
                </>
              )}
            </NavLink>

            {/* Quick Dropdown for Products */}
            {productsDropdown && (
              <div className="absolute left-0 top-full pt-1 z-50 w-56 animate-in fade-in duration-100">
                <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5">
                  <Link to="/shop" className="block px-3 py-2 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:text-[#0066FF] rounded-lg">
                    Browse All Products
                  </Link>
                  <Link to="/tempered-glass" className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0066FF] rounded-lg">
                    Tempered Glass
                  </Link>
                  <Link to="/pouches" className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0066FF] rounded-lg">
                    Mobile Pouches & Covers
                  </Link>
                  <Link to="/power-banks" className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0066FF] rounded-lg">
                    Power Banks & Batteries
                  </Link>
                  <Link to="/accessories" className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0066FF] rounded-lg">
                    Phone Accessories
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 5. Mobile Services with Icon & Dropdown Chevron */}
          <div
            className="relative"
            onMouseEnter={() => setServicesDropdown(true)}
            onMouseLeave={() => setServicesDropdown(false)}
          >
            <NavLink
              to="/services"
              end
              className={({ isActive }) =>
                `relative flex items-center gap-1.5 px-3 py-3.5 text-xs font-bold transition-all whitespace-nowrap ${
                  isActive ? 'text-[#0066FF]' : 'text-slate-700 hover:text-[#0066FF]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Headphones className="h-4 w-4" />
                  <span>Mobile Services</span>
                  <ChevronDown className={`h-3 w-3 opacity-70 transition-transform duration-200 ${servicesDropdown ? 'rotate-180' : ''}`} />
                  {isActive && <span className="absolute bottom-0 inset-x-2.5 h-[2.5px] bg-[#0066FF] rounded-full" />}
                </>
              )}
            </NavLink>

            {/* Quick Dropdown for Services */}
            {servicesDropdown && (
              <div className="absolute left-0 top-full pt-1 z-50 w-56 animate-in fade-in duration-100">
                <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5">
                  <Link to="/services" className="block px-3 py-2 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:text-[#0066FF] rounded-lg">
                    All Repair Services
                  </Link>
                  <Link to="/book-repair" className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0066FF] rounded-lg">
                    Book a Repair Slot
                  </Link>
                  <Link to="/track-repair" className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0066FF] rounded-lg">
                    Track Repair Progress
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 6. Contact Link with Icon & Active Underline */}
          <NavLink
            to="/contact"
            end
            className={({ isActive }) =>
              `relative flex items-center gap-1.5 px-3 py-3.5 text-xs font-bold transition-all whitespace-nowrap ${
                isActive ? 'text-[#0066FF]' : 'text-slate-700 hover:text-[#0066FF]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Contact</span>
                {isActive && <span className="absolute bottom-0 inset-x-2.5 h-[2.5px] bg-[#0066FF] rounded-full" />}
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* 5. FULLY RESPONSIVE MOBILE DRAWER MENU */}
      {menuOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-[56px] sm:top-[64px] z-50 bg-navy/40 backdrop-blur-xs md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-line bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container-page space-y-4 py-4">
              {/* 10 Models Spaces Quick Grid for Mobile */}
              <div className="rounded-2xl border border-brand/20 bg-brand-soft/20 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-navy flex items-center gap-1">
                    <Smartphone className="h-3.5 w-3.5 text-brand" /> Browse by Popular Models
                  </span>
                  <Link
                    to="/shop"
                    onClick={() => setMenuOpen(false)}
                    className="text-[10px] font-bold text-brand hover:underline"
                  >
                    View all →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {TOP_10_MODELS.map((m) => (
                    <Link
                      key={m.id}
                      to={`/shop?model=${m.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-1.5 rounded-lg border border-line/80 bg-white p-2 text-xs font-medium text-ink hover:border-brand hover:text-brand transition-colors"
                    >
                      {m.image_url ? (
                        <img src={m.image_url} alt="" className="h-4 w-4 rounded-full object-cover shrink-0" />
                      ) : (
                        <Smartphone className="h-3.5 w-3.5 text-brand/80 shrink-0" />
                      )}
                      <span className="truncate">{m.short_name || m.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Product Categories for Mobile */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-brand" /> Product Categories
                  </span>
                  <Link
                    to="/shop"
                    onClick={() => setMenuOpen(false)}
                    className="text-[10px] font-bold text-brand hover:underline"
                  >
                    All Products →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORY_ITEMS.map((c) => {
                    const Icon = c.icon;
                    return (
                      <Link
                        key={c.label}
                        to={c.to}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white p-2 text-xs font-medium text-ink hover:border-brand hover:text-brand transition-colors"
                      >
                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${c.color || 'bg-slate-100 text-slate-700'}`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <span className="truncate">{c.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Main Navigation Links in Order-Wise Sequence */}
              <nav className="grid grid-cols-2 gap-1.5" aria-label="Mobile Navigation">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium ${
                        isActive ? 'bg-brand-soft text-brand font-bold' : 'text-ink hover:bg-surface'
                      }`
                    }
                  >
                    <span>{item.label}</span>
                    {item.isHot && (
                      <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[8px] font-extrabold text-white">
                        Hot
                      </span>
                    )}
                  </NavLink>
                ))}
                <NavLink to="/wishlist" className="rounded-xl px-3 py-2.5 text-xs font-medium text-ink hover:bg-surface">
                  Wishlist ({wishlist.length})
                </NavLink>
                <NavLink to="/track-repair" className="rounded-xl px-3 py-2.5 text-xs font-medium text-ink hover:bg-surface">
                  Track Repair
                </NavLink>
              </nav>

              {/* Action and contact footer in mobile menu */}
              <div className="pt-2 border-t border-line space-y-2">
                <Link to="/book-repair" className="btn btn-primary w-full">
                  <Wrench className="h-4 w-4" /> Book a Repair
                </Link>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a href={BUSINESS.phoneHref} className="btn btn-outline btn-sm">
                    <Phone className="h-3.5 w-3.5 text-brand" /> Call Store
                  </a>
                  <a href={BUSINESS.whatsapp} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp
                  </a>
                </div>
                <a
                  href={BUSINESS.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 rounded-xl border border-line bg-surface/80 p-2.5 text-xs text-ink hover:border-brand transition-colors"
                >
                  <MapPin className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-[11px] text-brand">Store Location (Google Maps)</span>
                    <span className="text-[11px] text-muted leading-tight block">{BUSINESS.addressFull}</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>

    {/* Floating Move Up / Back to Top Button */}
    {showScrollTop && (
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-20 md:bottom-8 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#10243A] text-white shadow-2xl hover:bg-[#1677FF] hover:scale-110 active:scale-95 transition-all animate-in fade-in zoom-in-75 duration-200 border-2 border-white ring-2 ring-black/10 cursor-pointer"
        aria-label="Move to top"
        title="Move up to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    )}
  </>
  );
}
