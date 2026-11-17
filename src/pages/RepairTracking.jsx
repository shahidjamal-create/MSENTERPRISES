import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Field, Input } from '../components/ui/Form';
import { Alert } from '../components/ui/Feedback';
import StatusBadge from '../components/ui/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import { bookingApi, errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BOOKING_STATUSES } from '../utils/constants';
import { formatDate, formatPrice, isValidPhone } from '../utils/format';

const STEPS = BOOKING_STATUSES.filter((s) => s !== 'Cancelled');

export default function RepairTracking() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [form, setForm] = useState({ code: params.get('code') || '', phone: user?.phone || '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ loading: false, error: '', booking: null });

  useEffect(() => {
    if (user?.phone) setForm((f) => ({ ...f, phone: f.phone || user.phone }));
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!/^MSR-[A-Z0-9]{6}$/i.test(form.code.trim())) next.code = 'Booking ID looks like MSR-AB12CD.';
    if (!isValidPhone(form.phone)) next.phone = 'Enter the mobile number used for booking.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setState({ loading: true, error: '', booking: null });
    try {
      const booking = await bookingApi.track(form.code.trim().toUpperCase(), form.phone);
      setState({ loading: false, error: '', booking });
    } catch (err) {
      setState({ loading: false, error: errorMessage(err), booking: null });
    }
  };

  const b = state.booking;
  return (
    <>
      <PageHeader title="Track Your Repair" description="Enter your booking ID and the mobile number you used when booking." crumbs={[['Track Repair']]} />
      <div className="container-page grid gap-6 py-6 sm:py-8 lg:grid-cols-[340px_1fr]">
        <form onSubmit={submit} className="card h-fit space-y-4 p-4 sm:p-5" noValidate>
          <Field label="Booking ID" required error={errors.code}>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} error={errors.code} placeholder="MSR-XXXXXX" className="uppercase" />
          </Field>
          <Field label="Mobile number" required error={errors.phone}>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} inputMode="tel" />
          </Field>
          <button className="btn btn-primary w-full" disabled={state.loading}>
            <Search className="h-4 w-4" /> {state.loading ? 'Searching…' : 'Track repair'}
          </button>
        </form>

        <div className="min-w-0">
          {state.error && <Alert tone="error">{state.error}</Alert>}
          {!b && !state.error && (
            <div className="rounded-xl border border-dashed border-line bg-surface p-6 sm:p-8 text-center text-xs sm:text-sm text-muted">Your repair status will appear here.</div>
          )}
          {b && (
            <div className="card p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">Booking ID</p>
                  <h2 className="text-lg sm:text-xl font-bold text-navy">{b.booking_code}</h2>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <dl className="mt-5 grid gap-2.5 sm:gap-3 text-xs sm:text-sm grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3">
                <div><dt className="text-muted">Device</dt><dd className="font-medium">{b.brand_name} {b.model_name}</dd></div>
                <div><dt className="text-muted">Service</dt><dd className="font-medium">{b.service_name}</dd></div>
                <div><dt className="text-muted">Appointment</dt><dd className="font-medium">{formatDate(b.appointment_date)} · {b.preferred_time}</dd></div>
                <div><dt className="text-muted">Estimated cost</dt><dd className="font-medium">{b.estimated_cost != null ? formatPrice(b.estimated_cost) : 'To be confirmed after diagnosis'}</dd></div>
                {b.technician_name && <div><dt className="text-muted">Technician</dt><dd className="font-medium">{b.technician_name}</dd></div>}
              </dl>
              <p className="mt-4 rounded-lg bg-surface p-3 text-xs sm:text-sm text-muted"><span className="font-medium text-ink">Reported issue:</span> {b.issue}</p>
              <div className="mt-6">
                <StatusTimeline steps={STEPS} current={b.status} history={b.status_history} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
