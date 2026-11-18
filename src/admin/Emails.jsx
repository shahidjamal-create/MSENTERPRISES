import { useEffect, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Mail, RefreshCw, RotateCcw, Send, Sparkles, Zap } from 'lucide-react';
import { AdminHeader } from './AdminLayout';
import Modal from '../components/ui/Modal';
import { Checkbox, Field, Input, Select, Textarea } from '../components/ui/Form';
import { Alert, EmptyState, ErrorState, PageLoader } from '../components/ui/Feedback';
import StatusBadge from '../components/ui/StatusBadge';
import { opsApi, errorMessage } from '../services/api';
import { getBrevoConfig, saveBrevoConfig, isBrevoConfigured, QUICK_TEMPLATES } from '../services/brevo';
import { useAsync } from '../hooks/useAsync';
import { useToast } from '../context/ToastContext';
import { capitalize, formatDateTime, isValidEmail } from '../utils/format';
import { BUSINESS } from '../utils/constants';

const STATUSES = ['sent', 'failed', 'not_configured', 'disabled', 'pending'];

function OneClickSendEmail({ brevoActive, onSent }) {
  const toast = useToast();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState(QUICK_TEMPLATES[0].subject);
  const [body, setBody] = useState(QUICK_TEMPLATES[0].body);
  const [selectedTemplate, setSelectedTemplate] = useState('test');
  const [sending, setSending] = useState(false);
  const [lastSentResult, setLastSentResult] = useState(null);

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    const tmpl = QUICK_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setSubject(tmpl.subject);
      setBody(tmpl.body);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const cleanTo = to.trim();
    if (!isValidEmail(cleanTo)) {
      toast('Please enter a valid recipient email address.', 'error');
      return;
    }
    if (!subject.trim()) {
      toast('Please enter an email subject.', 'error');
      return;
    }
    if (!body.trim()) {
      toast('Please write a message to send.', 'error');
      return;
    }

    setSending(true);
    setLastSentResult(null);

    try {
      const res = await opsApi.post('emails', {
        to: cleanTo,
        subject: subject.trim(),
        body: body.trim(),
        templateKey: selectedTemplate,
      }, 'send');

      if (res.status === 'sent' || res.success) {
        const msgId = res.messageId || res.log?.message_id || `brevo_${Date.now()}`;
        const sentData = {
          to: cleanTo,
          subject: subject.trim(),
          messageId: msgId,
          timestamp: new Date().toISOString(),
        };
        setLastSentResult(sentData);
        toast(`Mail sent successfully to ${cleanTo} via Brevo!`, 'success');
        onSent?.();
      } else {
        const errMsg = res.error || 'Failed to deliver email through Brevo.';
        toast(errMsg, 'error');
        setLastSentResult({ error: errMsg, to: cleanTo });
      }
    } catch (err) {
      const errMsg = errorMessage(err, 'Failed to send email via Brevo.');
      toast(errMsg, 'error');
      setLastSentResult({ error: errMsg, to: cleanTo });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card mb-6 border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">One-Click Send Email (Brevo Service)</h2>
            <p className="text-[11px] text-slate-500">Send transactional &amp; customer notification emails directly via Brevo</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            brevoActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${brevoActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {brevoActive ? 'Brevo Connected' : 'Brevo Key Missing'}
          </span>
        </div>
      </div>

      {/* Frontend Live Mail Sent Message Display */}
      {lastSentResult && (
        <div className="mb-4 animate-in fade-in duration-200">
          {lastSentResult.error ? (
            <Alert tone="error" title="Email Delivery Failed">
              {lastSentResult.error}
            </Alert>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-2xs">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 text-xs">
                  <p className="text-sm font-bold text-emerald-900">Mail Sent Successfully via Brevo!</p>
                  <p className="mt-1 text-emerald-800">
                    Your message was accepted by the Brevo Emailing Service and delivered to <strong className="font-semibold">{lastSentResult.to}</strong>.
                  </p>
                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg bg-white/80 p-2.5 border border-emerald-100 font-mono text-[11px] text-slate-700">
                    <div>
                      <span className="text-slate-400 block font-sans">Subject:</span>
                      <span className="font-medium text-slate-900 truncate block">{lastSentResult.subject}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-sans">Brevo Message ID:</span>
                      <span className="font-semibold text-emerald-700 truncate block">{lastSentResult.messageId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSend} className="space-y-4" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Choose Template / Preset">
            <Select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="text-xs"
            >
              {QUICK_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Recipient Email" required>
            <Input
              type="email"
              placeholder="customer@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="text-xs"
              autoComplete="email"
            />
          </Field>
        </div>

        <Field label="Subject" required>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Order Update — MS ENTERPRISES"
            className="text-xs"
          />
        </Field>

        <Field label="Message Body" required hint="Delivered as a formatted HTML email with store header and footer">
          <Textarea
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="font-sans text-xs"
            placeholder="Write your email message..."
          />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-slate-400">
            Powered by <strong>Brevo Email API</strong> · Sender: <code>mohammedafiz447@gmail.com</code>
          </p>
          <button
            type="submit"
            disabled={sending}
            className="btn btn-primary px-5 py-2 text-xs font-bold shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            {sending ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Sending via Brevo…</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>One-Click Send Email</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Logs({ brevoActive }) {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState(null);
  const { data, loading, error, reload } = useAsync(() => opsApi.list('emails', { status }), [status]);

  const retry = async (log) => {
    setBusy(log.id);
    try {
      const res = await opsApi.post('emails', { id: log.id }, 'retry');
      if (res.status === 'sent' || res.success) {
        toast(`Email resent successfully via Brevo to ${log.to_email}!`, 'success');
      } else {
        toast(`Not sent: ${res.error || 'Check Brevo configuration'}`, 'error');
      }
      reload();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <OneClickSendEmail brevoActive={brevoActive} onSent={reload} />

      <div className="mb-4 flex items-center justify-between gap-3">
        <Select className="w-full sm:w-56 text-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {capitalize(s)}
            </option>
          ))}
        </Select>
        <button
          onClick={reload}
          className="btn btn-outline btn-sm text-xs flex items-center gap-1.5"
          title="Refresh email log"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Log
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data?.logs || data.logs.length === 0 ? (
        <EmptyState title="No emails logged" message="Enquiries, bookings, orders and one-click sends appear here." />
      ) : (
        <div className="card overflow-x-auto shadow-xs">
          <table className="table-base">
            <thead>
              <tr>
                <th>Date</th>
                <th>Recipient</th>
                <th>Subject</th>
                <th>Template / Type</th>
                <th>Status</th>
                <th className="text-right">Tries</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.logs.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap text-xs">{formatDateTime(log.created_at)}</td>
                  <td className="break-all text-xs font-medium text-slate-800">{log.to_email}</td>
                  <td className="min-w-[200px]">
                    <button
                      className="text-left font-medium text-slate-900 hover:text-[#0066FF] transition-colors"
                      onClick={() => setViewing(log)}
                    >
                      {log.subject}
                    </button>
                  </td>
                  <td className="text-xs text-muted">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono">
                      {log.template_key || 'general'}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="text-right text-xs font-semibold">{log.attempts || 1}</td>
                  <td className="whitespace-nowrap text-right">
                    <button
                      className="btn btn-outline btn-sm text-xs inline-flex items-center gap-1"
                      onClick={() => retry(log)}
                      disabled={busy === log.id}
                      title="Resend email with Brevo"
                    >
                      <RotateCcw className={`h-3 w-3 ${busy === log.id ? 'animate-spin' : ''}`} />
                      <span>{busy === log.id ? 'Sending…' : 'Resend'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Email Details Modal */}
      <Modal open={!!viewing} title="Email Details" onClose={() => setViewing(null)} size="lg">
        {viewing && (
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <p><span className="text-slate-400">Recipient:</span> <strong className="text-slate-800 break-all">{viewing.to_email}</strong></p>
              <p><span className="text-slate-400">Template:</span> <code className="text-slate-700">{viewing.template_key}</code></p>
              <p><span className="text-slate-400">Delivery Service:</span> <strong className="text-[#0066FF]">Brevo Emailing Service</strong></p>
              <p><span className="text-slate-400">Status:</span> <StatusBadge status={viewing.status} /></p>
              {viewing.message_id && (
                <p className="sm:col-span-2 font-mono text-[11px]"><span className="text-slate-400 font-sans">Brevo ID:</span> {viewing.message_id}</p>
              )}
              {viewing.sent_at && (
                <p className="sm:col-span-2 text-slate-500">Sent at: {formatDateTime(viewing.sent_at)}</p>
              )}
            </div>
            <p className="text-sm font-bold text-slate-900">{viewing.subject}</p>
            {viewing.error && <Alert tone="error">{viewing.error}</Alert>}
            <pre className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 font-sans text-xs leading-relaxed text-slate-800">
              {viewing.body || 'No text body recorded.'}
            </pre>
          </div>
        )}
      </Modal>
    </>
  );
}

function Templates() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => opsApi.list('templates'), []);
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!editing.subject.trim() || editing.body.trim().length < 10) return setFormError('Subject and body are required.');
    setSaving(true);
    try {
      await opsApi.update('templates', editing);
      toast('Template saved successfully.');
      setEditing(null);
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return (
    <>
      <div className="card divide-y divide-line shadow-xs">
        {data.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{t.name}</p>
              <p className="truncate text-xs text-muted">{t.subject}</p>
            </div>
            <StatusBadge tone={t.is_enabled ? 'green' : 'grey'} label={t.is_enabled ? 'Enabled' : 'Disabled'} />
            <button className="btn btn-outline btn-sm" onClick={() => { setFormError(''); setEditing({ ...t }); }}>Edit</button>
          </div>
        ))}
      </div>
      <Modal open={!!editing} size="lg" title={editing?.name} onClose={() => setEditing(null)} footer={<><button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
        {editing && (
          <div className="space-y-4">
            {formError && <Alert tone="error">{formError}</Alert>}
            <Field label="Subject"><Input value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} /></Field>
            <Field label="Body" hint={`Placeholders: ${editing.placeholders || ''}`}>
              <Textarea rows={10} className="font-mono text-xs" value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
            </Field>
            <Checkbox label="Enabled" checked={editing.is_enabled} onChange={(v) => setEditing({ ...editing, is_enabled: v })} />
          </div>
        )}
      </Modal>
    </>
  );
}

function EmailSettings({ onConfigSaved }) {
  const toast = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [senderName, setSenderName] = useState(BUSINESS.name);
  const [senderEmail, setSenderEmail] = useState(BUSINESS.email);
  const [businessRecipient, setBusinessRecipient] = useState(BUSINESS.email);
  const [notifyEnquiry, setNotifyEnquiry] = useState(true);
  const [notifyBooking, setNotifyBooking] = useState(true);
  const [notifyOrder, setNotifyOrder] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const config = getBrevoConfig();
    if (config.apiKey) setApiKey(config.apiKey);
    if (config.senderName) setSenderName(config.senderName);
    if (config.senderEmail) setSenderEmail(config.senderEmail);
    if (config.businessRecipient) setBusinessRecipient(config.businessRecipient);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (!isValidEmail(businessRecipient)) {
      toast('Please enter a valid notification recipient email.', 'error');
      return;
    }
    if (!isValidEmail(senderEmail)) {
      toast('Please enter a valid sender email.', 'error');
      return;
    }

    saveBrevoConfig({
      apiKey: apiKey.trim(),
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim(),
      businessRecipient: businessRecipient.trim(),
    });

    toast('Brevo Email settings saved successfully!', 'success');
    onConfigSaved?.();
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast('Please enter your Brevo API key first.', 'error');
      return;
    }
    setTestingConnection(true);
    setTestResult(null);

    // Temporarily save key
    saveBrevoConfig({
      apiKey: apiKey.trim(),
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim(),
      businessRecipient: businessRecipient.trim(),
    });

    try {
      const res = await opsApi.post('emails', {
        to: businessRecipient.trim(),
        subject: 'MS ENTERPRISES — Brevo Connection Test',
        body: 'Congratulations! Your Brevo Emailing Service connection is active and fully functional. Transactional customer emails are now enabled.',
      }, 'test');

      if (res.status === 'sent' || res.success) {
        setTestResult({
          tone: 'success',
          message: `Connection Verified! Test email was successfully delivered to ${businessRecipient} via Brevo.`,
        });
        toast('Brevo connection verified!', 'success');
        onConfigSaved?.();
      } else {
        setTestResult({
          tone: 'error',
          message: res.error || 'Connection failed. Please check your Brevo API key.',
        });
      }
    } catch (err) {
      setTestResult({
        tone: 'error',
        message: errorMessage(err, 'Failed to connect to Brevo API.'),
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="card max-w-2xl space-y-5 p-5 shadow-xs">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#0066FF]" /> Brevo Emailing Service Setup
        </h2>
        <p className="text-xs text-muted">
          Configure Brevo Transactional Email (v3 API). Replaces Gmail SMTP with zero app passwords, zero port blocks and instant delivery.
        </p>
      </div>

      {testResult && <Alert tone={testResult.tone}>{testResult.message}</Alert>}

      <form onSubmit={handleSave} className="space-y-4" noValidate>
        {/* Brevo API Key */}
        <Field
          label="Brevo API Key (v3)"
          hint="From Brevo Dashboard > SMTP & API > API Keys > Generate a new API key (xkeysib-...)"
          required
        >
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="pr-10 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sender Name" required>
            <Input
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="MS ENTERPRISES"
            />
          </Field>
          <Field label="Sender Email (Verified in Brevo)" required>
            <Input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="mohammedafiz447@gmail.com"
            />
          </Field>
        </div>

        <Field
          label="Business Notification Recipient"
          hint="All new customer enquiries, repair bookings and orders are delivered here."
          required
        >
          <Input
            type="email"
            value={businessRecipient}
            onChange={(e) => setBusinessRecipient(e.target.value)}
            placeholder="mohammedafiz447@gmail.com"
          />
        </Field>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-900">Automated Customer Notifications (Brevo)</p>
          <Checkbox
            label="Send instant confirmation for Contact Enquiries"
            checked={notifyEnquiry}
            onChange={setNotifyEnquiry}
          />
          <br />
          <Checkbox
            label="Send status updates for Repair Bookings"
            checked={notifyBooking}
            onChange={setNotifyBooking}
          />
          <br />
          <Checkbox
            label="Send order confirmation & tracking updates for Shop Orders"
            checked={notifyOrder}
            onChange={setNotifyOrder}
          />
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-slate-700 space-y-1">
          <p className="font-bold text-[#0066FF] flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> High Deliverability via Brevo
          </p>
          <p>
            Outgoing emails are delivered using Brevo's global transactional email network. Store address (73, HKP Road, Shivaji Nagar) and contact numbers are automatically included in outgoing footers.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="btn btn-outline text-xs flex items-center gap-1.5"
          >
            {testingConnection ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 text-[#0066FF]" />}
            <span>{testingConnection ? 'Testing…' : 'Test Brevo Connection'}</span>
          </button>
          <button type="submit" className="btn btn-primary text-xs font-bold">
            Save Brevo Settings
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Emails() {
  const [tab, setTab] = useState('logs');
  const [brevoActive, setBrevoActive] = useState(isBrevoConfigured());
  const settings = useAsync(() => opsApi.list('settings'), []);

  const refreshBrevoState = () => {
    setBrevoActive(isBrevoConfigured());
  };

  return (
    <>
      <AdminHeader
        title="Email Management"
        description="Brevo Emailing Service, live one-click sends, templates and notification logs."
      />

      {/* Brevo Email Service Status Banner */}
      {brevoActive ? (
        <Alert tone="success" className="mb-5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Brevo Emailing Service is active.</strong> Customer notifications and one-click sends are delivered directly via Brevo API with verified inbox delivery.
            </span>
          </div>
        </Alert>
      ) : (
        <Alert tone="warning" className="mb-5" title="Brevo Emailing Service Not Yet Configured">
          Outgoing email is currently unconfigured. Add your <strong>Brevo API Key</strong> in the <strong>Settings</strong> tab to enable live one-click email delivery.
        </Alert>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-line">
        {[
          ['logs', 'Email Log & One-Click Send'],
          ['templates', 'Templates'],
          ['settings', 'Brevo Settings'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors ${
              tab === key ? 'border-[#0066FF] text-[#0066FF]' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'logs' && <Logs brevoActive={brevoActive} />}
      {tab === 'templates' && <Templates />}
      {tab === 'settings' && <EmailSettings onConfigSaved={refreshBrevoState} />}
    </>
  );
}
