import { NavLink } from 'react-router-dom';
import { Home, Layers, ShoppingBag, ShoppingCart, User, Wrench } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
  const { count } = useCart();
  const { user } = useAuth();

  const itemClass = ({ isActive }) =>
    `flex flex-1 flex-col items-center justify-center py-1.5 transition-all relative ${
      isActive ? 'text-[#0071E3]' : 'text-slate-400 hover:text-slate-700'
    }`;

  return (
    <nav
      className="no-print fixed bottom-3 inset-x-3 z-40 md:hidden max-w-md mx-auto"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex h-15 items-center justify-around px-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <NavLink to="/" end className={itemClass}>
          {({ isActive }) => (
            <>
              <Home className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>Home</span>
              {isActive && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#0071E3]" />}
            </>
          )}
        </NavLink>

        <NavLink to="/shop" className={itemClass}>
          {({ isActive }) => (
            <>
              <ShoppingBag className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>Shop</span>
              {isActive && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#0071E3]" />}
            </>
          )}
        </NavLink>

        <NavLink to="/book-repair" className={itemClass}>
          {({ isActive }) => (
            <>
              <span className={`flex h-9 w-9 -mt-3 items-center justify-center rounded-full bg-[#0071E3] text-white shadow-[0_4px_12px_rgba(0,113,227,0.4)] transition-transform active:scale-90 ${isActive ? 'ring-2 ring-white' : ''}`}>
                <Wrench className="h-4.5 w-4.5" />
              </span>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-[#0071E3]' : 'font-medium'}`}>Repair</span>
            </>
          )}
        </NavLink>

        <NavLink to="/cart" className={itemClass} aria-label={`Cart, ${count} items`}>
          {({ isActive }) => (
            <>
              <div className="relative">
                <ShoppingCart className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {count > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0071E3] px-1 text-[9px] font-extrabold text-white shadow-xs">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>Cart</span>
              {isActive && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#0071E3]" />}
            </>
          )}
        </NavLink>

        <NavLink to={user ? '/account' : '/login'} className={itemClass}>
          {({ isActive }) => (
            <>
              <User className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>{user ? 'Account' : 'Login'}</span>
              {isActive && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#0071E3]" />}
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}

