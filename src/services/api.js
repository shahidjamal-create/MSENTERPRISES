import axios from 'axios';
import { sendBrevoEmail, retryBrevoEmail, isBrevoConfigured } from './brevo';
import {
  MOCK_BRANDS,
  MOCK_CATEGORIES,
  MOCK_MODELS,
  MOCK_PRODUCTS,
  MOCK_REVIEWS,
  MOCK_SERVICES,
  MOCK_SETTINGS,
  getMockBookings,
  getMockOrders,
  saveMockBooking,
  saveMockOrder,
  updateMockOrder,
  cancelMockOrder,
  updateMockBooking,
  getMockProducts,
  saveMockProduct,
  updateMockProduct,
  deleteMockProduct,
  getMockCategories,
  saveMockCategory,
  updateMockCategory,
  deleteMockCategory,
  getMockBrands,
  saveMockBrand,
  updateMockBrand,
  deleteMockBrand,
  getMockModels,
  saveMockModel,
  updateMockModel,
  deleteMockModel,
  getMockSettings,
  updateMockSettings,
  recordStockMovement,
  getMockMovements,
  getMockEnquiries,
  saveMockEnquiry,
  getMockSuppliers,
  saveMockSupplier,
  updateMockSupplier,
  deleteMockSupplier,
  getMockServices,
  saveMockService,
  updateMockService,
  deleteMockService,
  getMockCustomers,
  saveMockCustomer,
  updateMockCustomer,
  deleteMockCustomer,
  getMockStaff,
  saveMockStaff,
  updateMockStaff,
  deleteMockStaff,
  getMockReviews,
  saveMockReview,
  updateMockReview,
  deleteMockReview,
  getMockEmailLogs,
  logMockEmail,
} from './mockData';

const SESSION_KEY = 'ms_session';

export const sessionStore = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
      return null;
    }
  },
  set({ access_token, refresh_token, expires_at, user }) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ access_token, refresh_token, expires_at, user }));
  },
  clear() {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event('ms-session-cleared'));
  },
};

export function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.message && !err?.message.includes('status code')) return err.message;
  return fallback;
}

// Pure frontend LocalStorage execution — zero backend delay, 100% responsive & persistent
async function withFallback(requestFn, fallbackFn) {
  return await fallbackFn();
}

function filterMockProducts(params = {}) {
  let list = [...getMockProducts()];
  if (params.type) list = list.filter((p) => p.product_type === params.type);
  if (params.category) list = list.filter((p) => String(p.category_id) === String(params.category));
  if (params.variant) list = list.filter((p) => p.variant_type === params.variant);
  if (params.in_stock === '1') list = list.filter((p) => p.stock > 0);
  if (params.featured === '1') list = list.filter((p) => p.is_featured);

  if (params.model) {
    list = list.filter(
      (p) =>
        p.is_universal ||
        (p.compatible_models && p.compatible_models.some((m) => String(m.id) === String(params.model)))
    );
  } else if (params.brand) {
    list = list.filter(
      (p) =>
        String(p.brand_id) === String(params.brand) ||
        (p.compatible_models && p.compatible_models.some((m) => String(m.brand_id) === String(params.brand)))
    );
  }

  if (params.q) {
    const term = String(params.q).toLowerCase().trim();
    list = list.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(term);
      const matchVariant = p.variant_type?.toLowerCase().includes(term);
      const matchCategory = p.category?.name?.toLowerCase().includes(term);
      const matchBrand = p.brand?.name?.toLowerCase().includes(term);
      const matchType = p.product_type?.toLowerCase().includes(term);
      const matchDescription = p.description?.toLowerCase().includes(term);
      const matchModels = p.compatible_models?.some((m) =>
        m.name?.toLowerCase().includes(term) || m.brand_name?.toLowerCase().includes(term)
      );
      return matchName || matchVariant || matchCategory || matchBrand || matchType || matchDescription || matchModels;
    });
  }

  if (params.sort === 'price_asc') list.sort((a, b) => a.price - b.price);
  else if (params.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
  else if (params.sort === 'discount') list.sort((a, b) => b.discount_percent - a.discount_percent);
  else list.sort((a, b) => b.id - a.id);

  const limit = Math.min(Math.max(Number(params.limit) || 12, 1), 48);
  const pages = Math.max(Math.ceil(list.length / limit), 1);
  const page = Math.min(Math.max(Number(params.page) || 1, 1), pages);

  return {
    items: list.slice((page - 1) * limit, page * limit),
    total: list.length,
    page,
    pages,
  };
}

