import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { LogoMark } from '../components/Logo';
import { Field, Input } from '../components/ui/Form';
import { Alert } from '../components/ui/Feedback';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';
import { isValidEmail } from '../utils/format';

export default function AdminLogin() {
  const { login, user, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && isStaff) navigate(location.state?.from || '/admin', { replace: true });
  }, [user, isStaff, navigate, location.state]);

  const submit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(form.email) || !form.password) return setError('Enter your staff email and password.');
    setSubmitting(true);
    setError('');
    try {
      await login(form.email, form.password, 'admin');
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <div>
            <p className="font-extrabold tracking-wide text-navy">MS ENTERPRISES</p>
            <p className="text-xs text-muted">Staff & Admin Login</p>
          </div>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          {error && <Alert tone="error">{error}</Alert>}
          {user && !isStaff && <Alert tone="warning">You are signed in as a customer. Use a staff account to continue.</Alert>}
          <Field label="Email" required>
            <Input type="email" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Password" required>
            <Input type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <button className="btn btn-navy w-full" disabled={submitting}>
            <Lock className="h-4 w-4" /> {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="mt-5 flex justify-between text-sm">
          <Link to="/forgot-password" className="text-brand hover:underline">Forgot password?</Link>
          <Link to="/" className="text-muted hover:text-ink">Back to store</Link>
        </div>
      </div>
    </div>
  );
}
