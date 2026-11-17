import { useState } from 'react';
import { Star } from 'lucide-react';
import { contactApi, errorMessage } from '../services/api';
import { Field, Input, Textarea } from './ui/Form';
import { Alert } from './ui/Feedback';

export default function ReviewForm({ onDone }) {
  const [form, setForm] = useState({ customer_name: '', rating: 5, comment: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.customer_name.trim().length < 2) next.customer_name = 'Please enter your name.';
    if (form.comment.trim().length < 10) next.comment = 'Please write at least 10 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setStatus({ state: 'saving', message: '' });
    try {
      const res = await contactApi.review(form);
      setStatus({ state: 'done', message: res.message });
    } catch (err) {
      setStatus({ state: 'error', message: errorMessage(err) });
    }
  };

  if (status.state === 'done') {
    return (
      <div className="space-y-4">
        <Alert tone="success">{status.message}</Alert>
        <button className="btn btn-outline" onClick={onDone}>
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {status.state === 'error' && <Alert tone="error">{status.message}</Alert>}
      <Field label="Your name" required error={errors.customer_name}>
        <Input value={form.customer_name} error={errors.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} maxLength={60} />
      </Field>
      <Field label="Rating" required>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setForm({ ...form, rating: n })} aria-label={`${n} stars`} aria-checked={form.rating === n} role="radio">
              <Star className={`h-7 w-7 ${n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-line'}`} />
            </button>
          ))}
        </div>
      </Field>
      <Field label="Your review" required error={errors.comment}>
        <Textarea rows={4} value={form.comment} error={errors.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} maxLength={600} />
      </Field>
      <button className="btn btn-primary w-full" disabled={status.state === 'saving'}>
        {status.state === 'saving' ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
}
