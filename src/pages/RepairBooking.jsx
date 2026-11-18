import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Copy, Mail } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Field, Input, Select, Textarea } from '../components/ui/Form';
import { Alert, ErrorState, PageLoader } from '../components/ui/Feedback';
import { useBrands, useModels } from '../components/ModelPicker';
import { useAuth } from '../context/AuthContext';
import { usePublicSettings } from '../hooks/usePublicSettings';
import { useAsync } from '../hooks/useAsync';
import { bookingApi, catalogApi, errorMessage } from '../services/api';
import { formatDate, isValidEmail, isValidPhone, todayISO } from '../utils/format';
import { BUSINESS } from '../utils/constants';

const OTHER = '__other';

function Confirmation({ booking, emailStatus }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(booking.booking_code).then(() => setCopied(true));
  };

  const emailSubject = `[Repair Booking: ${booking.booking_code}] ${booking.brand_name || ''} ${booking.model_name || ''}`;
  const emailBody = `Dear MS ENTERPRISES Team,

Here are the details for Repair Booking #${booking.booking_code}:
• Customer Name: ${booking.customer_name}
• Phone: ${booking.phone}
• Email: ${booking.email}
• Device: ${booking.brand_name} ${booking.model_name}
• Repair Service: ${booking.service_name}
• Appointment: ${formatDate(booking.appointment_date)}, ${booking.preferred_time}
• Issue: ${booking.issue || 'Standard service'}

---
Store Contact: mohammedafiz447@gmail.com
Store Address: 73, HKP Road, Sulthangunta, Shivaji Nagar, Bengaluru, Karnataka 560051`;

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-6 text-center sm:p-8">
      <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
      <h2 className="mt-3 text-xl font-bold text-navy">Repair booked</h2>
      <p className="mt-1 text-sm text-muted">Keep this booking ID to track your repair.</p>
      <div className="mt-5 inline-flex items-center gap-3 rounded-xl bg-surface px-5 py-3">
        <span className="text-2xl font-extrabold tracking-wider text-navy">{booking.booking_code}</span>
        <button onClick={copy} className="text-muted hover:text-brand" aria-label="Copy booking ID">
          <Copy className="h-4 w-4" />
        </button>
      </div>
      {copied && <p className="mt-1 text-xs text-success">Copied</p>}
      <dl className="mt-6 grid gap-2 text-left text-sm sm:grid-cols-2">
        <div><dt className="text-muted">Device</dt><dd className="font-medium">{booking.brand_name} {booking.model_name}</dd></div>
        <div><dt className="text-muted">Service</dt><dd className="font-medium">{booking.service_name}</dd></div>
        <div><dt className="text-muted">Appointment</dt><dd className="font-medium">{formatDate(booking.appointment_date)}, {booking.preferred_time}</dd></div>
        <div><dt className="text-muted">Status</dt><dd className="font-medium">{booking.status}</dd></div>
      </dl>

      <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-left text-xs">
        <p className="font-bold text-emerald-800 flex items-center gap-1.5">
          <Mail className="h-4 w-4 text-emerald-600" /> Confirmation Email Sent via Brevo
        </p>
        <p className="mt-1 text-slate-600">
          An instant booking confirmation with your appointment schedule has been delivered to <strong className="text-slate-800">{booking.email}</strong>.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to={`/track-repair?code=${booking.booking_code}`} className="btn btn-primary">
          Track this repair
        </Link>
        <Link to="/" className="btn btn-outline">
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default function RepairBooking() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const isCustomer = user && user.role === 'customer';
  const settings = usePublicSettings();
  const services = useAsync(() => catalogApi.services(), []);
  const { brands } = useBrands();
  const [form, setForm] = useState({
    customer_name: isCustomer ? user.full_name || '' : '',
    phone: isCustomer ? user.phone || '' : '',
    email: isCustomer ? user.email || '' : '',
    brand_id: '',
    model_id: '',
    model_other: '',
    service_id: params.get('service') || '',
    issue: '',
    appointment_date: '',
    preferred_time: '',
  });
  const { models, loading: modelsLoading } = useModels(form.brand_id);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const slots = settings?.booking?.time_slots || [];
  const maxDays = settings?.booking?.max_days_ahead || 30;

  const validate = () => {
    const next = {};
    if (form.customer_name.trim().length < 2) next.customer_name = 'Enter your name.';
    if (!isValidPhone(form.phone)) next.phone = 'Enter a valid 10-digit mobile number.';
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.';
    if (!form.brand_id) next.brand_id = 'Select your phone brand.';
    if (!form.model_id) next.model_id = 'Select your model.';
    if (form.model_id === OTHER && form.model_other.trim().length < 2) next.model_other = 'Type your model name.';
    if (!form.service_id) next.service_id = 'Choose the repair type.';
    if (form.issue.trim().length < 10) next.issue = 'Describe the problem in at least 10 characters.';
    if (!form.appointment_date) next.appointment_date = 'Pick a date.';
    else if (form.appointment_date < todayISO()) next.appointment_date = 'Date cannot be in the past.';
    if (!form.preferred_time) next.preferred_time = 'Pick a time slot.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const brand = brands.find((b) => String(b.id) === form.brand_id);
      const model = form.model_id === OTHER ? form.model_other.trim() : models.find((m) => String(m.id) === form.model_id)?.name;
      const selectedService = services.data?.find((s) => String(s.id) === String(form.service_id));
      const res = await bookingApi.create({
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        brand_name: brand?.name,
        model_name: model,
        service_id: form.service_id,
        service_name: selectedService?.name || 'Mobile Repair',
        issue: form.issue.trim(),
        appointment_date: form.appointment_date,
        preferred_time: form.preferred_time,
      });
      setResult(res);
      window.scrollTo(0, 0);
    } catch (err) {
      setServerError(errorMessage(err, 'Could not save your booking. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Book a Repair" description="Tell us about your phone and the problem. You'll get a booking ID instantly to track progress." crumbs={[['Services', '/services'], ['Book a Repair']]} />
      <div className="container-page py-8">
        {result ? (
          <Confirmation booking={result.booking} emailStatus={result.emails?.customer} />
        ) : services.loading ? (
          <PageLoader />
        ) : services.error ? (
          <ErrorState message={services.error} onRetry={services.reload} />
        ) : (
          <form onSubmit={submit} noValidate className="mx-auto max-w-3xl space-y-6">
            {serverError && <Alert tone="error" title="Booking not saved">{serverError}</Alert>}

            {/* Genius Bar Promise Banner */}
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/50 p-4 sm:p-5 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0071E3] text-white font-bold text-xs">⚡</span>
                  <div>
                    <p className="font-bold text-slate-900">45-Min Fix</p>
                    <p className="text-slate-500 text-[11px]">Screen & battery service</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs">🛡️</span>
                  <div>
                    <p className="font-bold text-slate-900">90-Day Guarantee</p>
                    <p className="text-slate-500 text-[11px]">100% tested genuine spares</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs">📍</span>
                  <div>
                    <p className="font-bold text-slate-900">Shivaji Nagar Lab</p>
                    <p className="text-slate-500 text-[11px]">Walk-in or scheduled slot</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Contact Details */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0071E3] text-white text-xs font-bold">1</span>
                <h2 className="font-bold text-slate-900 text-base">Your Contact Details</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required error={errors.customer_name}>
                  <Input
                    value={form.customer_name}
                    onChange={set('customer_name')}
                    error={errors.customer_name}
                    autoComplete="name"
                    placeholder="Enter your full name"
                  />
                </Field>
                <Field label="Mobile number" required error={errors.phone}>
                  <Input
                    value={form.phone}
                    onChange={set('phone')}
                    error={errors.phone}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                  />
                </Field>
                <Field label="Email" required error={errors.email} className="sm:col-span-2" hint="Booking confirmation and status updates are sent here.">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    error={errors.email}
                    autoComplete="email"
                    placeholder="e.g. name@example.com"
                  />
                </Field>
              </div>
            </section>

            {/* Step 2: Device & Problem */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0071E3] text-white text-xs font-bold">2</span>
                <h2 className="font-bold text-slate-900 text-base">Device & Repair Requirement</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Brand" required error={errors.brand_id}>
                  <Select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value, model_id: '' })} error={errors.brand_id}>
                    <option value="">Select brand</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </Select>
                </Field>
                <Field label="Model" required error={errors.model_id}>
                  <Select value={form.model_id} onChange={set('model_id')} error={errors.model_id} disabled={!form.brand_id || modelsLoading}>
                    <option value="">{!form.brand_id ? 'Select brand first' : modelsLoading ? 'Loading…' : 'Select model'}</option>
                    {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    {form.brand_id && <option value={OTHER}>My model is not listed</option>}
                  </Select>
                </Field>
                {form.model_id === OTHER && (
                  <Field label="Model name" required error={errors.model_other} className="sm:col-span-2">
                    <Input value={form.model_other} onChange={set('model_other')} error={errors.model_other} placeholder="e.g. Galaxy M14 5G" maxLength={80} />
                  </Field>
                )}
                <Field label="Repair type" required error={errors.service_id} className="sm:col-span-2">
                  <Select value={form.service_id} onChange={set('service_id')} error={errors.service_id}>
                    <option value="">Choose repair type</option>
                    {services.data.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                </Field>
                <Field label="Describe the issue" required error={errors.issue} className="sm:col-span-2">
                  <Textarea rows={4} value={form.issue} onChange={set('issue')} error={errors.issue} maxLength={1000} placeholder="What happened? When did it start? Any physical or water damage?" />
                </Field>
              </div>
            </section>

            {/* Step 3: Appointment Slot */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0071E3] text-white text-xs font-bold">3</span>
                <h2 className="font-bold text-slate-900 text-base">Select Appointment Date & Time</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date" required error={errors.appointment_date}>
                  <Input type="date" min={todayISO()} max={todayISO(maxDays)} value={form.appointment_date} onChange={set('appointment_date')} error={errors.appointment_date} />
                </Field>
                <Field label="Preferred time" required error={errors.preferred_time}>
                  <Select value={form.preferred_time} onChange={set('preferred_time')} error={errors.preferred_time}>
                    <option value="">{slots.length ? 'Choose a slot' : 'Loading slots…'}</option>
                    {slots.map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
              </div>
            </section>

            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-[#005bb5] active:scale-95 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Confirming booking…' : 'Confirm Repair Appointment →'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
