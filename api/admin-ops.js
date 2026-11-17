// Admin: orders, repair bookings, inventory, staff, email management and settings.
import supabase from './db-client.js';
import { withApi, HttpError, readBody, check, notAllowed } from './_lib/http.js';
import { requirePermission, can, STAFF_ROLES } from './_lib/auth.js';
import { changeStock, logMovement } from './_lib/inventory.js';
import { sendTemplate, deliver, sendRaw, smtpConfigured, getSetting } from './_lib/email.js';
import * as v from './_lib/validate.js';

const money = (n) => `Rs. ${Number(n).toFixed(2)}`;
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'refunded', 'failed'];
const BOOKING_STATUSES = ['Pending', 'Accepted', 'Diagnosis', 'Waiting for Parts', 'Repair in Progress', 'Completed', 'Delivered', 'Cancelled'];
const CLOSED_BOOKING = ['Delivered', 'Cancelled'];

// ---------- Orders ----------
async function handleOrders(req, res) {
  const user = await requirePermission(req, 'orders');
  if (req.method === 'GET') {
    let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(500);
    if (req.query.status) query = query.eq('status', req.query.status);
    return res.status(200).json(check(await query));
  }
  if (req.method !== 'PUT') return notAllowed();

  const body = readBody(req);
  const orderId = v.id(body.id, 'Order');
  const order = check(await supabase.from('orders').select('*, order_items(*)').eq('id', orderId).maybeSingle());
  if (!order) throw new HttpError(404, 'Order not found.');

  const status = v.oneOf(body.status || order.status, 'Order status', ORDER_STATUSES);
  const paymentStatus = v.oneOf(body.payment_status || order.payment_status, 'Payment status', PAYMENT_STATUSES);
  const note = v.text(body.note, 'Note', { required: false, max: 200 });
  const statusChanged = status !== order.status;

  if (statusChanged && ['completed', 'cancelled'].includes(order.status)) {
    throw new HttpError(409, `This order is already ${order.status} and its status cannot be changed.`);
  }
  const history = [...(order.status_history || [])];
  if (statusChanged) history.push({ status, at: new Date().toISOString(), note: note || `Updated by ${user.full_name || user.email}` });

  const updated = check(
    await supabase.from('orders').update({ status, payment_status: paymentStatus, status_history: history }).eq('id', orderId).select().single()
  );

  if (statusChanged && status === 'cancelled') {
    for (const item of order.order_items) {
      if (!item.product_id) continue;
      const result = await changeStock(item.product_id, { delta: item.quantity });
      await logMovement({ product_id: item.product_id, movement_type: 'cancel_return', quantity: item.quantity, stock_after: result.after, reference: order.order_number, created_by: user.email });
    }
  }

  let email = null;
  if (statusChanged) {
    const items = order.order_items.map((i) => `- ${i.product_name} x ${i.quantity}`).join('\n');
    email = await sendTemplate(
      'order_status',
      order.email,
      { order_number: order.order_number, customer_name: order.customer_name, status, total: money(order.total), items },
      { type: 'order', id: order.order_number }
    );
  }
  return res.status(200).json({ order: updated, email_status: email?.status || null });
}

