import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { AdminHeader } from './AdminLayout';
import { Checkbox, Field, Input } from '../components/ui/Form';
import { Alert, ErrorState, PageLoader } from '../components/ui/Feedback';
import { opsApi, errorMessage } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { useToast } from '../context/ToastContext';

function useSave(key, onDone) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async (value) => {
    setSaving(true);
    setError('');
    try {
      await opsApi.update('settings', { key, value });
      toast('Settings saved.');
      onDone?.();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };
  return { save, saving, error };
}

function StoreSettings({ initial }) {
  const [form, setForm] = useState(initial);
  const { save, saving, error } = useSave('store');
  return (
    <form className="card space-y-4 p-5" onSubmit={(e) => { e.preventDefault(); save(form); }} noValidate>
      <h2 className="font-semibold">Orders & delivery</h2>
      {error && <Alert tone="error">{error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Delivery fee (₹)"><Input type="number" min="0" value={form.shipping_fee ?? ''} onChange={(e) => setForm({ ...form, shipping_fee: e.target.value })} /></Field>
        <Field label="Free delivery above (₹)"><Input type="number" min="0" value={form.free_shipping_above ?? ''} onChange={(e) => setForm({ ...form, free_shipping_above: e.target.value })} /></Field>
      </div>
      <Checkbox label="Accept Cash on Delivery" checked={form.cod_enabled !== false} onChange={(v) => setForm({ ...form, cod_enabled: v })} />
      <div><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></div>
    </form>
  );
}

function BookingSettings({ initial }) {
  const [slots, setSlots] = useState(initial.time_slots || []);
  const [days, setDays] = useState(initial.max_days_ahead || 30);
  const [newSlot, setNewSlot] = useState('');
  const { save, saving, error } = useSave('booking');
  const add = () => {
    const value = newSlot.trim();
    if (value && !slots.includes(value)) setSlots([...slots, value]);
    setNewSlot('');
  };
  return (
    <form className="card space-y-4 p-5" onSubmit={(e) => { e.preventDefault(); save({ time_slots: slots, max_days_ahead: days }); }} noValidate>
      <h2 className="font-semibold">Repair appointments</h2>
      {error && <Alert tone="error">{error}</Alert>}
      <Field label="Bookable up to (days ahead)"><Input type="number" min="1" max="180" value={days} onChange={(e) => setDays(e.target.value)} /></Field>
      <Field label="Time slots">
        <div className="flex flex-wrap gap-2">
          {slots.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-sm">
              {s}
              <button type="button" onClick={() => setSlots(slots.filter((x) => x !== s))} aria-label={`Remove ${s}`}><X className="h-3.5 w-3.5 text-muted hover:text-danger" /></button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <Input placeholder="e.g. 10:00 AM - 12:00 PM" value={newSlot} onChange={(e) => setNewSlot(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
          <button type="button" className="btn btn-outline" onClick={add}><Plus className="h-4 w-4" /> Add</button>
        </div>
      </Field>
      <div><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></div>
    </form>
  );
}

export default function Settings() {
  const { data, loading, error, reload } = useAsync(() => opsApi.list('settings'), []);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(!!data), [data]);

  return (
    <>
      <AdminHeader title="Settings" description="Store, delivery and appointment configuration. Email settings live under Email Management." />
      {loading || !ready ? (
        error ? <ErrorState message={error} onRetry={reload} /> : <PageLoader />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <StoreSettings initial={data.store} />
          <BookingSettings initial={data.booking} />
          <section className="card space-y-3 p-5 xl:col-span-2">
            <h2 className="font-semibold">Integrations (server environment)</h2>
            <Alert tone={data.environment.smtp_configured ? 'success' : 'warning'}>
              Email (SMTP): {data.environment.smtp_configured ? 'configured' : 'not configured — emails are logged but not sent'}.
            </Alert>
            <Alert tone={data.environment.payment_gateway_configured ? 'success' : 'warning'}>
              Online payments (Razorpay/UPI): {data.environment.payment_gateway_configured ? 'keys present' : 'not configured — checkout offers Cash on Delivery only'}.
            </Alert>
            <p className="text-xs text-muted">Credentials are set as environment variables on the server and are never exposed in the browser. See README for setup.</p>
          </section>
        </div>
      )}
    </>
  );
}
