import nodemailer from 'nodemailer';
import supabase from '../db-client.js';

export const DEFAULT_RECIPIENT = 'mohammedafiz447@gmail.com';
export const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
export const BREVO_SMTP_HOST = 'smtp-relay.brevo.com';

// Check if Brevo Emailing Service is configured (via API Key or Brevo SMTP Relay)
export const brevoConfigured = () =>
  Boolean(
    process.env.BREVO_API_KEY ||
    process.env.VITE_BREVO_API_KEY ||
    (process.env.SMTP_USER && (process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS))
  );

export const smtpConfigured = () => brevoConfigured();

let transporter;
function getBrevoTransporter() {
  if (!transporter) {
    const host = process.env.SMTP_HOST || BREVO_SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.BREVO_SMTP_USER || process.env.SMTP_USER;
    const pass = process.env.BREVO_SMTP_PASS || process.env.BREVO_API_KEY || process.env.SMTP_PASS;
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
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
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#ffffff">
  <div style="background:#0066FF;padding:22px 24px;text-align:left">
    <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:800;letter-spacing:0.5px">MS ENTERPRISES</h1>
    <p style="color:#dbeafe;margin:4px 0 0;font-size:12px;font-weight:500">Mobile Service &amp; Accessories · Bengaluru</p>
  </div>
  <div style="padding:28px 24px;font-size:14px;line-height:1.7;color:#334155">
    ${escapeHtml(body).replace(/\n/g, '<br/>')}
  </div>
  <div style="padding:20px 24px;background:#f8fafd;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;line-height:1.6">
    <strong style="color:#0f172a">MS ENTERPRISES Store</strong><br/>
    📍 73, HKP Road, Sulthangunta, Shivaji Nagar, Bengaluru, Karnataka 560051<br/>
    📞 Phone: 8088298447 · ✉️ Email: mohammedafiz447@gmail.com<br/>
    <a href="https://maps.google.com/?q=73,+HKP+Road,+Sulthangunta,+Shivaji+Nagar,+Bengaluru,+Karnataka+560051" style="color:#0066FF;font-weight:bold;text-decoration:none">View Store on Google Maps →</a>
  </div>
</div>`;
}

// Send transactional email via Brevo REST API (native HTTPS, zero port blocks)
async function sendViaBrevoApi(apiKey, { sender, to, subject, body, replyTo }) {
  const payload = {
    sender: {
      name: sender.name || 'MS ENTERPRISES',
      email: sender.email || DEFAULT_RECIPIENT,
    },
    to: [{ email: to }],
    replyTo: replyTo ? { email: replyTo } : undefined,
    subject,
    htmlContent: toHtml(body),
    textContent: body,
  };

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || data.error || `Brevo API HTTP ${response.status}`;
    throw new Error(errorMsg);
  }
  return data; // { messageId: '<...>' }
}

// Attempts delivery of an existing email_logs row and records the real outcome.
export async function deliver(log) {
  const attempts = (log.attempts || 0) + 1;
  const settings = await getSetting('email');
  const apiKey = process.env.BREVO_API_KEY || process.env.VITE_BREVO_API_KEY || settings.brevo_api_key;
  const hasSmtp = Boolean(process.env.SMTP_USER && (process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS));

  if (!apiKey && !hasSmtp) {
    const { data } = await supabase
      .from('email_logs')
      .update({
        status: 'not_configured',
        attempts,
        error: 'Brevo Emailing Service is not configured. Add BREVO_API_KEY to environment or settings.',
      })
      .eq('id', log.id)
      .select()
      .single();
    return data;
  }

  const sender = {
    name: settings.sender_name || process.env.BREVO_SENDER_NAME || 'MS ENTERPRISES',
    email: settings.sender_email || process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM || DEFAULT_RECIPIENT,
  };
  const replyTo = settings.business_recipient || DEFAULT_RECIPIENT;

  try {
    let messageId = null;

    if (apiKey) {
      // 1. Primary: Official Brevo REST API
      const result = await sendViaBrevoApi(apiKey, {
        sender,
        to: log.to_email,
        subject: log.subject,
        body: log.body,
        replyTo,
      });
      messageId = result.messageId;
    } else {
      // 2. Secondary fallback: Brevo SMTP Relay
      const info = await getBrevoTransporter().sendMail({
        from: `"${sender.name}" <${sender.email}>`,
        replyTo,
        to: log.to_email,
        subject: log.subject,
        text: log.body,
        html: toHtml(log.body),
      });
      messageId = info.messageId;
    }

    const { data } = await supabase
      .from('email_logs')
      .update({
        status: 'sent',
        attempts,
        error: null,
        sent_at: new Date().toISOString(),
        message_id: messageId,
      })
      .eq('id', log.id)
      .select()
      .single();
    return data;
  } catch (err) {
    const errorMsg = String(err.message || err).slice(0, 500);
    const { data } = await supabase
      .from('email_logs')
      .update({ status: 'failed', attempts, error: errorMsg })
      .eq('id', log.id)
      .select()
      .single();
    return data;
  }
}

// Renders a stored template, logs it and tries to deliver it via Brevo.
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
    console.error('Brevo Email error:', err);
    return null;
  }
}

export async function sendRaw(to, subject, body, relatedType = 'manual_brevo') {
  const { data: log, error } = await supabase
    .from('email_logs')
    .insert({
      template_key: 'brevo_send',
      to_email: to,
      subject,
      body,
      status: 'pending',
      attempts: 0,
      related_type: relatedType,
    })
    .select()
    .single();
  if (error) throw error;
  return deliver(log);
}
