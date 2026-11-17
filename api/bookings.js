import supabase from './db-client.js';
import { withApi, HttpError, readBody, check, notAllowed } from './_lib/http.js';
import { currentUser } from './_lib/auth.js';
import { sendTemplate, businessRecipient, getSetting } from './_lib/email.js';
import * as v from './_lib/validate.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const randomCode = () =>
  'MSR-' + Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

async function uniqueCode() {
  for (let i = 0; i < 5; i += 1) {
    const code = randomCode();
    const existing = check(await supabase.from('repair_bookings').select('id').eq('booking_code', code).maybeSingle());
    if (!existing) return code;
  }
  throw new HttpError(500, 'Could not generate a booking ID. Please try again.');
}

const addDays = (isoDate, days) => {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

async function createBooking(req, res) {
  const body = readBody(req);
  const user = await currentUser(req, { required: false });
  const bookingSettings = await getSetting('booking', { time_slots: [], max_days_ahead: 30 });

  const serviceId = v.id(body.service_id, 'Repair type');
  const service = check(await supabase.from('repair_services').select('id,name').eq('id', serviceId).eq('is_active', true).maybeSingle());
  if (!service) throw new HttpError(400, 'Please choose a valid repair type.');

  const appointmentDate = v.date(body.appointment_date, 'Appointment date');
  const today = v.todayIST();
  if (appointmentDate < today) throw new HttpError(400, 'Appointment date cannot be in the past.');
  if (appointmentDate > addDays(today, bookingSettings.max_days_ahead || 30)) {
    throw new HttpError(400, `Appointments can be booked up to ${bookingSettings.max_days_ahead || 30} days ahead.`);
  }
  const preferredTime = v.text(body.preferred_time, 'Preferred time', { max: 40 });
  if (bookingSettings.time_slots?.length && !bookingSettings.time_slots.includes(preferredTime)) {
    throw new HttpError(400, 'Please choose one of the available time slots.');
  }

  const now = new Date().toISOString();
  const booking = {
    booking_code: await uniqueCode(),
    user_id: user?.id || null,
    customer_name: v.text(body.customer_name, 'Name', { min: 2, max: 80 }),
    phone: v.phone(body.phone),
    email: v.email(body.email),
    brand_name: v.text(body.brand_name, 'Brand', { max: 40 }),
    model_name: v.text(body.model_name, 'Model', { max: 80 }),
    service_id: service.id,
    service_name: service.name,
    issue: v.text(body.issue, 'Issue description', { min: 10, max: 1000 }),
    appointment_date: appointmentDate,
    preferred_time: preferredTime,
    status: 'Pending',
    status_history: [{ status: 'Pending', at: now, note: 'Booking received' }],
  };
  const saved = check(await supabase.from('repair_bookings').insert(booking).select().single());

  const vars = {
    booking_id: saved.booking_code,
    customer_name: saved.customer_name,
    phone: saved.phone,
    email: saved.email,
    device: `${saved.brand_name} ${saved.model_name}`,
    service: saved.service_name,
    issue: saved.issue,
    appointment: `${saved.appointment_date}, ${saved.preferred_time}`,
  };
  const related = { type: 'booking', id: saved.booking_code };
  const [businessMail, customerMail] = await Promise.all([
    sendTemplate('booking_business', await businessRecipient(), vars, related),
    sendTemplate('booking_customer', saved.email, vars, related),
  ]);

  return res.status(201).json({
    booking: saved,
    emails: { business: businessMail?.status || 'failed', customer: customerMail?.status || 'failed' },
  });
}

const PUBLIC_FIELDS =
  'booking_code,customer_name,brand_name,model_name,service_name,issue,appointment_date,preferred_time,status,status_history,estimated_cost,technician_name,created_at';

export default withApi(async (req, res) => {
  if (req.method === 'POST') return createBooking(req, res);
  if (req.method !== 'GET') return notAllowed();

  if (req.query.action === 'track') {
    const code = v.text(req.query.code, 'Booking ID', { max: 20 }).toUpperCase();
    const phone = v.phone(req.query.phone);
    const booking = check(
      await supabase.from('repair_bookings').select(`${PUBLIC_FIELDS},phone`).eq('booking_code', code).maybeSingle()
    );
    if (!booking || booking.phone !== phone) {
      throw new HttpError(404, 'No booking found with this Booking ID and phone number.');
    }
    delete booking.phone;
    return res.status(200).json(booking);
  }

  if (req.query.action === 'mine') {
    const user = await currentUser(req);
    const data = check(
      await supabase
        .from('repair_bookings')
        .select(PUBLIC_FIELDS)
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .order('created_at', { ascending: false })
    );
    return res.status(200).json(data);
  }
  throw new HttpError(404, 'Unknown action');
});
