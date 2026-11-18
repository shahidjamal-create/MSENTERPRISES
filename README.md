# MS ENTERPRISES — Mobile Repair & Accessories Store

Customer website and business management system for **MS ENTERPRISES**.

- Phone: 8088298447 · Email: Mohammedafiz447@gmail.com · WhatsApp: https://wa.me/918088298447

## What's included

**Customer site:** Home, About, Repair Services, Tempered Glass, Mobile Pouches, Accessories, All Products, Product Details,
Cart, Checkout (Cash on Delivery), Login / Register / Forgot & Reset Password, My Account, My Orders (+ printable invoice),
My Repairs, Wishlist, Repair Booking, Repair Tracking and Contact.

**Admin panel (`/admin`):** Dashboard, Products, Categories, Brands, Models, Tempered Glass, Pouches, Accessories,
Repair Services, Repair Bookings, Orders, Customers, Inventory, Suppliers, Staff, Email Management, Enquiries & Reviews,
Reports and Settings.

### Key rules enforced on the server
- **Compatibility:** tempered glass and pouches are only shown publicly when at least one *verified* model is assigned.
  Selecting a model in the shop returns only products mapped to that model (plus accessories flagged "universal").
- **Stock:** orders validate stock and deduct it with an optimistic-concurrency update (no overselling). Failed orders roll back.
  Cancelling an order returns stock. Every change is written to `stock_movements`.
- **Roles:** Super Admin, Admin, Manager, Technician, Inventory Staff, Customer. Each API route checks permissions
  (`api/_lib/auth.js`); the frontend only hides menu items.
- **Email:** every notification is rendered from an editable template and logged in `email_logs` with its real status
  (`sent`, `failed`, `not_configured`, `disabled`). Nothing is reported as sent unless SMTP accepted it. Failed or unsent
  messages can be retried from the admin panel.

## Tech stack (as deployed)

The original brief asked for FastAPI + MongoDB Atlas + Cloudinary. This hosting environment runs Node serverless functions
with Postgres, so the same architecture is implemented with:

| Brief | This project |
|---|---|
| React + Vite + Tailwind + React Router + Lucide + Axios + Recharts | Same (JavaScript/JSX) |
| FastAPI REST API | Vercel serverless functions in `api/` (Node) |
| MongoDB collections | Supabase Postgres tables (same names; foreign keys for relationships) |
| JWT auth + password hashing | Supabase Auth (bcrypt hashing, JWT access + refresh tokens), verified server-side |
| Cloudinary | Supabase Storage bucket `product-images` |
| Email notifications | Brevo Transactional Email Service (v3 API & SMTP relay) |

## Project structure

```
api/                    Serverless backend
  _lib/                 Shared helpers (not exposed as routes)
    auth.js             Token verification, roles, permission map
    email.js            Template rendering, SMTP delivery, email logging
    inventory.js        Atomic stock changes + movement log
    products.js         Product shaping & visibility rules
    validate.js         Input validation
    http.js             CORS, error handling
  auth.js               register / login / refresh / forgot / reset / profile
  catalog.js            Public catalogue (products, brands, models, services, settings)
  orders.js             Checkout, my orders, cancel
  bookings.js           Repair booking, tracking, my repairs
  contact.js            Enquiries and reviews
  admin.js              Catalogue CRUD, customers, enquiries, reviews, dashboard, reports
  admin-ops.js          Orders, bookings, inventory, staff, emails, templates, settings
  upload.js             Product image upload
src/
  admin/                Admin pages
  components/           Shared UI (header, footer, product card, model picker, ui/*)
  context/              Auth, cart/wishlist, toasts
  hooks/                useAsync, usePublicSettings
  layouts/              Customer and account layouts
  pages/                Customer pages
  services/api.js       Axios client and API functions
  utils/                Constants, formatting, icons
```

## Database tables

`profiles` (users + role), `categories`, `mobile_brands`, `mobile_models`, `products`, `product_compatibility`,
`orders`, `order_items`, `repair_services`, `repair_bookings`, `stock_movements`, `suppliers`, `enquiries`,
`email_logs`, `email_templates`, `settings`, `reviews`.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the Supabase values. **Never** put `SUPABASE_SERVICE_ROLE_KEY` or SMTP
   credentials in a `VITE_` variable — those are bundled into the browser.
3. Local development with API routes: `npx vercel dev` (or deploy to Vercel). `npm run dev` serves only the frontend.
4. `npm run build` to produce `dist/`.

### Enabling real email delivery (Brevo Emailing Service)
Set your Brevo API key in the Admin Panel (**Admin → Email Management → Brevo Settings**) or configure environment variables:

```
BREVO_API_KEY=<your-brevo-v3-api-key>
BREVO_SENDER_NAME=MS ENTERPRISES
BREVO_SENDER_EMAIL=mohammedafiz447@gmail.com
```

Or configure Brevo SMTP Relay:
```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=mohammedafiz447@gmail.com
SMTP_PASS=<your-brevo-smtp-key>
SMTP_FROM=mohammedafiz447@gmail.com
```

Then open **Admin → Email Management**, send a test email, and press **Retry** on any `not_configured` entries.

### Online payments
Checkout currently offers Cash on Delivery. The UPI/Razorpay option shows as unavailable until `RAZORPAY_KEY_ID` is set;
a Razorpay order/verification route must be added before enabling it. Card details are never stored.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@msenterprises.in | Admin@12345 |
| Technician | technician@msenterprises.in | Tech@12345 |
| Customer | customer@example.com | password123 |

Change these passwords before going live.

## Sample data
Brands, models, categories, repair services and email templates are real configuration. The 24 products are
**sample listings** (`is_sample = true`) — they show a "Sample listing" label in the store and the dashboard warns about them.
Edit or delete them before launch. No orders, customers, reviews or sales figures are pre-filled.
