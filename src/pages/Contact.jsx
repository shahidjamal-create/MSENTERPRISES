import { useState } from 'react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Field, Input, Textarea } from '../components/ui/Form';
import { Alert } from '../components/ui/Feedback';
import { contactApi, errorMessage } from '../services/api';
import { BUSINESS } from '../utils/constants';
import { isValidEmail, isValidPhone } from '../utils/format';

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState({ tone: '', title: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your name.';
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.';
    if (form.phone && !isValidPhone(form.phone)) next.phone = 'Enter a valid 10-digit mobile number.';
    if (form.subject.trim().length < 3) next.subject = 'Enter a subject.';
    if (form.message.trim().length < 10) next.message = 'Message must be at least 10 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);

    const emailSubject = `[Website Enquiry] ${form.subject}`;
    const emailBody = `Dear MS ENTERPRISES Store,

New enquiry from website:
• Customer Name: ${form.name}
• Customer Email: ${form.email}
• Mobile: ${form.phone || 'Not provided'}
• Subject: ${form.subject}

Message:
${form.message}

---
Store Recipient: mohammedafiz447@gmail.com
Address: 73, HKP Road, Sulthangunta, Shivaji Nagar, Bengaluru, Karnataka 560051`;

    try {
      await contactApi.enquiry(form);
      setResult({
        tone: 'success',
        title: 'Enquiry Sent Successfully!',
        message: 'Your message has been delivered to MS ENTERPRISES store management via Brevo Emailing Service. A confirmation copy has been sent to your email.',
      });
      setForm(EMPTY);
    } catch (err) {
      setResult({
        tone: 'error',
        title: 'Could not send enquiry',
        message: errorMessage(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cards = [
    {
      icon: Mail,
      label: 'Store Email (Primary)',
      value: BUSINESS.email,
      href: BUSINESS.emailHref,
      hint: 'Click to email directly',
      badge: 'Direct to Owner',
    },
    { icon: Phone, label: 'Call us', value: BUSINESS.phoneDisplay || BUSINESS.phone, href: BUSINESS.phoneHref },
    { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', href: BUSINESS.whatsapp, external: true },
    {
      icon: MapPin,
      label: 'Store Location',
      value: BUSINESS.addressFull,
      href: BUSINESS.googleMapsUrl,
      external: true,
      hint: 'Click to open in Google Maps',
    },
  ];

  return (
    <>
      <PageHeader title="Contact Us" description="Questions about a repair, a product or store visit? Reach us directly, visit our shop or send an enquiry." crumbs={[['Contact']]} />
      <div className="container-page grid gap-6 sm:gap-8 py-6 sm:py-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3">
          {cards.map(({ icon: Icon, label, value, href, external, hint, badge }) => (
            <a key={label} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="card flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 hover:border-brand transition-colors">
              <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted">{label}</span>
                  {badge && <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">{badge}</span>}
                </div>
                <span className="block break-words text-sm sm:text-base font-semibold text-ink">{value}</span>
                {hint && <span className="mt-0.5 block text-[11px] text-brand font-medium">{hint} →</span>}
              </span>
            </a>
          ))}
          <div className="rounded-xl border border-line bg-surface/60 p-3.5 text-xs text-muted space-y-1">
            <p className="font-semibold text-ink">📍 Visiting the store?</p>
            <p>73, HKP Road, Sulthangunta, Shivaji Nagar, Bengaluru, Karnataka 560051</p>
            <p>Open Monday – Saturday: 10:00 AM – 9:00 PM</p>
          </div>
          <p className="px-1 pt-1 text-xs sm:text-sm text-muted">For repair quotes, mention your phone brand, model and the problem — it helps us reply with an accurate estimate.</p>
        </div>

        <form onSubmit={submit} className="card p-4 sm:p-5 md:p-6" noValidate>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">Send an enquiry</h2>
              <p className="text-xs text-muted">Direct email connection to {BUSINESS.email}</p>
            </div>
            <a href={BUSINESS.googleMapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
              <MapPin className="h-3.5 w-3.5" /> Shivaji Nagar Store
            </a>
          </div>
          {result.message && (
            <div className="mt-4">
              <Alert tone={result.tone} title={result.title}>{result.message}</Alert>
            </div>
          )}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Name" required error={errors.name}>
              <Input value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" />
            </Field>
            <Field label="Email" required error={errors.email}>
              <Input type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
            </Field>
            <Field label="Mobile (optional)" error={errors.phone}>
              <Input value={form.phone} onChange={set('phone')} error={errors.phone} inputMode="tel" />
            </Field>
            <Field label="Subject" required error={errors.subject}>
              <Input value={form.subject} onChange={set('subject')} error={errors.subject} maxLength={120} />
            </Field>
            <Field label="Message" required error={errors.message} className="sm:col-span-2">
              <Textarea rows={5} value={form.message} onChange={set('message')} error={errors.message} maxLength={2000} />
            </Field>
          </div>
          <button className="btn btn-primary mt-5" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send enquiry'}
          </button>
        </form>
      </div>
    </>
  );
}
