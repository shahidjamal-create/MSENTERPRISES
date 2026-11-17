import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthCard, { GoogleButton } from './AuthCard';
import { Field, Input } from '../../components/ui/Form';
import { Alert } from '../../components/ui/Feedback';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../services/api';
import { isValidEmail } from '../../utils/format';

export default function Login() {
  const { login, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from || '/account';
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.';
    if (!form.password) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Log in to your account"
      subtitle="Track orders, repairs and save your details for faster checkout."
      footer={
        <>
          New to MS ENTERPRISES?{' '}
          <Link to="/register" state={location.state} className="font-semibold text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <Field label="Email" required error={errors.email} htmlFor="login-email">
          <Input id="login-email" type="email" autoComplete="email" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password" required error={errors.password} htmlFor="login-password">
          <Input id="login-password" type="password" autoComplete="current-password" value={form.password} error={errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-brand hover:underline">
            Forgot password?
          </Link>
        </div>
        <button className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <GoogleButton onSuccess={async () => { await refreshUser(); navigate(destination, { replace: true }); }} />
    </AuthCard>
  );
}
