import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthCard, { GoogleButton } from './AuthCard';
import { Field, Input } from '../../components/ui/Form';
import { Alert } from '../../components/ui/Feedback';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../services/api';
import { isValidEmail, isValidPhone } from '../../utils/format';

export default function Register() {
  const { register, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from || '/account';
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.full_name.trim().length < 2) next.full_name = 'Enter your full name.';
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.';
    if (!isValidPhone(form.phone)) next.phone = 'Enter a valid 10-digit mobile number.';
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    setError('');
    try {
      const { confirm, ...payload } = form;
      void confirm;
      await register(payload);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Place orders, save addresses and track repairs."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-semibold text-brand hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <Field label="Full name" required error={errors.full_name}>
          <Input autoComplete="name" value={form.full_name} error={errors.full_name} onChange={set('full_name')} />
        </Field>
        <Field label="Email" required error={errors.email}>
          <Input type="email" autoComplete="email" value={form.email} error={errors.email} onChange={set('email')} />
        </Field>
        <Field label="Mobile number" required error={errors.phone}>
          <Input inputMode="tel" autoComplete="tel" value={form.phone} error={errors.phone} onChange={set('phone')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" required error={errors.password}>
            <Input type="password" autoComplete="new-password" value={form.password} error={errors.password} onChange={set('password')} />
          </Field>
          <Field label="Confirm password" required error={errors.confirm}>
            <Input type="password" autoComplete="new-password" value={form.confirm} error={errors.confirm} onChange={set('confirm')} />
          </Field>
        </div>
        <button className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <GoogleButton onSuccess={async () => { await refreshUser(); navigate(destination, { replace: true }); }} />
    </AuthCard>
  );
}
