import supabase from './db-client.js';
import { withApi, HttpError, readBody, check, notAllowed } from './_lib/http.js';
import { currentUser, isStaff } from './_lib/auth.js';
import { changeStock, logMovement } from './_lib/inventory.js';
import { sendTemplate, businessRecipient, getSetting } from './_lib/email.js';
import * as v from './_lib/validate.js';

const money = (n) => `Rs. ${Number(n).toFixed(2)}`;

function orderNumber() {
  const d = new Date(Date.now() + 5.5 * 3600 * 1000);
  const stamp = d.toISOString().slice(2, 10).replace(/-/g, '');
  return `MSO-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export const itemsText = (items) =>
  items.map((i) => `- ${i.product_name} x ${i.quantity} = ${money(i.line_total)}`).join('\n');

async function restoreStock(items, reference, by) {
  for (const item of items) {
    if (!item.product_id) continue;
    try {
      const result = await changeStock(item.product_id, { delta: item.quantity });
      await logMovement({
        product_id: item.product_id,
        movement_type: 'cancel_return',
        quantity: item.quantity,
        stock_after: result.after,
        reference,
        created_by: by,
      });
    } catch (err) {
      console.error('Stock restore failed:', err);
    }
  }
}

async function createOrder(req, res) {
  const user = await currentUser(req);
  const body = readBody(req);
  const store = await getSetting('store', { shipping_fee: 49, free_shipping_above: 499, cod_enabled: true });

  if (!Array.isArray(body.items) || body.items.length === 0) throw new HttpError(400, 'Your cart is empty.');
  if (body.items.length > 30) throw new HttpError(400, 'Too many different items in one order.');

  // Merge duplicate lines and validate quantities.
  const wanted = new Map();
  for (const item of body.items) {
    const productId = v.id(item.product_id, 'Product');
    const qty = v.number(item.quantity, 'Quantity', { min: 1, max: 20, integer: true });
    wanted.set(productId, (wanted.get(productId) || 0) + qty);
  }

  const paymentMethod = v.oneOf(body.payment_method, 'Payment method', ['cod', 'online']);
  if (paymentMethod === 'online') {
    throw new HttpError(400, 'Online payment (UPI/Razorpay) is not available yet. Please choose Cash on Delivery.');
  }
  if (store.cod_enabled === false) throw new HttpError(400, 'Cash on Delivery is currently disabled.');

  const shipping = body.shipping || {};
  const customer = {
    customer_name: v.text(shipping.full_name, 'Full name', { min: 2, max: 80 }),
    phone: v.phone(shipping.phone),
    email: v.email(shipping.email || user.email),
    address: v.text(shipping.address, 'Address', { min: 10, max: 300 }),
    city: v.text(shipping.city, 'City', { max: 60 }),
    pincode: v.text(shipping.pincode, 'Pincode', { max: 6 }),
  };
  if (!/^\d{6}$/.test(customer.pincode)) throw new HttpError(400, 'Pincode must be 6 digits.');

  const ids = [...wanted.keys()];
  const products = check(await supabase.from('products').select('id,name,sku,price,stock,is_active').in('id', ids));
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = ids.map((productId) => {
    const p = byId.get(productId);
    if (!p || !p.is_active) throw new HttpError(409, 'One of the items in your cart is no longer available.');
    const quantity = wanted.get(productId);
    if (p.stock < quantity) {
      throw new HttpError(409, p.stock > 0 ? `Only ${p.stock} left of "${p.name}".` : `"${p.name}" is out of stock.`);
    }
    const price = Number(p.price);
    return { product_id: p.id, product_name: p.name, sku: p.sku, price, quantity, line_total: +(price * quantity).toFixed(2) };
  });

  // Reserve stock atomically; roll back what we took if any line fails.
  const number = orderNumber();
  const taken = [];
  try {
    for (const line of lines) {
      const result = await changeStock(line.product_id, { delta: -line.quantity });
      taken.push({ ...line, stock_after: result.after });
    }
  } catch (err) {
    await restoreStock(taken, `${number} (rollback)`, 'system');
    throw err;
  }

  const subtotal = +lines.reduce((sum, l) => sum + l.line_total, 0).toFixed(2);
  const shippingFee = subtotal >= Number(store.free_shipping_above || 0) ? 0 : Number(store.shipping_fee || 0);
  const now = new Date().toISOString();

  let order;
  try {
    order = check(
      await supabase
        .from('orders')
        .insert({
          order_number: number,
          user_id: user.id,
          ...customer,
          subtotal,
          shipping_fee: shippingFee,
          total: +(subtotal + shippingFee).toFixed(2),
          payment_method: paymentMethod,
          payment_status: 'pending',
          status: 'pending',
          notes: v.text(body.notes, 'Notes', { required: false, max: 300 }),
          status_history: [{ status: 'pending', at: now, note: 'Order placed' }],
        })
        .select()
        .single()
    );
    check(await supabase.from('order_items').insert(lines.map((l) => ({ ...l, order_id: order.id }))));
  } catch (err) {
    if (order) await supabase.from('orders').delete().eq('id', order.id);
    await restoreStock(taken, `${number} (rollback)`, 'system');
    throw err;
  }

  for (const line of taken) {
    await logMovement({
      product_id: line.product_id,
      movement_type: 'sale',
      quantity: -line.quantity,
      stock_after: line.stock_after,
      reference: number,
      created_by: user.email,
    });
  }

  const vars = {
    order_number: number,
    customer_name: customer.customer_name,
    phone: customer.phone,
    items: itemsText(lines),
    total: money(order.total),
    payment_method: 'Cash on Delivery',
    address: `${customer.address}, ${customer.city} - ${customer.pincode}`,
    status: 'pending',
  };
  const related = { type: 'order', id: number };
  const [customerMail] = await Promise.all([
    sendTemplate('order_confirmation', customer.email, vars, related),
    sendTemplate('order_business', await businessRecipient(), vars, related),
  ]);

  return res.status(201).json({ order, emails: { customer: customerMail?.status || 'failed' } });
}

async function cancelOrder(req, res) {
  const user = await currentUser(req);
  const orderId = v.id(readBody(req).id, 'Order');
  const order = check(await supabase.from('orders').select('*, order_items(*)').eq('id', orderId).maybeSingle());
  if (!order || order.user_id !== user.id) throw new HttpError(404, 'Order not found.');
  if (order.status !== 'pending') throw new HttpError(409, 'Only pending orders can be cancelled. Please contact the store.');

  const history = [...(order.status_history || []), { status: 'cancelled', at: new Date().toISOString(), note: 'Cancelled by customer' }];
  const updated = check(
    await supabase.from('orders').update({ status: 'cancelled', status_history: history }).eq('id', orderId).eq('status', 'pending').select().single()
  );
  await restoreStock(order.order_items, order.order_number, user.email);
  await sendTemplate(
    'order_status',
    order.email,
    { order_number: order.order_number, customer_name: order.customer_name, status: 'cancelled', total: money(order.total), items: itemsText(order.order_items) },
    { type: 'order', id: order.order_number }
  );
  return res.status(200).json(updated);
}

export default withApi(async (req, res) => {
  if (req.method === 'POST' && req.query.action === 'cancel') return cancelOrder(req, res);
  if (req.method === 'POST') return createOrder(req, res);
  if (req.method !== 'GET') return notAllowed();

  const user = await currentUser(req);
  if (req.query.id) {
    const order = check(await supabase.from('orders').select('*, order_items(*)').eq('id', v.id(req.query.id, 'Order')).maybeSingle());
    if (!order || (order.user_id !== user.id && !isStaff(user))) throw new HttpError(404, 'Order not found.');
    return res.status(200).json(order);
  }
  const orders = check(
    await supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false })
  );
  return res.status(200).json(orders);
});
