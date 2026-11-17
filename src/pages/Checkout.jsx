import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, Smartphone } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { OrderSummary } from './Cart';
import { Field, Input, Textarea } from '../components/ui/Form';
import { Alert, EmptyState } from '../components/ui/Feedback';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePublicSettings } from '../hooks/usePublicSettings';
import { orderApi, errorMessage } from '../services/api';
import { isValidEmail, isValidPhone, formatPrice } from '../utils/format';

export default function Checkout() {
  const { user } = useAuth();
  const isCustomer = user && user.role === 'customer';
  const { items, subtotal, clearCart } = useCart();
  const settings = usePublicSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: isCustomer ? user.full_name || '' : '',
    phone: isCustomer ? user.phone || '' : '',
    email: isCustomer ? user.email || '' : '',
    address: isCustomer ? user.address || '' : '',
    city: isCustomer ? user.city || '' : '',
    pincode: isCustomer ? user.pincode || '' : '',
    notes: '',
  });
  const [payment, setPayment] = useState('cod');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const onlineEnabled = settings?.store?.online_payment_enabled;
  const codEnabled = settings?.store?.cod_enabled !== false;

  const validate = () => {
    const next = {};
    if (form.full_name.trim().length < 2) next.full_name = 'Enter your full name.';
    if (!isValidPhone(form.phone)) next.phone = 'Enter a valid 10-digit mobile number.';
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.';
    if (form.address.trim().length < 10) next.address = 'Enter your full address (house, street, area).';
    if (!form.city.trim()) next.city = 'Enter your city.';
    if (!/^\d{6}$/.test(form.pincode)) next.pincode = 'Pincode must be 6 digits.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { notes, ...shipping } = form;
      const res = await orderApi.create({
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        shipping,
        notes,
        payment_method: payment,
      });
      clearCart();
      navigate(`/account/orders/${res.order.id}`, { state: { placed: true, emailStatus: res.emails?.customer } });
    } catch (err) {
      setServerError(errorMessage(err, 'Could not place your order. Please try again.'));
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState title="Nothing to check out" message="Your cart is empty." action={<Link to="/shop" className="btn btn-primary">Go to shop</Link>} />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Checkout" crumbs={[['Cart', '/cart'], ['Checkout']]} />
      <form onSubmit={placeOrder} noValidate className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {serverError && <Alert tone="error" title="Order not placed">{serverError}</Alert>}
          <section className="card p-5">
            <h2 className="font-semibold text-ink">Delivery details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required error={errors.full_name}>
                <Input value={form.full_name} onChange={set('full_name')} error={errors.full_name} autoComplete="name" placeholder="Enter your full name" />
              </Field>
              <Field label="Mobile number" required error={errors.phone}>
                <Input value={form.phone} onChange={set('phone')} error={errors.phone} inputMode="tel" autoComplete="tel" placeholder="10-digit mobile number" />
              </Field>
              <Field label="Email" required error={errors.email} className="sm:col-span-2" hint="Order confirmation and updates are sent here.">
                <Input type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" placeholder="e.g. name@example.com" />
              </Field>
              <Field label="Address" required error={errors.address} className="sm:col-span-2">
                <Textarea rows={2} value={form.address} onChange={set('address')} error={errors.address} autoComplete="street-address" placeholder="Flat, house no., building, street, area" />
              </Field>
              <Field label="City" required error={errors.city}>
                <Input value={form.city} onChange={set('city')} error={errors.city} placeholder="e.g. Bengaluru" />
              </Field>
              <Field label="Pincode" required error={errors.pincode}>
                <Input value={form.pincode} onChange={set('pincode')} error={errors.pincode} inputMode="numeric" maxLength={6} placeholder="6-digit pincode" />
              </Field>
              <Field label="Order notes (optional)" className="sm:col-span-2">
                <Input value={form.notes} onChange={set('notes')} maxLength={300} placeholder="Landmark, preferred delivery time…" />
              </Field>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-semibold text-ink">Payment method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${payment === 'cod' ? 'border-brand bg-brand-soft' : 'border-line'} ${!codEnabled ? 'opacity-50' : ''}`}>
                <input type="radio" name="payment" className="mt-1 accent-brand" checked={payment === 'cod'} onChange={() => setPayment('cod')} disabled={!codEnabled} />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink"><Banknote className="h-4 w-4" /> Cash on Delivery</span>
                  <span className="mt-0.5 block text-xs text-muted">{codEnabled ? 'Pay in cash or UPI when you receive the order.' : 'Currently unavailable.'}</span>
                </span>
              </label>
              <label className={`flex gap-3 rounded-lg border p-4 ${onlineEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} ${payment === 'online' ? 'border-brand bg-brand-soft' : 'border-line'}`}>
                <input type="radio" name="payment" className="mt-1 accent-brand" checked={payment === 'online'} onChange={() => setPayment('online')} disabled={!onlineEnabled} />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink"><Smartphone className="h-4 w-4" /> UPI / Razorpay</span>
                  <span className="mt-0.5 block text-xs text-muted">{onlineEnabled ? 'Pay securely online.' : 'Online payment is not available yet.'}</span>
                </span>
              </label>
            </div>
            <p className="mt-3 text-xs text-muted">We never ask for or store card details.</p>
          </section>
        </div>

        <div>
          <OrderSummary subtotal={subtotal} settings={settings}>
            <ul className="mt-4 space-y-1.5 border-t border-line pt-3 text-xs text-muted">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between gap-2">
                  <span className="line-clamp-1">{i.name} × {i.quantity}</span>
                  <span>{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary mt-5 w-full" disabled={submitting || !codEnabled}>
              {submitting ? 'Placing order…' : 'Place Order'}
            </button>
          </OrderSummary>
        </div>
      </form>
    </>
  );
}
