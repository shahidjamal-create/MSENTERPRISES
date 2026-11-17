// Admin: catalogue management, customers, enquiries, reviews, dashboard and reports.
import supabase from './db-client.js';
import { withApi, HttpError, readBody, check, notAllowed } from './_lib/http.js';
import { requirePermission } from './_lib/auth.js';
import { PRODUCT_SELECT, PRODUCT_TYPES, shapeProduct, needsCompatibility } from './_lib/products.js';
import { logMovement } from './_lib/inventory.js';
import * as v from './_lib/validate.js';

const optionalText = (value, label, max = 300) => v.text(value, label, { required: false, max });

// Simple tables that only need list/create/update/delete.
const SIMPLE_RESOURCES = {
  categories: {
    table: 'categories',
    permission: 'catalog',
    order: 'sort_order',
    unique: 'slug',
    fields: (b) => ({
      name: v.text(b.name, 'Name', { max: 80 }),
      slug: v.slugify(b.slug || b.name),
      kind: v.oneOf(b.kind, 'Product type', PRODUCT_TYPES),
      description: optionalText(b.description, 'Description', 400),
      sort_order: v.number(b.sort_order ?? 0, 'Sort order', { integer: true, max: 999 }),
      is_active: b.is_active !== false,
    }),
  },
  brands: {
    table: 'mobile_brands',
    permission: 'catalog',
    order: 'sort_order',
    unique: 'slug',
    fields: (b) => ({
      name: v.text(b.name, 'Brand name', { max: 40 }),
      slug: v.slugify(b.slug || b.name),
      sort_order: v.number(b.sort_order ?? 0, 'Sort order', { integer: true, max: 999 }),
      is_active: b.is_active !== false,
    }),
  },
  models: {
    table: 'mobile_models',
    permission: 'catalog',
    order: 'name',
    select: '*, mobile_brands(id,name)',
    filter: (query, q) => (q.brand_id ? query.eq('brand_id', Number(q.brand_id)) : query),
    fields: (b) => ({
      brand_id: v.id(b.brand_id, 'Brand'),
      name: v.text(b.name, 'Model name', { max: 80 }),
      slug: v.slugify(b.name),
      release_year: v.number(b.release_year, 'Release year', { required: false, min: 2000, max: 2100, integer: true }),
      is_active: b.is_active !== false,
    }),
  },
  suppliers: {
    table: 'suppliers',
    permission: 'suppliers',
    order: 'name',
    fields: (b) => ({
      name: v.text(b.name, 'Supplier name', { max: 100 }),
      contact_person: optionalText(b.contact_person, 'Contact person', 80),
      phone: v.phone(b.phone, 'Phone', { required: false }),
      email: v.email(b.email, 'Email', { required: false }),
      address: optionalText(b.address, 'Address'),
      gstin: optionalText(b.gstin, 'GSTIN', 15),
      notes: optionalText(b.notes, 'Notes', 500),
    }),
  },
  services: {
    table: 'repair_services',
    permission: 'catalog',
    order: 'sort_order',
    unique: 'slug',
    fields: (b) => ({
      name: v.text(b.name, 'Service name', { max: 80 }),
      slug: v.slugify(b.slug || b.name),
      description: optionalText(b.description, 'Description', 500),
      price_from: v.number(b.price_from, 'Starting price', { required: false, max: 100000 }),
      duration: optionalText(b.duration, 'Typical duration', 60),
      sort_order: v.number(b.sort_order ?? 0, 'Sort order', { integer: true, max: 999 }),
      is_active: b.is_active !== false,
    }),
  },
};

async function assertUnique(table, column, value, excludeId) {
  let query = supabase.from(table).select('id').eq(column, value).limit(1);
  if (excludeId) query = query.neq('id', excludeId);
  const rows = check(await query);
  if (rows.length) throw new HttpError(409, `Another record already uses this ${column === 'sku' ? 'SKU' : 'name'} ("${value}").`);
}

