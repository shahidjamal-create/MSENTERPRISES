import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AdminHeader } from './AdminLayout';
import Modal from '../components/ui/Modal';
import { Field, Input, Select } from '../components/ui/Form';
import { Alert, EmptyState, ErrorState, PageLoader } from '../components/ui/Feedback';
import StatusBadge from '../components/ui/StatusBadge';
import { opsApi, errorMessage } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ROLE_LABELS, STAFF_ROLES } from '../utils/constants';
import { formatDate, isValidEmail } from '../utils/format';

const ROLE_HELP = {
  super_admin: 'Full access including other super admins.',
  admin: 'Everything except managing super admins.',
  manager: 'Catalogue, orders, bookings, customers, inventory and reports.',
  technician: 'Repair bookings only.',
  inventory_staff: 'Products, inventory and suppliers.',
};

function AddStaff({ assignable, onClose, onSaved }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', role: 'technician', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (form.full_name.trim().length < 2) return setError('Enter the staff member\'s name.');
    if (!isValidEmail(form.email)) return setError('Enter a valid email.');
    if (form.password.length < 8) return setError('Temporary password must be at least 8 characters.');
    setSaving(true);
    setError('');
    try {
      await opsApi.post('staff', form);
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal open title="Add staff member" onClose={onClose} footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" form="staff-form" disabled={saving}>{saving ? 'Creating…' : 'Create account'}</button></>}>
      <form id="staff-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
        {error && <Alert tone="error" className="sm:col-span-2">{error}</Alert>}
        <Field label="Full name" required><Input value={form.full_name} onChange={set('full_name')} /></Field>
        <Field label="Phone"><Input value={form.phone} onChange={set('phone')} /></Field>
        <Field label="Email" required className="sm:col-span-2"><Input type="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="Role" required hint={ROLE_HELP[form.role]}>
          <Select value={form.role} onChange={set('role')}>{assignable.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</Select>
        </Field>
        <Field label="Temporary password" required hint="Share securely; they can change it after login."><Input type="text" value={form.password} onChange={set('password')} /></Field>
      </form>
    </Modal>
  );
}

export default function Staff() {
  const { user } = useAuth();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const { data, loading, error, reload } = useAsync(() => opsApi.list('staff'), []);
  const assignable = STAFF_ROLES.filter((r) => r !== 'super_admin' || user.role === 'super_admin');

  const update = async (member, changes) => {
    try {
      await opsApi.update('staff', { id: member.id, role: member.role, is_active: member.is_active, ...changes });
      toast('Staff member updated.');
      reload();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  return (
    <>
      <AdminHeader title="Staff" description="Staff accounts and their roles. Permissions are enforced by the server for every action." actions={<button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Add staff</button>} />
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <EmptyState title="No staff accounts" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Name</th><th>Role</th><th>Since</th><th>Status</th><th /></tr></thead>
            <tbody>
              {data.map((m) => {
                const isSelf = m.id === user.id;
                const locked = isSelf || (m.role === 'super_admin' && user.role !== 'super_admin');
                return (
                  <tr key={m.id}>
                    <td className="min-w-[200px]">{m.full_name || '—'} {isSelf && <span className="text-xs text-muted">(you)</span>}<span className="block break-all text-xs text-muted">{m.email}</span></td>
                    <td>
                      <Select className="!w-auto min-w-[160px]" value={m.role} disabled={locked} onChange={(e) => update(m, { role: e.target.value })}>
                        {(locked ? STAFF_ROLES : assignable).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                        {!locked && <option value="customer">Remove staff access</option>}
                      </Select>
                    </td>
                    <td className="whitespace-nowrap">{formatDate(m.created_at)}</td>
                    <td><StatusBadge status={m.is_active ? 'active' : 'inactive'} label={m.is_active ? 'Active' : 'Disabled'} /></td>
                    <td className="text-right">{!locked && <button className="btn btn-outline btn-sm" onClick={() => update(m, { is_active: !m.is_active })}>{m.is_active ? 'Disable' : 'Enable'}</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {adding && <AddStaff assignable={assignable} onClose={() => setAdding(false)} onSaved={() => { toast('Staff account created.'); setAdding(false); reload(); }} />}
    </>
  );
}
