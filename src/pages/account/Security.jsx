import { useState } from 'react';
import { Field, Input } from '../../components/ui/Form';
import { Alert } from '../../components/ui/Feedback';
import { authApi, errorMessage } from '../../services/api';

export default function Security() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState({ tone: '', message: '' });
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.current_password) next.current_password = 'Enter your current password.';
    if (form.new_password.length < 8) next.new_password = 'New password must be at least 8 characters.';
    if (form.confirm !== form.new_password) next.confirm = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      const res = await authApi.changePassword({ current_password: form.current_password, new_password: form.new_password });
      setResult({ tone: 'success', message: res.message });
      setForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setResult({ tone: 'error', message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card max-w-lg p-4 sm:p-5 md:p-6" noValidate>
      <h2 className="text-base sm:text-lg font-semibold text-ink">Change password</h2>
      {result.message && <Alert tone={result.tone} className="mt-4">{result.message}</Alert>}
      <div className="mt-5 space-y-4">
        <Field label="Current password" required error={errors.current_password}>
          <Input type="password" autoComplete="current-password" value={form.current_password} onChange={set('current_password')} error={errors.current_password} />
        </Field>
        <Field label="New password" required error={errors.new_password}>
          <Input type="password" autoComplete="new-password" value={form.new_password} onChange={set('new_password')} error={errors.new_password} />
        </Field>
        <Field label="Confirm new password" required error={errors.confirm}>
          <Input type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        </Field>
      </div>
      <button className="btn btn-primary mt-5 w-full sm:w-auto" disabled={saving}>
        {saving ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}