async function handleSimple(req, res, config) {
  await requirePermission(req, config.permission);
  const body = readBody(req);

  if (req.method === 'GET') {
    let query = supabase.from(config.table).select(config.select || '*').order(config.order);
    if (config.filter) query = config.filter(query, req.query);
    return res.status(200).json(check(await query));
  }
  if (req.method === 'POST') {
    const record = config.fields(body);
    if (config.unique) await assertUnique(config.table, config.unique, record[config.unique]);
    return res.status(201).json(check(await supabase.from(config.table).insert(record).select().single()));
  }
  if (req.method === 'PUT') {
    const recordId = v.id(body.id);
    const record = config.fields(body);
    if (config.unique) await assertUnique(config.table, config.unique, record[config.unique], recordId);
    return res.status(200).json(check(await supabase.from(config.table).update(record).eq('id', recordId).select().single()));
  }
  if (req.method === 'DELETE') {
    check(await supabase.from(config.table).delete().eq('id', v.id(req.query.id)));
    return res.status(200).json({ ok: true });
  }
  return notAllowed();
}

// ---------- Products ----------
async function productFields(b) {
  const type = v.oneOf(b.product_type, 'Product type', PRODUCT_TYPES);
  const mrp = v.number(b.mrp, 'MRP', { min: 1, max: 500000 });
  const price = v.number(b.price, 'Selling price', { min: 1, max: 500000 });
  if (price > mrp) throw new HttpError(400, 'Selling price cannot be higher than MRP.');

  const categoryId = v.id(b.category_id, 'Category');
  const category = check(await supabase.from('categories').select('id,kind').eq('id', categoryId).maybeSingle());
  if (!category) throw new HttpError(400, 'Selected category does not exist.');
  if (category.kind !== type) throw new HttpError(400, 'Category does not match the product type.');

  const sku = v.text(b.sku, 'SKU', { min: 3, max: 40 }).toUpperCase().replace(/\s+/g, '-');
  const name = v.text(b.name, 'Product name', { min: 3, max: 140 });
  return {
    name,
    slug: `${v.slugify(name)}-${sku.toLowerCase()}`.slice(0, 180),
    product_type: type,
    category_id: categoryId,
    brand_id: b.brand_id ? v.id(b.brand_id, 'Brand') : null,
    variant_type: optionalText(b.variant_type, 'Type', 40),
    sku,
    mrp,
    price,
    low_stock_threshold: v.number(b.low_stock_threshold ?? 5, 'Low stock alert level', { integer: true, max: 1000 }),
    image_url: optionalText(b.image_url, 'Image URL', 600),
    description: optionalText(b.description, 'Description', 3000),
    supplier_id: b.supplier_id ? v.id(b.supplier_id, 'Supplier') : null,
    is_active: b.is_active !== false,
    is_featured: v.bool(b.is_featured),
    is_universal: needsCompatibility(type) ? false : v.bool(b.is_universal),
  };
}

async function syncCompatibility(productId, modelIds) {
  const ids = [...new Set((Array.isArray(modelIds) ? modelIds : []).map(Number).filter(Number.isInteger))];
  check(await supabase.from('product_compatibility').delete().eq('product_id', productId));
  if (ids.length) {
    check(await supabase.from('product_compatibility').insert(ids.map((model_id) => ({ product_id: productId, model_id, verified: true }))));
  }
}

async function handleProducts(req, res) {
  const user = await requirePermission(req, 'products');
  const body = readBody(req);

  if (req.method === 'GET') {
    let query = supabase.from('products').select(PRODUCT_SELECT).order('id', { ascending: false });
    if (req.query.type) query = query.eq('product_type', req.query.type);
    const rows = check(await query).map(shapeProduct);
    return res.status(200).json(rows.map((p) => ({ ...p, model_ids: p.compatible_models.map((m) => m.id) })));
  }
  if (req.method === 'POST') {
    const record = await productFields(body);
    await assertUnique('products', 'sku', record.sku);
    const openingStock = v.number(body.stock ?? 0, 'Opening stock', { integer: true, max: 100000 });
    const product = check(await supabase.from('products').insert({ ...record, stock: openingStock, is_sample: false }).select().single());
    await syncCompatibility(product.id, body.model_ids);
    if (openingStock > 0) {
      await logMovement({ product_id: product.id, movement_type: 'in', quantity: openingStock, stock_after: openingStock, supplier_id: record.supplier_id, note: 'Opening stock', created_by: user.email });
    }
    return res.status(201).json(product);
  }
  if (req.method === 'PUT') {
    const productId = v.id(body.id);
    // Quick toggle (active / featured) without resubmitting the full form.
    if (body.toggle) {
      const field = v.oneOf(body.toggle, 'Field', ['is_active', 'is_featured']);
      return res.status(200).json(check(await supabase.from('products').update({ [field]: v.bool(body.value) }).eq('id', productId).select().single()));
    }
    const record = await productFields(body);
    await assertUnique('products', 'sku', record.sku, productId);
    const product = check(await supabase.from('products').update(record).eq('id', productId).select().single());
    await syncCompatibility(productId, body.model_ids);
    return res.status(200).json(product);
  }
  if (req.method === 'DELETE') {
    check(await supabase.from('products').delete().eq('id', v.id(req.query.id)));
    return res.status(200).json({ ok: true });
  }
  return notAllowed();
}

