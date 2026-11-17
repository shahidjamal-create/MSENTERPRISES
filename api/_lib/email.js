import nodemailer from 'nodemailer';
import supabase from '../db-client.js';

export const DEFAULT_RECIPIENT = 'mohammedafiz447@gmail.com';

export const smtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter;
function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function getSetting(key, fallback = {}) {
  const { data } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
  return { ...fallback, ...(data?.value || {}) };
}

export async function businessRecipient() {
  const settings = await getSetting('email');
  return settings.business_recipient || DEFAULT_RECIPIENT;
}

const fill = (template, vars) =>
  String(template || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => (vars[key] ?? '').toString());

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function toHtml(body) {
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#202938;line-height:1.6">
  <div style="background:#10243A;color:#fff;padding:14px 18px;font-weight:bold">MS ENTERPRISES — Mobile Service & Accessories</div>
  <div style="padding:18px">${escapeHtml(body).replace(/\n/g, '<br>')}</div>
  <div style="padding:14px 18px;color:#4b5563;font-size:12px;background:#f9fafb;border-top:1px solid #e5e7eb;line-height:1.5">
    <strong>MS ENTERPRISES</strong><br>
    📍 73, HKP Road, Sulthangunta, Shivaji Nagar, Bengaluru, Karnataka 560051<br>
    📞 8088298447 · ✉️ mohammedafiz447@gmail.com · <a href="https://maps.google.com/?q=73,+HKP+Road,+Sulthangunta,+Shivaji+Nagar,+Bengaluru,+Karnataka+560051" style="color:#0ea5e9;text-decoration:none">View on Google Maps</a>
  </div>
</div>`;
}

// Attempts delivery of an existing email_logs row and records the real outcome.
export async function deliver(log) {
  const attempts = (log.attempts || 0) + 1;
  if (!smtpConfigured()) {
    const { data } = await supabase
      .from('email_logs')
      .update({
        status: 'not_configured',
        attempts,
        error: 'SMTP is not configured on the server (SMTP_HOST, SMTP_USER, SMTP_PASS). Email was not sent.',
      })
      .eq('id', log.id)
      .select()
      .single();
    return data;
  }

  const settings = await getSetting('email');
  try {
    await getTransporter().sendMail({
      from: `"${settings.sender_name || 'MS ENTERPRISES'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      replyTo: settings.business_recipient || DEFAULT_RECIPIENT,
      to: log.to_email,
      subject: log.subject,
      text: log.body,
      html: toHtml(log.body),
    });
    const { data } = await supabase
      .from('email_logs')
      .update({ status: 'sent', attempts, error: null, sent_at: new Date().toISOString() })
      .eq('id', log.id)
      .select()
      .single();
    return data;
  } catch (err) {
    const { data } = await supabase
      .from('email_logs')
      .update({ status: 'failed', attempts, error: String(err.message || err).slice(0, 500) })
      .eq('id', log.id)
      .select()
      .single();
    return data;
  }
}

// Renders a stored template, logs it and tries to deliver it.
// Never throws: email trouble must not break orders or bookings.
export async function sendTemplate(templateKey, to, vars, related = {}) {
  try {
    const settings = await getSetting('email');
    const group = templateKey.split('_')[0]; // enquiry | booking | order
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('key', templateKey)
      .maybeSingle();

    const enabled = Boolean(template) && template.is_enabled !== false && settings[`notify_${group}`] !== false;
    const { data: log, error } = await supabase
      .from('email_logs')
      .insert({
        template_key: templateKey,
        to_email: to,
        subject: fill(template?.subject || templateKey, vars),
        body: fill(template?.body || '', vars),
        status: enabled ? 'pending' : 'disabled',
        attempts: 0,
        related_type: related.type || null,
        related_id: related.id ? String(related.id) : null,
      })
      .select()
      .single();
    if (error) throw error;
    if (!enabled) return log;
    return await deliver(log);
  } catch (err) {
    console.error('Email error:', err);
    return null;
  }
}

export async function sendRaw(to, subject, body, relatedType = 'test') {
  const { data: log, error } = await supabase
    .from('email_logs')
    .insert({ template_key: 'test', to_email: to, subject, body, status: 'pending', attempts: 0, related_type: relatedType })
    .select()
    .single();
  if (error) throw error;
  return deliver(log);
}