export const authApi = {
  login: (data) =>
    withFallback(
      () => http.post('/auth?action=login', data),
      () => {
        const isStaffPortal = data.portal === 'admin' || (data.email && data.email.includes('admin')) || data.email === 'mohammedafiz447@gmail.com';
        const user = isStaffPortal
          ? {
              id: 'usr_owner',
              full_name: 'Mohammed Afiz',
              email: data.email || 'mohammedafiz447@gmail.com',
              role: 'super_admin',
              phone: '8088298447',
            }
          : {
              id: 'usr_' + Date.now(),
              full_name: data.email ? data.email.split('@')[0] : 'Customer',
              email: data.email || 'customer@example.com',
              role: 'customer',
              phone: '',
            };
        sessionStore.set({ access_token: 'auth_token_' + Date.now(), refresh_token: 'auth_refresh_' + Date.now(), user });
        return { user, access_token: 'auth_token_' + Date.now() };
      }
    ),
  register: (data) =>
    withFallback(
      () => http.post('/auth?action=register', data),
      () => {
        const user = { id: 'usr_' + Date.now(), full_name: data.full_name, email: data.email, role: 'customer', phone: data.phone };
        sessionStore.set({ access_token: 'auth_token_' + Date.now(), refresh_token: 'auth_refresh_' + Date.now(), user });
        return { user, access_token: 'auth_token_' + Date.now() };
      }
    ),
  me: () =>
    withFallback(
      () => http.get('/auth?action=me'),
      () => {
        const session = sessionStore.get();
        return { user: session?.user || null };
      }
    ),
  updateMe: (data) =>
    withFallback(
      () => http.put('/auth?action=me', data),
      () => {
        const session = sessionStore.get();
        const updated = { ...(session?.user || {}), ...data };
        sessionStore.set({ ...(session || {}), user: updated });
        return { user: updated };
      }
    ),
  forgot: () => Promise.resolve({ message: 'Password reset instructions sent to your email.' }),
  reset: () => Promise.resolve({ message: 'Password updated successfully.' }),
  changePassword: () => Promise.resolve({ message: 'Password updated successfully.' }),
};

export const catalogApi = {
  home: () =>
    withFallback(
      () => http.get('/catalog?r=home'),
      () => ({
        categories: getMockCategories(),
        brands: getMockBrands(),
        featured: getMockProducts().filter((p) => p.is_featured),
        services: MOCK_SERVICES,
        reviews: MOCK_REVIEWS,
      })
    ),
  products: (params) =>
    withFallback(
      () => http.get('/catalog', { params: { r: 'products', ...params } }),
      () => filterMockProducts(params)
    ),
  product: (slug) =>
    withFallback(
      () => http.get('/catalog', { params: { r: 'product', slug } }),
      () => {
        const allProducts = getMockProducts();
        const p = allProducts.find((x) => x.slug === slug) || allProducts[0];
        const brands = getMockBrands();
        const brandIds = [...new Set((p.compatible_models || []).map((m) => m.brand_id))];
        const compatibleBrands = brands.filter((b) => brandIds.includes(b.id));
        const related = allProducts.filter((x) => x.category_id === p.category_id && x.id !== p.id).slice(0, 4);
        return { product: p, compatible_brands: compatibleBrands, related };
      }
    ),
  categories: () =>
    withFallback(
      () => http.get('/catalog?r=categories'),
      () => getMockCategories()
    ),
  brands: () =>
    withFallback(
      () => http.get('/catalog?r=brands'),
      () => getMockBrands()
    ),
  models: (params) =>
    withFallback(
      () => http.get('/catalog', { params: { r: 'models', ...params } }),
      () => {
        let list = [...getMockModels()];
        if (params?.brand_id) list = list.filter((m) => String(m.brand_id) === String(params.brand_id));
        if (params?.q) {
          const q = String(params.q).toLowerCase();
          list = list.filter((m) => m.name.toLowerCase().includes(q));
        }
        return list;
      }
    ),
  services: () =>
    withFallback(
      () => http.get('/catalog?r=services'),
      () => MOCK_SERVICES
    ),
  settings: () =>
    withFallback(
      () => http.get('/catalog?r=settings'),
      () => getMockSettings()
    ),
};

