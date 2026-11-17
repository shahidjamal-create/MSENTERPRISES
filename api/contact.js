import supabase from './db-client.js';
import { withApi, HttpError, readBody, check, notAllowed } from './_lib/http.js';
import { sendTemplate, businessRecipient } from './_lib/email.js';
import * as v from './_lib/validate.js';

export default withApi(async (req, res) => {
  if (req.method !== 'POST') return notAllowed();
  const body = readBody(req);

  if (body.kind === 'review') {
    const review = {
      customer_name: v.text(body.customer_name, 'Name', { min: 2, max: 60 }),
      rating: v.number(body.rating, 'Rating', { min: 1, max: 5, integer: true }),
      comment: v.text(body.comment, 'Review', { min: 10, max: 600 }),
      is_approved: false,
    };
    check(await supabase.from('reviews').insert(review));
    return res.status(201).json({ message: 'Thank you! Your review will appear once the store approves it.' });
  }

  if (body.kind !== 'enquiry') throw new HttpError(400, 'Unknown request type.');

  const enquiry = {
    name: v.text(body.name, 'Name', { min: 2, max: 80 }),
    email: v.email(body.email),
    phone: v.phone(body.phone, 'Phone number', { required: false }),
    subject: v.text(body.subject, 'Subject', { min: 3, max: 120 }),
    message: v.text(body.message, 'Message', { min: 10, max: 2000 }),
    status: 'new',
  };
  const saved = check(await supabase.from('enquiries').insert(enquiry).select().single());

  const vars = { ...enquiry, phone: enquiry.phone || 'Not provided', enquiry_id: saved.id };
  const related = { type: 'enquiry', id: saved.id };
  const [businessMail, customerMail] = await Promise.all([
    sendTemplate('enquiry_business', await businessRecipient(), vars, related),
    sendTemplate('enquiry_customer', enquiry.email, vars, related),
  ]);

  return res.status(201).json({
    enquiry: { id: saved.id },
    emails: { business: businessMail?.status || 'failed', customer: customerMail?.status || 'failed' },
  });
});
