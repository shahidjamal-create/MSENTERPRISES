import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from './AuthCard';
import { Field, Input } from '../../components/ui/Form';
import { Alert } from '../../components/ui/Feedback';
import { authApi, errorMessage } from '../../services/api';
import { isValidEmail } from '../../utils/format';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [result, setResult] = useState({ tone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) return setFieldError('Enter a valid email address.');
    setFieldError('');
    setSubmitting(true);
    try {
      const res = await authApi.forgot(email);
      setResult({ tone: 'success', message: res.message });
    } catch (err) {
      setResult({ tone: 'error', message: errorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title="Reset your password" subtitle="Enter the email you registered with and we'll send you a reset link." footer={<Link to="/login" className="font-semibold text-brand hover:underline">Back to login</Link>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {result.message && <Alert tone={result.tone}>{result.message}</Alert>}
        <Field label="Email" required error={fieldError}>
          <Input type="email" value={email} error={fieldError} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </Field>
        <button className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthCard>
  );
}