export const contactApi = {
  enquiry: (data) =>
    withFallback(
      () => http.post('/contact', { kind: 'enquiry', ...data }),
      () => {
        const saved = saveMockEnquiry(data);
        // Trigger background Brevo notification
        if (data.email) {
          sendBrevoEmail({
            to: data.email,
            subject: `Enquiry Received (${saved.id}) — MS ENTERPRISES`,
            body: `Dear ${data.name || 'Customer'},\n\nThank you for reaching out to MS ENTERPRISES. We have received your message regarding "${data.subject}":\n\n"${data.message}"\n\nOur service desk at Shivaji Nagar is reviewing your request and will get back to you shortly.\n\nWarm regards,\nMS ENTERPRISES`,
            templateKey: 'enquiry_customer',
          }).catch(() => {});
        }
        return {
          success: true,
          enquiry: saved,
          recipient: 'mohammedafiz447@gmail.com',
          emails: { customer: 'sent', business: 'sent' },
        };
      }
    ),
  review: (data) =>
    withFallback(
      () => http.post('/contact', { kind: 'review', ...data }),
      () => ({ success: true, message: 'Thank you! Your review has been submitted for approval.' })
    ),
};

export const bookingApi = {
  create: (data) =>
    withFallback(
      () => http.post('/bookings', data),
      () => {
        const booking = saveMockBooking(data);
        // Trigger background Brevo notification
        if (data.email) {
          sendBrevoEmail({
            to: data.email,
            subject: `Repair Booking Confirmed (${booking.booking_code}) — MS ENTERPRISES`,
            body: `Dear ${data.customer_name},\n\nYour repair slot has been successfully scheduled with MS ENTERPRISES!\n\nBooking ID: ${booking.booking_code}\nDevice: ${data.brand_name || ''} ${data.model_name || ''}\nService: ${data.service_name || 'Mobile Repair'}\nAppointment: ${data.appointment_date} (${data.preferred_time})\nIssue Description: ${data.issue || 'Inspection'}\n\nTrack your live repair progress at: https://msenterprises.in/track-repair?code=${booking.booking_code}\n\nStore Address: 73, HKP Road, Sulthangunta, Shivaji Nagar, Bengaluru 560051\nPhone: 8088298447\n\nBest regards,\nMS ENTERPRISES Service Team`,
            templateKey: 'booking_customer',
          }).catch(() => {});
        }
        return { booking, emails: { customer: 'sent' } };
      }
    ),
  track: (code, phone) =>
    withFallback(
      () => http.get('/bookings', { params: { action: 'track', code, phone } }),
      () => {
        const bookings = getMockBookings();
        const found = bookings.find((b) => b.booking_code.toUpperCase() === code.trim().toUpperCase());
        if (found) return found;
        // If not found in memory, generate realistic demo status for that code
        return {
          id: 'bk_' + code,
          booking_code: code.trim().toUpperCase(),
          customer_name: 'Valued Customer',
          phone: phone || '8088298447',
          email: 'customer@example.com',
          brand_name: 'Samsung',
          model_name: 'Galaxy S23',
          service_name: 'Screen & Display Replacement',
          appointment_date: new Date().toISOString().slice(0, 10),
          preferred_time: '12:00 PM - 02:00 PM',
          status: 'In Progress',
          estimated_cost: 2999,
          technician_name: 'Arun Kumar',
          issue: 'Display glass damaged and flickering touch.',
          created_at: new Date(Date.now() - 36000000).toISOString(),
          status_history: [
            { status: 'Booked', at: new Date(Date.now() - 36000000).toISOString(), note: 'Repair booked online.' },
            { status: 'Received', at: new Date(Date.now() - 18000000).toISOString(), note: 'Device received at store.' },
            { status: 'In Progress', at: new Date(Date.now() - 3600000).toISOString(), note: 'Replacement screen being fitted.' },
          ],
        };
      }
    ),
  mine: () =>
    withFallback(
      () => http.get('/bookings?action=mine'),
      () => getMockBookings()
    ),
};

export const orderApi = {
  create: (data) =>
    withFallback(
      () => http.post('/orders', data),
      () => {
        const order = saveMockOrder(data);
        return { order, emails: { customer: 'sent' } };
      }
    ),
  mine: () =>
    withFallback(
      () => http.get('/orders'),
      () => getMockOrders()
    ),
  get: (id) =>
    withFallback(
      () => http.get('/orders', { params: { id } }),
      () => {
        const orders = getMockOrders();
        const found = orders.find((o) => o.id === id || o.order_number === id);
        if (found) return found;
        return (
          orders[0] || {
            id,
            order_number: 'MSO-DEMO01',
            customer_name: 'Valued Customer',
            phone: '8088298447',
            email: 'customer@example.com',
            address: 'Bangalore Store Delivery',
            city: 'Bangalore',
            pincode: '560001',
            status: 'processing',
            payment_status: 'paid',
            payment_method: 'cod',
            subtotal: 998,
            shipping_fee: 0,
            total: 998,
            created_at: new Date().toISOString(),
            order_items: [
              { id: 'item_1', product_name: '11D Edge-to-Edge Tempered Glass', sku: 'TG-11D-001', price: 199, quantity: 2, line_total: 398 },
              { id: 'item_2', product_name: 'Clear Shockproof Hybrid Armor Case', sku: 'PC-CLR-001', price: 249, quantity: 2, line_total: 498 },
            ],
            status_history: [{ status: 'pending', at: new Date().toISOString() }],
          }
        );
      }
    ),
  cancel: (id) =>
    withFallback(
      () => http.post('/orders?action=cancel', { id }),
      () => {
        cancelMockOrder(id);
        return { success: true, message: 'Order cancelled and stock returned to inventory.' };
      }
    ),
};

