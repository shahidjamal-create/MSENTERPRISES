import { useState } from 'react';
import { Mail, Star, Trash2 } from 'lucide-react';
import { AdminHeader } from './AdminLayout';
import { Select } from '../components/ui/Form';
import { EmptyState, ErrorState, PageLoader } from '../components/ui/Feedback';
import StatusBadge from '../components/ui/StatusBadge';
import { adminApi, errorMessage } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { useToast } from '../context/ToastContext';
import { formatDateTime } from '../utils/format';

function EnquiryList() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => adminApi.list('enquiries'), []);
  const setStatus = async (id, status) => {
    try {
      await adminApi.update('enquiries', { id, status });
      reload();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };
  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data.length) return <EmptyState icon={Mail} title="No enquiries yet" message="Messages from the contact form appear here." />;
  return (
    <div className="space-y-3">
      {data.map((e) => (
        <article key={e.id} className="card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-ink">{e.subject}</h3>
              <p className="text-xs text-muted">
                {e.name} · <a href={`mailto:${e.email}?subject=Re: ${encodeURIComponent(e.subject)}`} className="text-brand hover:underline">{e.email}</a>
                {e.phone && <> · <a href={`tel:${e.phone}`} className="text-brand">{e.phone}</a></>} · {formatDateTime(e.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={e.status} />
              <Select className="!w-auto !py-1 text-xs" value={e.status} onChange={(ev) => setStatus(e.id, ev.target.value)} aria-label="Change status">
                <option value="new">New</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
              </Select>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm text-ink">{e.message}</p>
        </article>
      ))}
    </div>
  );
}

function ReviewList() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => adminApi.list('reviews'), []);
  const approve = async (r) => {
    try {
      await adminApi.update('reviews', { id: r.id, is_approved: !r.is_approved });
      toast(r.is_approved ? 'Review hidden from website.' : 'Review published.');
      reload();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };
  const remove = async (r) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await adminApi.remove('reviews', r.id);
      reload();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };
  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data.length) return <EmptyState icon={Star} title="No reviews submitted" message="Customer reviews from the homepage wait here for approval." />;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {data.map((r) => (
        <article key={r.id} className="card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold">{r.customer_name}</p>
            <StatusBadge tone={r.is_approved ? 'green' : 'amber'} label={r.is_approved ? 'Published' : 'Awaiting approval'} />
          </div>
          <div className="mt-1 flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-line'}`} />)}</div>
          <p className="mt-2 text-sm">{r.comment}</p>
          <p className="mt-2 text-xs text-muted">{formatDateTime(r.created_at)}</p>
          <div className="mt-3 flex gap-2">
            <button className="btn btn-outline btn-sm" onClick={() => approve(r)}>{r.is_approved ? 'Unpublish' : 'Approve & publish'}</button>
            <button className="rounded p-1.5 text-muted hover:bg-danger-soft hover:text-danger" onClick={() => remove(r)} aria-label="Delete review"><Trash2 className="h-4 w-4" /></button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function Enquiries() {
  const [tab, setTab] = useState('enquiries');
  return (
    <>
      <AdminHeader title="Enquiries & Reviews" description="Contact form messages and customer reviews awaiting moderation." />
      <div className="mb-5 flex gap-1 border-b border-line">
        {[['enquiries', 'Enquiries'], ['reviews', 'Reviews']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${tab === key ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'}`}>{label}</button>
        ))}
      </div>
      {tab === 'enquiries' ? <EnquiryList /> : <ReviewList />}
    </>
  );
}
