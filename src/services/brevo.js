import { BUSINESS } from '../utils/constants';
import { logMockEmail, getMockEmailLogs } from './mockData';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const STORAGE_BREVO_KEY = 'ms_brevo_config';

// Load stored Brevo configuration
export function getBrevoConfig() {
  let stored = {};
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_BREVO_KEY) : null;
    if (raw) stored = JSON.parse(raw);
  } catch {}

  const envKey = import.meta.env.VITE_BREVO_API_KEY || '';
  return {
    apiKey: stored.apiKey || envKey || '',
    senderName: stored.senderName || BUSINESS.name || 'MS ENTERPRISES',
    senderEmail: stored.senderEmail || BUSINESS.email || 'mohammedafiz447@gmail.com',
    businessRecipient: stored.businessRecipient || BUSINESS.email || 'mohammedafiz447@gmail.com',
  };
}

// Save Brevo configuration to localStorage
export function saveBrevoConfig(config) {
  try {
    const current = getBrevoConfig();
    const updated = { ...current, ...config };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_BREVO_KEY, JSON.stringify(updated));
    }
    return updated;
  } catch (err) {
    console.error('Failed to save Brevo config:', err);
    return null;
  }
}

// Check if Brevo is configured
export function isBrevoConfigured() {
  const { apiKey } = getBrevoConfig();
  return Boolean(apiKey && apiKey.trim().length > 10);
}

