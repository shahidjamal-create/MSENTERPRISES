import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { AdminHeader } from './AdminLayout';
import Modal from '../components/ui/Modal';
import { Field, Input, Select, Textarea, Checkbox } from '../components/ui/Form';
import { Alert, EmptyState, ErrorState, PageLoader } from '../components/ui/Feedback';
import StatusBadge from '../components/ui/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import { opsApi, errorMessage } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BOOKING_STATUSES } from '../utils/constants';
import { formatDate, formatDateTime } from '../utils/format';

const emailNote = (status) =>
  status === 'sent' ? 'Customer notified by email.' : status === 'not_configured' ? 'Email not sent (SMTP not configured).' : status === 'failed' ? 'Email failed — see Email Management.' : '';

function ManageBooking({ booking, isTechnician, technicians, onClose, onSaved }) {
  const [form, setForm] = useState({
    status: booking.status,
    technician_id: booking.technician_id || '',
    estimated_cost: booking.estimated_cost ?? '',
    admin_notes: booking.admin_notes || '',
    note: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    if (form.estimated_cost !== '' && Number(form.estimated_cost) < 0) return setError('Estimated cost cannot be negative.');
    setSaving(true);
    setError('');
    try {
      const payload = { id: booking.id, status: form.status, estimated_cost: form.estimated_cost, admin_notes: form.admin_notes, note: form.note };
      if (!isTechnician) payload.technician_id = form.technician_id || null;
      const res = await opsApi.update('bookings', payload);
      onSaved(emailNote(res.email_status));
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      size="lg"
      title={`Booking ${booking.booking_code}`}
      onClose={onClose}
      footer={<><button className="btn btn-outline" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></>}
    >
      {error && <Alert tone="error" className="mb-4">{error}</Alert>}
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-muted">Customer</dt><dd className="font-medium">{booking.customer_name}</dd></div>
        <div><dt className="text-muted">Contact</dt><dd className="font-medium"><a href={`tel:${booking.phone}`} className="text-brand">{booking.phone}</a> · <span className="break-all">{booking.email}</span></dd></div>
        <div><dt className="text-muted">Device</dt><dd className="font-medium">{booking.brand_name} {booking.model_name}</dd></div>
        <div><dt className="text-muted">Service</dt><dd className="font-medium">{booking.service_name}</dd></div>
        <div><dt className="text-muted">Appointment</dt><dd className="font-medium">{formatDate(booking.appointment_date)} · {booking.preferred_time}</dd></div>
        <div><dt className="text-muted">Booked on</dt><dd className="font-medium">{formatDateTime(booking.created_at)}</dd></div>
      </dl>
      <p className="mt-3 rounded-lg bg-surface p-3 text-sm"><span className="font-medium">Issue:</span> {booking.issue}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <Select value={form.status} onChange={set('status')}>
            {BOOKING_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Technician">
          {isTechnician ? (
            <Input value={booking.technician_name || 'Will be assigned to you on save'} disabled />
          ) : (
            <Select value={form.technician_id} onChange={set('technician_id')}>
              <option value="">Unassigned</option>
              {technicians.map((t) => <option key={t.id} value={t.id}>{t.full_name || t.email}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Estimated cost (₹)">
          <Input type="number" min="0" value={form.estimated_cost} onChange={set('estimated_cost')} />
        </Field>
        <Field label="Status note (shown to customer)">
          <Input value={form.note} onChange={set('note')} maxLength={200} placeholder="e.g. Display ordered, arrives Friday" />
        </Field>
        <Field label="Internal notes" className="sm:col-span-2">
          <Textarea rows={2} value={form.admin_notes} onChange={set('admin_notes')} />
        </Field>
      </div>
      <div className="mt-5">
        <h3 className="mb-2 text-sm font-semibold">History</h3>
        <StatusTimeline steps={[]} current="" history={booking.status_history || []} />
      </div>
    </Modal>
  );
}

export default function Bookings() {
  const { user } = useAuth();
  const toast = useToast();
  const isTechnician = user.role === 'technician';
  const [status, setStatus] = useState('');
  const [mine, setMine] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const { data, loading, error, reload } = useAsync(() => opsApi.list('bookings', { status, mine: mine ? '1' : '' }), [status, mine]);
  const technicians = useAsync(() => (isTechnician ? Promise.resolve([]) : opsApi.list('technicians')), []);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data || []).filter((b) => !term || [b.booking_code, b.customer_name, b.phone, b.model_name, b.brand_name].some((v) => String(v).toLowerCase().includes(term)));
  }, [data, search]);

  return (
    <>
      <AdminHeader title="Repair Bookings" description="Update status, assign technicians and share estimates. Customers are emailed on each status change." />
      <div className="mb-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5 sm:gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input className="pl-9 text-sm" placeholder="Booking ID, name, phone, model…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select className="w-full sm:w-52 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </Select>
        {isTechnician && <Checkbox label="Only my jobs" checked={mine} onChange={setMine} />}
      </div>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState title="No bookings found" message="Bookings made on the website appear here." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Booking</th><th>Customer</th><th>Device / Service</th><th>Appointment</th><th>Technician</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td className="whitespace-nowrap font-semibold">{b.booking_code}</td>
                  <td className="whitespace-nowrap">{b.customer_name}<span className="block text-xs text-muted">{b.phone}</span></td>
                  <td className="min-w-[180px]">{b.brand_name} {b.model_name}<span className="block text-xs text-muted">{b.service_name}</span></td>
                  <td className="whitespace-nowrap">{formatDate(b.appointment_date)}<span className="block text-xs text-muted">{b.preferred_time}</span></td>
                  <td className="whitespace-nowrap text-xs">{b.technician_name || <span className="text-muted">Unassigned</span>}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td className="text-right"><button className="btn btn-outline btn-sm" onClick={() => setSelected(b)}>Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <ManageBooking
          booking={selected}
          isTechnician={isTechnician}
          technicians={technicians.data || []}
          onClose={() => setSelected(null)}
          onSaved={(note) => {
            toast(`Booking updated. ${note}`);
            setSelected(null);
            reload();
          }}
        />
      )}
    </>
  );
}