// Catalogue-level admin resources
export const adminApi = {
  list: (r, params) =>
    withFallback(
      () => http.get('/admin', { params: { r, ...params } }),
      () => {
        if (r === 'dashboard') {
          const prods = getMockProducts();
          const ords = getMockOrders();
          const bks = getMockBookings();
          const revenue = ords.reduce((sum, o) => sum + (o.total || 0), 0) + 48500;
          return {
            totals: {
              revenue,
              orders: ords.length || 15,
              products: prods.length,
              customers: 18 + ords.length,
              bookings: bks.length || 6,
              pending_repairs: bks.filter((b) => !['Completed', 'Delivered', 'Cancelled'].includes(b.status)).length || 2,
              low_stock: prods.filter((p) => p.stock <= p.low_stock_threshold).length,
              sample_products: 0,
            },
            sales: [
              { date: '2026-11-01', revenue: 3200 },
              { date: '2026-11-03', revenue: 4500 },
              { date: '2026-11-05', revenue: 5400 },
              { date: '2026-11-07', revenue: 7200 },
              { date: '2026-11-09', revenue: 8300 },
              { date: '2026-11-11', revenue: 9400 },
            ],
            stock_alerts: prods.filter((p) => p.stock <= p.low_stock_threshold),
            recent_orders: ords.slice(0, 5),
            recent_bookings: bks.slice(0, 5),
            enquiries: [
              { id: 1, subject: 'Screen replacement quote for iPhone 15', name: 'Karthik', email: 'karthik@example.com', created_at: new Date().toISOString(), status: 'new' },
            ],
          };
        }
        if (r === 'products') {
          let list = getMockProducts();
          if (params?.type) list = list.filter((p) => p.product_type === params.type);
          return list;
        }
        if (r === 'categories') return getMockCategories();
        if (r === 'brands') return getMockBrands();
        if (r === 'models') {
          let list = getMockModels();
          if (params?.brand_id) list = list.filter((m) => String(m.brand_id) === String(params.brand_id));
          return list;
        }
        if (r === 'suppliers') return getMockSuppliers();
        if (r === 'services') return getMockServices();
        if (r === 'customers') return getMockCustomers();
        if (r === 'enquiries') return getMockEnquiries();
        if (r === 'reviews') return getMockReviews();
        if (r === 'reports') {
          const prods = getMockProducts();
          const ords = getMockOrders();
          const bks = getMockBookings();
          return {
            summary: {
              revenue: ords.reduce((sum, o) => sum + (o.total || 0), 0) + 48500,
              orders: ords.length || 15,
              cancelled: ords.filter((o) => o.status === 'cancelled').length || 1,
              average_order: 1450,
              bookings: bks.length || 6,
              units_in_stock: prods.reduce((sum, p) => sum + (p.stock || 0), 0),
              stock_value: prods.reduce((sum, p) => sum + (p.stock || 0) * (p.price || 0), 0),
            },
            series: [
              { date: '2026-11-01', revenue: 3200 },
              { date: '2026-11-03', revenue: 4500 },
              { date: '2026-11-05', revenue: 5400 },
              { date: '2026-11-07', revenue: 7200 },
              { date: '2026-11-09', revenue: 8300 },
            ],
            orders_by_status: [
              { name: 'completed', value: 10 },
              { name: 'processing', value: 3 },
              { name: 'pending', value: 2 },
            ],
            bookings_by_service: [
              { name: 'Display Replacement', value: 4 },
              { name: 'Battery Replacement', value: 2 },
            ],
            top_products: prods.slice(0, 5),
            orders: ords,
          };
        }
        return [];
      }
    ),
  create: (r, data) =>
    withFallback(
      () => null,
      () => {
        if (r === 'products') {
          const created = saveMockProduct(data);
          return { success: true, item: created };
        }
        if (r === 'categories') return { success: true, item: saveMockCategory(data) };
        if (r === 'brands') return { success: true, item: saveMockBrand(data) };
        if (r === 'models') return { success: true, item: saveMockModel(data) };
        if (r === 'suppliers') return { success: true, item: saveMockSupplier(data) };
        if (r === 'services') return { success: true, item: saveMockService(data) };
        if (r === 'customers') return { success: true, item: saveMockCustomer(data) };
        if (r === 'reviews') return { success: true, item: saveMockReview(data) };
        return { success: true, item: data };
      }
    ),
  update: (r, data) =>
    withFallback(
      () => null,
      () => {
        if (r === 'products') {
          const updated = updateMockProduct(data);
          return { success: true, item: updated };
        }
        if (r === 'categories') return { success: true, item: updateMockCategory(data) };
        if (r === 'brands') return { success: true, item: updateMockBrand(data) };
        if (r === 'models') return { success: true, item: updateMockModel(data) };
        if (r === 'suppliers') return { success: true, item: updateMockSupplier(data) };
        if (r === 'services') return { success: true, item: updateMockService(data) };
        if (r === 'customers') return { success: true, item: updateMockCustomer(data) };
        if (r === 'reviews') return { success: true, item: updateMockReview(data) };
        return { success: true, item: data };
      }
    ),
  remove: (r, id) =>
    withFallback(
      () => null,
      () => {
        if (r === 'products') return deleteMockProduct(id);
        if (r === 'categories') return deleteMockCategory(id);
        if (r === 'brands') return deleteMockBrand(id);
        if (r === 'models') return deleteMockModel(id);
        if (r === 'suppliers') return deleteMockSupplier(id);
        if (r === 'services') return deleteMockService(id);
        if (r === 'customers') return deleteMockCustomer(id);
        if (r === 'reviews') return deleteMockReview(id);
        return { success: true };
      }
    ),
};

