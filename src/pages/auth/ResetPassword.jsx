import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from './AuthCard';
import { Field, Input } from '../../components/ui/Form';
import { Alert } from '../../components/ui/Feedback';
import { authApi, errorMessage } from '../../services/api';

export default function ResetPassword() {
  // The reset email link lands here with the recovery token in the URL fragment.
  const token = useMemo(() => new URLSearchParams(window.location.hash.slice(1)).get('access_token'), []);
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState({ tone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) next.confirm = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      const res = await authApi.reset({ access_token: token, password: form.password });
      setResult({ tone: 'success', message: res.message });
    } catch (err) {
      setResult({ tone: 'error', message: errorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthCard title="Reset link missing" footer={<Link to="/forgot-password" className="font-semibold text-brand hover:underline">Request a new link</Link>}>
        <Alert tone="warning">This page must be opened from the password reset email. The link may be incomplete or expired.</Alert>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" footer={<Link to="/login" className="font-semibold text-brand hover:underline">Back to login</Link>}>
      {result.tone === 'success' ? (
        <div className="space-y-4">
          <Alert tone="success">{result.message}</Alert>
          <Link to="/login" className="btn btn-primary w-full">
            Log in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          {result.message && <Alert tone="error">{result.message}</Alert>}
          <Field label="New password" required error={errors.password}>
            <Input type="password" autoComplete="new-password" value={form.password} error={errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <Field label="Confirm new password" required error={errors.confirm}>
            <Input type="password" autoComplete="new-password" value={form.confirm} error={errors.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </Field>
          <button className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? 'Saving…' : 'Update password'}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
