import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { PageLoader } from './components/ui/Feedback';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute';
import CustomerLayout from './layouts/CustomerLayout';
import AccountLayout from './layouts/AccountLayout';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import RepairBooking from './pages/RepairBooking';
import RepairTracking from './pages/RepairTracking';
import Contact from './pages/Contact';
import Invoice from './pages/Invoice';
import NotFound from './pages/NotFound';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/account/Profile';
import Security from './pages/account/Security';
import MyOrders from './pages/account/MyOrders';
import OrderDetail from './pages/account/OrderDetail';
import MyRepairs from './pages/account/MyRepairs';

const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const Dashboard = lazy(() => import('./admin/Dashboard'));
const Products = lazy(() => import('./admin/Products'));
const CrudPage = lazy(() => import('./admin/CrudPage'));
const Bookings = lazy(() => import('./admin/Bookings'));
const Orders = lazy(() => import('./admin/Orders'));
const Customers = lazy(() => import('./admin/Customers'));
const Inventory = lazy(() => import('./admin/Inventory'));
const Staff = lazy(() => import('./admin/Staff'));
const Emails = lazy(() => import('./admin/Emails'));
const Enquiries = lazy(() => import('./admin/Enquiries'));
const Reports = lazy(() => import('./admin/Reports'));
const Settings = lazy(() => import('./admin/Settings'));
import { BRANDS, CATEGORIES, MODELS, SERVICES, SUPPLIERS } from './admin/crudConfigs';

const guard = (permission, element) => <AdminRoute permission={permission}>{element}</AdminRoute>;

function ReloadToHome() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user reloads/refreshes the page, navigate directly to Home ('/') section
    try {
      const navEntries = performance.getEntriesByType?.('navigation');
      const isReload = navEntries?.[0]?.type === 'reload' || performance.navigation?.type === 1;
      if (isReload && location.pathname !== '/' && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/invoice')) {
        navigate('/', { replace: true });
      }
    } catch {}
  }, []);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ReloadToHome />
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<CustomerLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="services" element={<Services />} />
                <Route path="shop" element={<Shop title="All Products" description="Tempered glass, pouches and accessories. Select your phone to see only compatible items." crumb="Shop" />} />
                <Route path="tempered-glass" element={<Shop key="glass" type="tempered_glass" title="Tempered Glass" description="2.5D to 11D, privacy, matte, UV, ceramic and hydrogel screen protectors — shown only for verified models." />} />
                <Route path="pouches" element={<Shop key="pouch" type="pouch" title="Mobile Pouches" description="Transparent, silicone, leather, magnetic, shockproof and designer cases for your exact model." />} />
                <Route path="power-banks" element={<Shop key="power" category="6" title="Power Banks & Batteries" description="20,000mAh PD fast chargers, MagSafe wireless packs and replacement batteries." crumb="Power Banks & Batteries" />} />
                <Route path="accessories" element={<Shop key="acc" type="accessory" title="Accessories" description="Chargers, cables, power banks, earphones, headphones, speakers, memory cards and more." />} />
                <Route path="product/:slug" element={<ProductDetails />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="book-repair" element={<RepairBooking />} />
                <Route path="track-repair" element={<RepairTracking />} />
                <Route path="contact" element={<Contact />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="account" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
                  <Route index element={<Profile />} />
                  <Route path="orders" element={<MyOrders />} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                  <Route path="repairs" element={<MyRepairs />} />
                  <Route path="security" element={<Security />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Route>

              <Route path="invoice/:id" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
              <Route path="admin/login" element={<AdminLogin />} />
              <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={guard('dashboard', <Dashboard />)} />
                <Route path="products" element={guard('products', <Products key="all" />)} />
                <Route path="tempered-glass" element={guard('products', <Products key="glass" productType="tempered_glass" />)} />
                <Route path="pouches" element={guard('products', <Products key="pouch" productType="pouch" />)} />
                <Route path="accessories" element={guard('products', <Products key="acc" productType="accessory" />)} />
                <Route path="categories" element={guard('catalog', <CrudPage key="categories" config={CATEGORIES} />)} />
                <Route path="brands" element={guard('catalog', <CrudPage key="brands" config={BRANDS} />)} />
                <Route path="models" element={guard('catalog', <CrudPage key="models" config={MODELS} />)} />
                <Route path="services" element={guard('catalog', <CrudPage key="services" config={SERVICES} />)} />
                <Route path="suppliers" element={guard('suppliers', <CrudPage key="suppliers" config={SUPPLIERS} />)} />
                <Route path="bookings" element={guard('bookings', <Bookings />)} />
                <Route path="orders" element={guard('orders', <Orders />)} />
                <Route path="customers" element={guard('customers', <Customers />)} />
                <Route path="inventory" element={guard('inventory', <Inventory />)} />
                <Route path="staff" element={guard('staff', <Staff />)} />
                <Route path="emails" element={guard('emails', <Emails />)} />
                <Route path="enquiries" element={guard('enquiries', <Enquiries />)} />
                <Route path="reports" element={guard('reports', <Reports />)} />
                <Route path="settings" element={guard('settings', <Settings />)} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