// ---------- Customers / enquiries / reviews ----------
async function handleCustomers(req, res) {
  await requirePermission(req, 'customers');
  if (req.method === 'GET') {
    const [customers, orders] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false }),
      supabase.from('orders').select('user_id,total,status'),
    ]);
    const stats = {};
    for (const o of check(orders)) {
      const s = (stats[o.user_id] ||= { orders: 0, spent: 0 });
      s.orders += 1;
      if (o.status !== 'cancelled') s.spent += Number(o.total);
    }
    return res.status(200).json(check(customers).map((c) => ({ ...c, order_count: stats[c.id]?.orders || 0, total_spent: stats[c.id]?.spent || 0 })));
  }
  if (req.method === 'PUT') {
    const body = readBody(req);
    const data = check(
      await supabase.from('profiles').update({ is_active: v.bool(body.is_active) }).eq('id', String(body.id)).eq('role', 'customer').select().single()
    );
    return res.status(200).json(data);
  }
  return notAllowed();
}

async function handleEnquiries(req, res) {
  await requirePermission(req, 'enquiries');
  if (req.method === 'GET') {
    return res.status(200).json(check(await supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(300)));
  }
  if (req.method === 'PUT') {
    const body = readBody(req);
    const status = v.oneOf(body.status, 'Status', ['new', 'in_progress', 'resolved']);
    return res.status(200).json(check(await supabase.from('enquiries').update({ status }).eq('id', v.id(body.id)).select().single()));
  }
  return notAllowed();
}

async function handleReviews(req, res) {
  await requirePermission(req, 'enquiries');
  if (req.method === 'GET') {
    return res.status(200).json(check(await supabase.from('reviews').select('*').order('created_at', { ascending: false })));
  }
  if (req.method === 'PUT') {
    const body = readBody(req);
    return res.status(200).json(check(await supabase.from('reviews').update({ is_approved: v.bool(body.is_approved) }).eq('id', v.id(body.id)).select().single()));
  }
  if (req.method === 'DELETE') {
    check(await supabase.from('reviews').delete().eq('id', v.id(req.query.id)));
    return res.status(200).json({ ok: true });
  }
  return notAllowed();
}

// ---------- Dashboard & reports ----------
const countOf = async (query) => {
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
};

const dayKey = (iso) => new Date(new Date(iso).getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

function dailySeries(orders, days) {
  const series = [];
  const today = new Date(Date.now() + 5.5 * 3600 * 1000);
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    series.push({ date: d.toISOString().slice(0, 10), revenue: 0, orders: 0 });
  }
  const index = new Map(series.map((s) => [s.date, s]));
  for (const o of orders) {
    const bucket = index.get(dayKey(o.created_at));
    if (bucket && o.status !== 'cancelled') {
      bucket.revenue += Number(o.total);
      bucket.orders += 1;
    }
  }
  return series;
}

