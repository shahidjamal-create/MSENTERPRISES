import { useEffect, useState } from 'react';
import { RotateCcw, Send } from 'lucide-react';
import { AdminHeader } from './AdminLayout';
import Modal from '../components/ui/Modal';
import { Checkbox, Field, Input, Select, Textarea } from '../components/ui/Form';
import { Alert, EmptyState, ErrorState, PageLoader } from '../components/ui/Feedback';
import StatusBadge from '../components/ui/StatusBadge';
import { opsApi, errorMessage } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { useToast } from '../context/ToastContext';
import { capitalize, formatDateTime, isValidEmail } from '../utils/format';
import { BUSINESS } from '../utils/constants';

const STATUSES = ['sent', 'failed', 'not_configured', 'disabled', 'pending'];

function Logs({ smtpConfigured }) {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState(null);
  const [testTo, setTestTo] = useState('');
  const [testResult, setTestResult] = useState(null);
  const { data, loading, error, reload } = useAsync(() => opsApi.list('emails', { status }), [status]);

  const retry = async (log) => {
    setBusy(log.id);
    try {
      const res = await opsApi.post('emails', { id: log.id }, 'retry');
      toast(res.status === 'sent' ? 'Email sent.' : `Not sent: ${res.error}`, res.status === 'sent' ? 'success' : 'error');
      reload();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(null);
    }
  };

  const sendTest = async (e) => {
    e.preventDefault();
    if (!isValidEmail(testTo)) return setTestResult({ tone: 'error', message: 'Enter a valid email address.' });
    setBusy('test');
    try {
      const res = await opsApi.post('emails', { to: testTo }, 'test');
      setTestResult(res.status === 'sent' ? { tone: 'success', message: `Test email sent to ${testTo}.` } : { tone: 'error', message: res.error || 'Email was not sent.' });
      reload();
    } catch (err) {
      setTestResult({ tone: 'error', message: errorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <form onSubmit={sendTest} className="card mb-5 flex flex-col sm:flex-row sm:items-end gap-3 p-4">
        <Field label="Send a test email" className="w-full sm:w-80">
          <Input type="email" placeholder="you@example.com" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
        </Field>
        <button className="btn btn-navy w-full sm:w-auto" disabled={busy === 'test'}><Send className="h-4 w-4" /> {busy === 'test' ? 'Sending…' : 'Send test'}</button>
        {testResult && <Alert tone={testResult.tone} className="w-full">{testResult.message}</Alert>}
        {!smtpConfigured && <p className="w-full text-xs text-muted">The test will be logged as “not configured” until SMTP credentials are added on the server.</p>}
      </form>

      <Select className="mb-4 w-full sm:w-56 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All statuses</option>
        {STATUSES.map((s) => <option key={s} value={s}>{capitalize(s)}</option>)}
      </Select>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.logs.length === 0 ? (
        <EmptyState title="No emails logged" message="Enquiries, bookings and orders create email log entries here." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Date</th><th>To</th><th>Subject</th><th>Template</th><th>Status</th><th className="text-right">Tries</th><th /></tr></thead>
            <tbody>
              {data.logs.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap text-xs">{formatDateTime(log.created_at)}</td>
                  <td className="break-all text-xs">{log.to_email}</td>
                  <td className="min-w-[200px]"><button className="text-left hover:text-brand" onClick={() => setViewing(log)}>{log.subject}</button></td>
                  <td className="text-xs text-muted">{log.template_key}</td>
                  <td><StatusBadge status={log.status} /></td>
                  <td className="text-right">{log.attempts}</td>
                  <td className="whitespace-nowrap text-right">
                    {['failed', 'not_configured'].includes(log.status) && (
                      <button className="btn btn-outline btn-sm" onClick={() => retry(log)} disabled={busy === log.id}><RotateCcw className="h-3.5 w-3.5" /> {busy === log.id ? 'Retrying…' : 'Retry'}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!viewing} title="Email details" onClose={() => setViewing(null)} size="lg">
        {viewing && (
          <div className="space-y-3 text-sm">
            <p><span className="text-muted">To:</span> {viewing.to_email}</p>
            <p><span className="text-muted">Subject:</span> {viewing.subject}</p>
            <p><span className="text-muted">Status:</span> <StatusBadge status={viewing.status} /> {viewing.sent_at && `· sent ${formatDateTime(viewing.sent_at)}`}</p>
            {viewing.error && <Alert tone="error">{viewing.error}</Alert>}
            <pre className="whitespace-pre-wrap rounded-lg bg-surface p-4 font-sans text-sm">{viewing.body}</pre>
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
      toast('Template saved.');
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
      <div className="card divide-y divide-line">
        {data.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{t.name}</p>
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

function EmailSettings() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => opsApi.list('settings'), []);
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (data) {
      setForm(data.email || {
        business_recipient: BUSINESS.email,
        sender_name: BUSINESS.name,
        notify_enquiry: true,
        notify_booking: true,
        notify_order: true,
      });
    }
  }, [data]);

  const save = async (e) => {
    e.preventDefault();
    if (!isValidEmail(form.business_recipient)) return setFormError('Enter a valid recipient email.');
    if (!form.sender_name?.trim()) return setFormError('Enter a sender name.');
    setSaving(true);
    setFormError('');
    try {
      await opsApi.update('settings', { key: 'email', value: form });
      toast('Email settings saved.');
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return error ? <ErrorState message={error} onRetry={reload} /> : <PageLoader />;
  return (
    <form onSubmit={save} className="card max-w-2xl space-y-4 p-5" noValidate>
      {formError && <Alert tone="error">{formError}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business notification recipient" hint="New enquiries, bookings and orders are sent here.">
          <Input type="email" value={form.business_recipient || ''} onChange={(e) => setForm({ ...form, business_recipient: e.target.value })} />
        </Field>
        <Field label="Sender name"><Input value={form.sender_name || ''} onChange={(e) => setForm({ ...form, sender_name: e.target.value })} /></Field>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Notifications</p>
        <Checkbox label="Contact enquiries" checked={form.notify_enquiry !== false} onChange={(v) => setForm({ ...form, notify_enquiry: v })} />
        <br />
        <Checkbox label="Repair bookings & status updates" checked={form.notify_booking !== false} onChange={(v) => setForm({ ...form, notify_booking: v })} />
        <br />
        <Checkbox label="Orders & status updates" checked={form.notify_order !== false} onChange={(v) => setForm({ ...form, notify_order: v })} />
      </div>
      <div className="rounded-lg border border-line bg-surface/60 p-3 text-xs text-muted">
        <p className="font-semibold text-ink">📍 Store Location included in outgoing email footers:</p>
        <p className="mt-0.5">{BUSINESS.addressFull}</p>
        <p className="mt-0.5">Phone: {BUSINESS.phone} · Primary Email: {BUSINESS.email}</p>
      </div>
      <p className="text-xs text-muted">The sending address and SMTP password are configured only in server environment variables and never shown here.</p>
      <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
    </form>
  );
}

export default function Emails() {
  const [tab, setTab] = useState('logs');
  const settings = useAsync(() => opsApi.list('settings'), []);
  const smtpConfigured = settings.data?.environment?.smtp_configured;

  return (
    <>
      <AdminHeader title="Email Management" description="Delivery log, templates and notification settings." />
      {settings.data && (
        smtpConfigured ? (
          <Alert tone="success" className="mb-5">SMTP is configured. Emails are delivered and their real status is recorded.</Alert>
        ) : (
          <Alert tone="warning" className="mb-5" title="SMTP is not configured">
            Emails are being logged but <strong>not sent</strong>. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (e.g. a Gmail app password) and SMTP_FROM to the server environment, then use Retry on unsent messages.
          </Alert>
        )
      )}
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-line">
        {[['logs', 'Email log'], ['templates', 'Templates'], ['settings', 'Settings']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`-mb-px shrink-0 border-b-2 px-4 py-2 text-sm font-semibold ${tab === key ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'}`}>{label}</button>
        ))}
      </div>
      {tab === 'logs' && <Logs smtpConfigured={smtpConfigured} />}
      {tab === 'templates' && <Templates />}
      {tab === 'settings' && <EmailSettings />}
    </>
  );
}