// ---------- Repair bookings ----------
async function handleBookings(req, res) {
  const user = await requirePermission(req, 'bookings');
  if (req.method === 'GET') {
    let query = supabase.from('repair_bookings').select('*').order('created_at', { ascending: false }).limit(500);
    if (req.query.status) query = query.eq('status', req.query.status);
    if (user.role === 'technician' && req.query.mine === '1') query = query.eq('technician_id', user.id);
    return res.status(200).json(check(await query));
  }
  if (req.method !== 'PUT') return notAllowed();

  const body = readBody(req);
  const bookingId = v.id(body.id, 'Booking');
  const booking = check(await supabase.from('repair_bookings').select('*').eq('id', bookingId).maybeSingle());
  if (!booking) throw new HttpError(404, 'Booking not found.');

  const isTechnician = user.role === 'technician';
  if (isTechnician && booking.technician_id && booking.technician_id !== user.id) {
    throw new HttpError(403, 'This booking is assigned to another technician.');
  }

  const status = v.oneOf(body.status || booking.status, 'Status', BOOKING_STATUSES);
  if (status !== booking.status && CLOSED_BOOKING.includes(booking.status)) {
    throw new HttpError(409, `This booking is already ${booking.status}.`);
  }
  const changes = {
    status,
    admin_notes: v.text(body.admin_notes, 'Internal notes', { required: false, max: 1000 }),
    estimated_cost: v.number(body.estimated_cost, 'Estimated cost', { required: false, max: 200000 }),
  };

  // Only managers and above can (re)assign technicians; a technician picking up
  // an unassigned job is assigned to themselves.
  if (!isTechnician && body.technician_id !== undefined) {
    if (body.technician_id) {
      const tech = check(await supabase.from('profiles').select('id,full_name,email,role').eq('id', String(body.technician_id)).maybeSingle());
      if (!tech || !STAFF_ROLES.includes(tech.role)) throw new HttpError(400, 'Selected technician is not a staff member.');
      changes.technician_id = tech.id;
      changes.technician_name = tech.full_name || tech.email;
    } else {
      changes.technician_id = null;
      changes.technician_name = null;
    }
  } else if (isTechnician && !booking.technician_id) {
    changes.technician_id = user.id;
    changes.technician_name = user.full_name || user.email;
  }

  const statusChanged = status !== booking.status;
  if (statusChanged) {
    const note = v.text(body.note, 'Status note', { required: false, max: 200 });
    changes.status_history = [...(booking.status_history || []), { status, at: new Date().toISOString(), note: note || '' }];
  }
  const updated = check(await supabase.from('repair_bookings').update(changes).eq('id', bookingId).select().single());

  let email = null;
  if (statusChanged) {
    email = await sendTemplate(
      'booking_status',
      booking.email,
      {
        booking_id: booking.booking_code,
        customer_name: booking.customer_name,
        device: `${booking.brand_name} ${booking.model_name}`,
        service: booking.service_name,
        status,
        estimated_cost: changes.estimated_cost != null ? money(changes.estimated_cost) : 'To be confirmed',
      },
      { type: 'booking', id: booking.booking_code }
    );
  }
  return res.status(200).json({ booking: updated, email_status: email?.status || null });
}

async function handleTechnicians(req, res) {
  await requirePermission(req, 'bookings');
  const data = check(await supabase.from('profiles').select('id,full_name,email,role').in('role', ['technician', 'manager', 'admin', 'super_admin']).eq('is_active', true).order('full_name'));
  return res.status(200).json(data);
}

// ---------- Inventory ----------
async function handleInventory(req, res) {
  const user = await requirePermission(req, 'inventory');
  if (req.method === 'GET') {
    const data = check(await supabase.from('products').select('id,name,sku,product_type,stock,low_stock_threshold,price,is_active,supplier_id,suppliers(name)').order('stock'));
    return res.status(200).json(data);
  }
  if (req.method !== 'POST') return notAllowed();

  const body = readBody(req);
  const productId = v.id(body.product_id, 'Product');
  const type = v.oneOf(body.movement_type, 'Movement type', ['in', 'out', 'adjustment']);
  const quantity = v.number(body.quantity, type === 'adjustment' ? 'Counted stock' : 'Quantity', { min: type === 'adjustment' ? 0 : 1, max: 100000, integer: true });
  const note = v.text(body.note, 'Note', { required: type !== 'in', max: 300 });
  const supplierId = body.supplier_id ? v.id(body.supplier_id, 'Supplier') : null;

  const result =
    type === 'adjustment'
      ? await changeStock(productId, { exact: quantity })
      : await changeStock(productId, { delta: type === 'in' ? quantity : -quantity });

  await logMovement({
    product_id: productId,
    movement_type: type,
    quantity: result.after - result.before,
    stock_after: result.after,
    supplier_id: supplierId,
    reference: v.text(body.reference, 'Reference', { required: false, max: 60 }),
    note,
    created_by: user.email,
  });
  return res.status(201).json({ product_id: productId, before: result.before, after: result.after });
}

