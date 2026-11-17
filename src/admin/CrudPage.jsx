import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { AdminHeader } from './AdminLayout';
import Modal from '../components/ui/Modal';
import { Checkbox, Field, Input, Select, Textarea } from '../components/ui/Form';
import { Alert, EmptyState, ErrorState, PageLoader } from '../components/ui/Feedback';
import StatusBadge from '../components/ui/StatusBadge';
import { adminApi, errorMessage } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { useToast } from '../context/ToastContext';

// Generic list + modal form for simple catalogue tables (categories, brands,
// models, suppliers, repair services). Validation is repeated on the server.
export default function CrudPage({ config }) {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => adminApi.list(config.resource), [config.resource]);
  const lookups = useAsync(async () => {
    const entries = await Promise.all((config.lookups || []).map(async (r) => [r, await adminApi.list(r)]));
    return Object.fromEntries(entries);
  }, [config.resource]);

  const [search, setSearch] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data || []).filter((row) => {
      if (config.filter && filterValue && String(row[config.filter.key]) !== filterValue) return false;
      if (!term) return true;
      return config.searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(term));
    });
  }, [data, search, filterValue, config]);

  const openForm = (row) => {
    setErrors({});
    setFormError('');
    setEditing(row ? { ...row } : { ...config.defaults, ...(config.filter && filterValue ? { [config.filter.key]: filterValue } : {}) });
  };

  const save = async (e) => {
    e.preventDefault();
    const next = {};
    config.fields.forEach((f) => {
      if (f.required && (editing[f.name] === '' || editing[f.name] == null)) next[f.name] = `${f.label} is required.`;
    });
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setFormError('');
    try {
      if (editing.id) await adminApi.update(config.resource, editing);
      else await adminApi.create(config.resource, editing);
      toast(`${config.singular} saved.`);
      setEditing(null);
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete "${row.name}"? This cannot be undone.`)) return;
    try {
      await adminApi.remove(config.resource, row.id);
      toast(`${config.singular} deleted.`);
      reload();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const renderField = (f) => {
    const value = editing[f.name] ?? '';
    const onChange = (v) => setEditing((prev) => ({ ...prev, [f.name]: v }));
    if (f.type === 'checkbox') return <Checkbox key={f.name} label={f.label} checked={value !== false} onChange={onChange} />;
    const control =
      f.type === 'select' ? (
        <Select value={value} error={errors[f.name]} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {f.options(lookups.data || {}).map(([v, label]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </Select>
      ) : f.type === 'textarea' ? (
        <Textarea rows={3} value={value} error={errors[f.name]} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input type={f.type || 'text'} value={value} error={errors[f.name]} onChange={(e) => onChange(e.target.value)} />
      );
    return (
      <Field key={f.name} label={f.label} required={f.required} error={errors[f.name]} hint={f.hint} className={f.wide ? 'sm:col-span-2' : ''}>
        {control}
      </Field>
    );
  };

  return (
    <>
      <AdminHeader
        title={config.title}
        description={config.description}
        actions={<button className="btn btn-primary btn-sm" onClick={() => openForm(null)}><Plus className="h-4 w-4" /> Add {config.singular}</button>}
      />
      <div className="mb-4 flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input className="pl-9 text-sm" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {config.filter && (
          <Select className="w-full sm:w-56 text-sm" value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
            <option value="">All {config.filter.label}s</option>
            {config.filter.options(lookups.data || {}).map(([v, label]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </Select>
        )}
      </div>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState title={`No ${config.title.toLowerCase()} found`} message={search ? 'Try a different search.' : `Add your first ${config.singular.toLowerCase()}.`} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                {config.columns.map((c) => <th key={c.label}>{c.label}</th>)}
                {config.showActive !== false && <th>Status</th>}
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {config.columns.map((c) => <td key={c.label}>{c.render ? c.render(row) : row[c.key] ?? '—'}</td>)}
                  {config.showActive !== false && <td><StatusBadge status={row.is_active ? 'active' : 'inactive'} /></td>}
                  <td className="whitespace-nowrap text-right">
                    <button className="rounded p-1.5 text-muted hover:bg-surface hover:text-brand" onClick={() => openForm(row)} aria-label={`Edit ${row.name}`}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="rounded p-1.5 text-muted hover:bg-danger-soft hover:text-danger" onClick={() => remove(row)} aria-label={`Delete ${row.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!editing}
        title={editing?.id ? `Edit ${config.singular}` : `Add ${config.singular}`}
        onClose={() => setEditing(null)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" form="crud-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        {editing && (
          <form id="crud-form" onSubmit={save} noValidate>
            {formError && <Alert tone="error" className="mb-4">{formError}</Alert>}
            <div className="grid gap-4 sm:grid-cols-2">{config.fields.map(renderField)}</div>
          </form>
        )}
      </Modal>
    </>
  );
}