async function dashboard(req, res) {
  await requirePermission(req, 'dashboard');
  const since = new Date(Date.now() - 14 * 86400000).toISOString();
  const [orders, productCount, customerCount, bookingCount, pendingRepairs, products, recentOrders, recentBookings, enquiries, sampleCount, recentWindow] =
    await Promise.all([
      supabase.from('orders').select('total,status'),
      countOf(supabase.from('products').select('id', { count: 'exact', head: true })),
      countOf(supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer')),
      countOf(supabase.from('repair_bookings').select('id', { count: 'exact', head: true })),
      countOf(supabase.from('repair_bookings').select('id', { count: 'exact', head: true }).not('status', 'in', '("Completed","Delivered","Cancelled")')),
      supabase.from('products').select('id,name,sku,stock,low_stock_threshold,is_active').eq('is_active', true),
      supabase.from('orders').select('id,order_number,customer_name,total,status,created_at').order('created_at', { ascending: false }).limit(6),
      supabase.from('repair_bookings').select('id,booking_code,customer_name,brand_name,model_name,service_name,status,appointment_date').order('created_at', { ascending: false }).limit(6),
      supabase.from('enquiries').select('id,name,subject,status,created_at').order('created_at', { ascending: false }).limit(5),
      countOf(supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_sample', true)),
      supabase.from('orders').select('total,status,created_at').gte('created_at', since),
    ]);

  const orderRows = check(orders);
  const lowStock = check(products).filter((p) => p.stock <= p.low_stock_threshold).sort((a, b) => a.stock - b.stock);
  return res.status(200).json({
    totals: {
      revenue: orderRows.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0),
      orders: orderRows.length,
      products: productCount,
      customers: customerCount,
      bookings: bookingCount,
      pending_repairs: pendingRepairs,
      low_stock: lowStock.length,
      sample_products: sampleCount,
    },
    sales: dailySeries(check(recentWindow), 14),
    recent_orders: check(recentOrders),
    recent_bookings: check(recentBookings),
    enquiries: check(enquiries),
    stock_alerts: lowStock.slice(0, 8),
  });
}

async function reports(req, res) {
  await requirePermission(req, 'reports');
  const from = v.date(req.query.from, 'From date');
  const to = v.date(req.query.to, 'To date');
  if (from > to) throw new HttpError(400, '"From" date must be before "To" date.');
  const start = new Date(`${from}T00:00:00+05:30`).toISOString();
  const end = new Date(`${to}T23:59:59+05:30`).toISOString();

  const [orders, bookings, products] = await Promise.all([
    supabase.from('orders').select('id,order_number,customer_name,total,status,payment_status,created_at, order_items(product_name,quantity,line_total)').gte('created_at', start).lte('created_at', end).order('created_at'),
    supabase.from('repair_bookings').select('status,service_name').gte('created_at', start).lte('created_at', end),
    supabase.from('products').select('stock,price,product_type').eq('is_active', true),
  ]);
  const orderRows = check(orders);
  const valid = orderRows.filter((o) => o.status !== 'cancelled');

  const topMap = {};
  for (const o of valid) {
    for (const item of o.order_items) {
      const t = (topMap[item.product_name] ||= { name: item.product_name, quantity: 0, revenue: 0 });
      t.quantity += item.quantity;
      t.revenue += Number(item.line_total);
    }
  }
  const tally = (rows, key) => Object.entries(rows.reduce((acc, r) => ({ ...acc, [r[key]]: (acc[r[key]] || 0) + 1 }), {})).map(([name, value]) => ({ name, value }));

  const days = Math.min(Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1, 366);
  const byDay = {};
  for (const o of valid) {
    const k = dayKey(o.created_at);
    byDay[k] = (byDay[k] || 0) + Number(o.total);
  }
  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(`${from}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { date: key, revenue: byDay[key] || 0 };
  });

  const productRows = check(products);
  return res.status(200).json({
    summary: {
      revenue: valid.reduce((s, o) => s + Number(o.total), 0),
      orders: orderRows.length,
      cancelled: orderRows.length - valid.length,
      average_order: valid.length ? valid.reduce((s, o) => s + Number(o.total), 0) / valid.length : 0,
      bookings: check(bookings).length,
      stock_value: productRows.reduce((s, p) => s + p.stock * Number(p.price), 0),
      units_in_stock: productRows.reduce((s, p) => s + p.stock, 0),
    },
    series,
    orders_by_status: tally(orderRows, 'status'),
    bookings_by_status: tally(check(bookings), 'status'),
    bookings_by_service: tally(check(bookings), 'service_name'),
    top_products: Object.values(topMap).sort((a, b) => b.quantity - a.quantity).slice(0, 10),
    orders: orderRows.map(({ order_items, ...o }) => ({ ...o, items: order_items.length })),
  });
}

export default withApi(async (req, res) => {
  const { r } = req.query;
  if (SIMPLE_RESOURCES[r]) return handleSimple(req, res, SIMPLE_RESOURCES[r]);
  switch (r) {
    case 'products': return handleProducts(req, res);
    case 'customers': return handleCustomers(req, res);
    case 'enquiries': return handleEnquiries(req, res);
    case 'reviews': return handleReviews(req, res);
    case 'dashboard': return req.method === 'GET' ? dashboard(req, res) : notAllowed();
    case 'reports': return req.method === 'GET' ? reports(req, res) : notAllowed();
    default: throw new HttpError(404, 'Unknown resource');
  }
});