async function handleMovements(req, res) {
  await requirePermission(req, 'inventory');
  let query = supabase.from('stock_movements').select('*, products(name,sku), suppliers(name)').order('created_at', { ascending: false }).limit(300);
  if (req.query.product_id) query = query.eq('product_id', Number(req.query.product_id));
  return res.status(200).json(check(await query));
}

// ---------- Staff ----------
async function handleStaff(req, res) {
  const user = await requirePermission(req, 'staff');
  const body = readBody(req);
  const assertRoleAllowed = (role) => {
    v.oneOf(role, 'Role', STAFF_ROLES);
    if (role === 'super_admin' && user.role !== 'super_admin') throw new HttpError(403, 'Only a Super Admin can grant Super Admin access.');
  };

  if (req.method === 'GET') {
    return res.status(200).json(check(await supabase.from('profiles').select('*').neq('role', 'customer').order('created_at')));
  }
  if (req.method === 'POST') {
    const role = body.role;
    assertRoleAllowed(role);
    const email = v.email(body.email);
    const fullName = v.text(body.full_name, 'Full name', { min: 2, max: 80 });
    const password = v.text(body.password, 'Temporary password', { min: 8, max: 72 });
    const phone = v.phone(body.phone, 'Phone', { required: false });
    const created = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName } });
    if (created.error) {
      if (/already|registered|exists/i.test(created.error.message)) throw new HttpError(409, 'A user with this email already exists.');
      throw created.error;
    }
    const profile = check(
      await supabase.from('profiles').upsert({ id: created.data.user.id, email, full_name: fullName, phone, role, is_active: true }).select().single()
    );
    return res.status(201).json(profile);
  }
  if (req.method === 'PUT') {
    const targetId = String(body.id || '');
    if (targetId === user.id) throw new HttpError(400, 'You cannot change your own role or status.');
    const target = check(await supabase.from('profiles').select('*').eq('id', targetId).maybeSingle());
    if (!target || target.role === 'customer') throw new HttpError(404, 'Staff member not found.');
    if (target.role === 'super_admin' && user.role !== 'super_admin') throw new HttpError(403, 'Only a Super Admin can modify another Super Admin.');

    const changes = { is_active: body.is_active !== false };
    if (body.role) {
      if (body.role === 'customer') changes.role = 'customer';
      else {
        assertRoleAllowed(body.role);
        changes.role = body.role;
      }
    }
    return res.status(200).json(check(await supabase.from('profiles').update(changes).eq('id', targetId).select().single()));
  }
  return notAllowed();
}

// ---------- Email management ----------
async function handleEmails(req, res) {
  await requirePermission(req, 'emails');
  const body = readBody(req);

  if (req.method === 'GET') {
    let query = supabase.from('email_logs').select('*').order('created_at', { ascending: false }).limit(300);
    if (req.query.status) query = query.eq('status', req.query.status);
    return res.status(200).json({ smtp_configured: smtpConfigured(), logs: check(await query) });
  }
  if (req.method !== 'POST') return notAllowed();

  if (req.query.action === 'retry') {
    const log = check(await supabase.from('email_logs').select('*').eq('id', v.id(body.id)).maybeSingle());
    if (!log) throw new HttpError(404, 'Email log not found.');
    if (!['failed', 'not_configured'].includes(log.status)) throw new HttpError(409, 'Only failed or unsent emails can be retried.');
    return res.status(200).json(await deliver(log));
  }
  if (req.query.action === 'test') {
    const to = v.email(body.to, 'Recipient email');
    const log = await sendRaw(to, 'MS ENTERPRISES test email', 'This is a test email from the MS ENTERPRISES admin panel.\nIf you received it, outgoing email is working.');
    return res.status(200).json(log);
  }
  throw new HttpError(404, 'Unknown action');
}