// Generate branded HTML email content
export function formatEmailHtml(body, title = 'MS ENTERPRISES Notification') {
  const escaped = String(body || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#ffffff">
  <div style="background:#0066FF;padding:22px 24px;text-align:left">
    <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:800;letter-spacing:0.5px">MS ENTERPRISES</h1>
    <p style="color:#dbeafe;margin:4px 0 0;font-size:12px;font-weight:500">Mobile Service &amp; Accessories · Bengaluru</p>
  </div>
  <div style="padding:28px 24px;font-size:14px;line-height:1.7;color:#334155">
    <div style="margin-bottom:18px;font-weight:700;font-size:16px;color:#0f172a">${title}</div>
    ${escaped.replace(/\n/g, '<br/>')}
  </div>
  <div style="padding:20px 24px;background:#f8fafd;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;line-height:1.6">
    <strong style="color:#0f172a">MS ENTERPRISES Store</strong><br/>
    📍 ${BUSINESS.addressFull}<br/>
    📞 Phone: <a href="tel:${BUSINESS.phone}" style="color:#0066FF;text-decoration:none">${BUSINESS.phone}</a> · ✉️ Email: <a href="mailto:${BUSINESS.email}" style="color:#0066FF;text-decoration:none">${BUSINESS.email}</a><br/>
    🌐 <a href="${BUSINESS.googleMapsUrl}" style="color:#0066FF;font-weight:bold;text-decoration:none">View Store on Google Maps →</a>
  </div>
</div>`;
}

// Send an email directly via Brevo API
export async function sendBrevoEmail({
  to,
  toName = '',
  subject,
  body,
  html = null,
  templateKey = 'custom',
}) {
  const config = getBrevoConfig();
  const recipient = (to || '').trim();
  const sub = (subject || '').trim() || 'MS ENTERPRISES Notification';
  const textBody = (body || '').trim() || 'This is a notification from MS ENTERPRISES.';
  const htmlContent = html || formatEmailHtml(textBody, sub);

  if (!recipient) {
    throw new Error('Recipient email is required.');
  }

  // If no Brevo API key is available, log as not_configured and notify
  if (!config.apiKey) {
    const log = logMockEmail({
      to: recipient,
      subject: sub,
      template: templateKey,
    });
    // Mark as not_configured in logs
    log.status = 'not_configured';
    log.error = 'Brevo API Key not configured. Add your Brevo API key in Email Settings.';
    return {
      success: false,
      status: 'not_configured',
      error: 'Brevo API Key is not configured. Please paste your Brevo API key in Email Settings to send live emails.',
      log,
    };
  }

  const payload = {
    sender: {
      name: config.senderName || 'MS ENTERPRISES',
      email: config.senderEmail || 'mohammedafiz447@gmail.com',
    },
    to: [
      {
        email: recipient,
        name: toName || recipient.split('@')[0],
      },
    ],
    replyTo: {
      email: config.businessRecipient || config.senderEmail,
      name: config.senderName,
    },
    subject: sub,
    htmlContent,
    textContent: textBody,
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': config.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || data.error || `Brevo API error HTTP ${response.status}`;
      const log = logMockEmail({
        to: recipient,
        subject: sub,
        template: templateKey,
      });
      log.status = 'failed';
      log.error = errorMsg;
      throw new Error(errorMsg);
    }

    // Success: log email and return messageId
    const messageId = data.messageId || `brevo_${Date.now()}`;
    const log = logMockEmail({
      to: recipient,
      subject: sub,
      template: templateKey,
    });
    log.status = 'sent';
    log.message_id = messageId;
    log.service = 'Brevo';
    log.sent_at = new Date().toISOString();

    return {
      success: true,
      status: 'sent',
      messageId,
      to: recipient,
      subject: sub,
      log,
      sent_at: log.sent_at,
    };
  } catch (err) {
    console.error('Brevo Email Send Error:', err);
    throw err;
  }
}

// Retry sending a logged email
export async function retryBrevoEmail(logId) {
  const logs = getMockEmailLogs();
  const log = logs.find((l) => String(l.id) === String(logId));
  if (!log) throw new Error('Email log not found.');

  const result = await sendBrevoEmail({
    to: log.to_email,
    subject: log.subject,
    body: log.body || 'Resent notification from MS ENTERPRISES.',
    templateKey: log.template_key || 'retry',
  });

  return result;
}

// Quick email templates for one-click sending
export const QUICK_TEMPLATES = [
  {
    id: 'test',
    name: 'Quick Test Email',
    subject: 'MS ENTERPRISES — Brevo Email Service Test',
    body: `Hello,\n\nThis is a live test email sent via Brevo Emailing Service from the MS ENTERPRISES admin dashboard.\nIf you received this email, your Brevo API integration is active and operating with 100% deliverability.\n\nThank you,\nMS ENTERPRISES Team`,
  },
  {
    id: 'order_update',
    name: 'Order Confirmation & Dispatch',
    subject: 'Your MS ENTERPRISES Order is Confirmed & In Progress',
    body: `Dear Customer,\n\nThank you for ordering with MS ENTERPRISES! We have confirmed your order and our dispatch team is currently packing your items.\n\nYou will receive your shipment shortly. If you have questions about your delivery, feel free to contact us.\n\nWarm regards,\nMS ENTERPRISES Support`,
  },
  {
    id: 'repair_ready',
    name: 'Repair Completed (Ready for Store Pickup)',
    subject: 'Good News! Your Phone Repair is Completed & Ready for Pickup',
    body: `Dear Customer,\n\nYour mobile repair at MS ENTERPRISES has been successfully completed and quality tested by our senior technician.\n\nYour phone is ready for pickup at our Shivaji Nagar store:\n📍 73, HKP Road, Sulthangunta, Shivaji Nagar, Bengaluru\n📞 Phone: 8088298447\n\nPlease bring your repair booking code when visiting.\n\nBest regards,\nMS ENTERPRISES Service Team`,
  },
  {
    id: 'enquiry_reply',
    name: 'Customer Support / Enquiry Response',
    subject: 'Reply to your enquiry — MS ENTERPRISES',
    body: `Dear Customer,\n\nThank you for contacting MS ENTERPRISES. In response to your enquiry, our team has reviewed your request.\n\nWe would be glad to assist you. You can reply directly to this email or visit our store at Shivaji Nagar, Bengaluru.\n\nSincerely,\nMohammed Afiz\nMS ENTERPRISES`,
  },
  {
    id: 'custom',
    name: 'Custom Email Message',
    subject: 'Important Message from MS ENTERPRISES',
    body: `Dear Customer,\n\nWrite your custom message here...\n\nThank you,\nMS ENTERPRISES`,
  },
];