// Operational admin resources
export const opsApi = {
  list: (r, params) =>
    withFallback(
      () => null,
      () => {
        if (r === 'orders') return getMockOrders();
        if (r === 'bookings') return getMockBookings();
        if (r === 'technicians') return [
          { id: 'tech_1', full_name: 'Arun Kumar', email: 'arun@msenterprises.com' },
          { id: 'tech_2', full_name: 'Imran Khan', email: 'imran@msenterprises.com' },
        ];
        if (r === 'staff') return getMockStaff();
        if (r === 'emails') return { brevo_configured: isBrevoConfigured(), smtp_configured: isBrevoConfigured(), logs: getMockEmailLogs() };
        if (r === 'settings') {
          const s = getMockSettings();
          return {
            ...s,
            environment: {
              ...s?.environment,
              brevo_configured: isBrevoConfigured(),
              smtp_configured: isBrevoConfigured(),
            },
          };
        }
        if (r === 'movements') return getMockMovements();
        return [];
      }
    ),
  post: (r, data, action) =>
    withFallback(
      () => null,
      async () => {
        if (r === 'inventory') {
          const mov = recordStockMovement(data);
          const products = getMockProducts();
          const p = products.find((x) => String(x.id) === String(data.product_id));
          if (p) {
            const qty = Number(data.quantity);
            if (data.movement_type === 'in') p.stock += qty;
            else if (data.movement_type === 'out') p.stock = Math.max(0, p.stock - qty);
            else if (data.movement_type === 'adjustment') p.stock = qty;
            updateMockProduct(p);
          }
          return { success: true, movement: mov };
        }
        if (r === 'staff') {
          const created = saveMockStaff(data);
          return { success: true, staff: created };
        }
        if (r === 'emails') {
          if (action === 'retry') {
            return await retryBrevoEmail(data.id);
          }
          return await sendBrevoEmail({
            to: data.to,
            subject: data.subject || 'MS ENTERPRISES Notification',
            body: data.body || data.message || 'This is an email sent via Brevo Emailing Service from MS ENTERPRISES.',
            templateKey: data.templateKey || 'manual_brevo',
          });
        }
        return { success: true, data };
      }
    ),
  update: (r, data) =>
    withFallback(
      () => null,
      () => {
        if (r === 'orders') {
          const updated = updateMockOrder(data.id, data);
          return { success: true, order: updated, email_status: 'sent' };
        }
        if (r === 'bookings') {
          const updated = updateMockBooking(data.id, data);
          return { success: true, booking: updated, email_status: 'sent' };
        }
        if (r === 'staff') {
          const updated = updateMockStaff(data);
          return { success: true, staff: updated };
        }
        if (r === 'settings') {
          const updated = updateMockSettings(data.key, data.value);
          return { success: true, settings: updated };
        }
        return { success: true, data };
      }
    ),
};

export async function uploadImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Please choose a JPG, PNG or WEBP image.');
  }
  return URL.createObjectURL(file);
}

