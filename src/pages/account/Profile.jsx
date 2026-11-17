import { useState } from 'react';
import { Field, Input, Textarea } from '../../components/ui/Form';
import { Alert } from '../../components/ui/Feedback';
import { useAuth } from '../../context/AuthContext';
import { authApi, errorMessage } from '../../services/api';
import { isValidPhone } from '../../utils/format';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    full_name: user.full_name || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    pincode: user.pincode || '',
  });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState({ tone: '', message: '' });
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.full_name.trim().length < 2) next.full_name = 'Enter your full name.';
    if (form.phone && !isValidPhone(form.phone)) next.phone = 'Enter a valid 10-digit mobile number.';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) next.pincode = 'Pincode must be 6 digits.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      const res = await authApi.updateMe(form);
      setUser(res.user);
      setResult({ tone: 'success', message: 'Profile saved.' });
    } catch (err) {
      setResult({ tone: 'error', message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-4 sm:p-5 md:p-6" noValidate>
      <h2 className="text-base sm:text-lg font-semibold text-ink">Profile details</h2>
      <p className="text-xs sm:text-sm text-muted">Your saved address is used to pre-fill checkout.</p>
      {result.message && <Alert tone={result.tone} className="mt-4">{result.message}</Alert>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required error={errors.full_name}>
          <Input value={form.full_name} onChange={set('full_name')} error={errors.full_name} />
        </Field>
        <Field label="Email">
          <Input value={user.email} disabled />
        </Field>
        <Field label="Mobile number" error={errors.phone}>
          <Input value={form.phone} onChange={set('phone')} error={errors.phone} inputMode="tel" />
        </Field>
        <Field label="City">
          <Input value={form.city} onChange={set('city')} />
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <Textarea rows={2} value={form.address} onChange={set('address')} />
        </Field>
        <Field label="Pincode" error={errors.pincode}>
          <Input value={form.pincode} onChange={set('pincode')} error={errors.pincode} inputMode="numeric" maxLength={6} />
        </Field>
      </div>
      <button className="btn btn-primary mt-5 w-full sm:w-auto" disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