async function handleTemplates(req, res) {
  await requirePermission(req, 'emails');
  if (req.method === 'GET') return res.status(200).json(check(await supabase.from('email_templates').select('*').order('id')));
  if (req.method !== 'PUT') return notAllowed();
  const body = readBody(req);
  const changes = {
    subject: v.text(body.subject, 'Subject', { max: 200 }),
    body: v.text(body.body, 'Body', { min: 10, max: 5000 }),
    is_enabled: body.is_enabled !== false,
    updated_at: new Date().toISOString(),
  };
  return res.status(200).json(check(await supabase.from('email_templates').update(changes).eq('id', v.id(body.id)).select().single()));
}

// ---------- Settings ----------
const SETTINGS_SCHEMA = {
  email: (b) => ({
    business_recipient: v.email(b.business_recipient, 'Business recipient email'),
    sender_name: v.text(b.sender_name, 'Sender name', { max: 60 }),
    notify_enquiry: b.notify_enquiry !== false,
    notify_booking: b.notify_booking !== false,
    notify_order: b.notify_order !== false,
  }),
  store: (b) => ({
    shipping_fee: v.number(b.shipping_fee, 'Shipping fee', { max: 5000 }),
    free_shipping_above: v.number(b.free_shipping_above, 'Free shipping threshold', { max: 100000 }),
    cod_enabled: b.cod_enabled !== false,
  }),
  booking: (b) => {
    const slots = (Array.isArray(b.time_slots) ? b.time_slots : []).map((s) => String(s).trim()).filter(Boolean);
    if (!slots.length) throw new HttpError(400, 'Add at least one time slot.');
    if (slots.some((s) => s.length > 40)) throw new HttpError(400, 'Time slot labels must be under 40 characters.');
    return { time_slots: slots, max_days_ahead: v.number(b.max_days_ahead, 'Booking window (days)', { min: 1, max: 180, integer: true }) };
  },
};

async function handleSettings(req, res) {
  const user = await requirePermission(req, 'dashboard');
  if (req.method === 'GET') {
    const [email, store, booking] = await Promise.all([getSetting('email'), getSetting('store'), getSetting('booking')]);
    return res.status(200).json({
      email,
      store,
      booking,
      environment: { smtp_configured: smtpConfigured(), payment_gateway_configured: Boolean(process.env.RAZORPAY_KEY_ID) },
    });
  }
  if (req.method !== 'PUT') return notAllowed();
  const body = readBody(req);
  const key = v.oneOf(body.key, 'Settings group', Object.keys(SETTINGS_SCHEMA));
  if (!can(user, key === 'email' ? 'emails' : 'settings')) throw new HttpError(403, 'You do not have permission to change these settings.');
  const value = SETTINGS_SCHEMA[key](body.value || {});
  const existing = check(await supabase.from('settings').select('id').eq('key', key).maybeSingle());
  if (existing) check(await supabase.from('settings').update({ value }).eq('id', existing.id));
  else check(await supabase.from('settings').insert({ key, value }));
  return res.status(200).json({ key, value });
}

export default withApi(async (req, res) => {
  switch (req.query.r) {
    case 'orders': return handleOrders(req, res);
    case 'bookings': return handleBookings(req, res);
    case 'technicians': return handleTechnicians(req, res);
    case 'inventory': return handleInventory(req, res);
    case 'movements': return handleMovements(req, res);
    case 'staff': return handleStaff(req, res);
    case 'emails': return handleEmails(req, res);
    case 'templates': return handleTemplates(req, res);
    case 'settings': return handleSettings(req, res);
    default: throw new HttpError(404, 'Unknown resource');
  }
});
