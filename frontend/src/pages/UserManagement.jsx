import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import UserRow from '../components/UserRow.jsx';
import { getSession, getUsers } from '../utils/storage.js';
import { createManagedUser, deleteManagedUser, getBuiltInAdmin } from '../utils/admin.js';

/** Manage registered demo accounts while protecting the built-in admin. */
export default function UserManagement() {
  const session = getSession();
  const [users, setUsers] = useState(() => getUsers());
  const [fields, setFields] = useState({ displayName: '', username: '', password: '', role: 'user' });
  const [errors, setErrors] = useState({});
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== 'admin') return <Navigate to="/blogs" replace />;

  function updateField(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '', form: '' }));
  }

  function handleCreate(event) {
    event.preventDefault();
    const result = createManagedUser(fields);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setUsers((current) => [...current, result.account]);
    setFields({ displayName: '', username: '', password: '', role: 'user' });
    setErrors({ success: 'Account created successfully.' });
  }

  function handleDelete(user) {
    if (!window.confirm(`Delete the account for ${user.displayName}? This cannot be undone.`)) return;
    const result = deleteManagedUser(user.id, session);
    if (!result.ok) {
      setErrors({ form: result.error });
      return;
    }
    setUsers((current) => current.filter((entry) => entry.id !== user.id));
    setErrors({ success: 'Account deleted.' });
  }

  const fieldsToRender = [
    { name: 'displayName', label: 'Display Name', type: 'text', autoComplete: 'name' },
    { name: 'username', label: 'Username', type: 'text', autoComplete: 'username' },
    { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
  ];
  const rows = [getBuiltInAdmin(), ...users.filter((user) => user.id !== 'admin' && user.username?.toLowerCase() !== 'admin')];

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-800">
      <Navbar session={session} />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <Link className="text-sm font-semibold text-indigo-700 underline underline-offset-4" to="/admin">← Back to Dashboard</Link>
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="create-user-heading">
          <p className="text-sm font-semibold text-violet-700">Account administration</p>
          <h1 id="create-user-heading" className="mt-2 font-display text-3xl font-bold text-slate-950">Manage Users</h1>
          <form className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" onSubmit={handleCreate} noValidate>
            {fieldsToRender.map((field) => {
              const errorId = `user-${field.name}-error`;
              return (
                <div key={field.name}>
                  <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor={`user-${field.name}`}>{field.label}</label>
                  <input className="w-full rounded-xl border border-slate-300 px-3 py-3 text-slate-900 outline-none focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-200" id={`user-${field.name}`} name={field.name} type={field.type} autoComplete={field.autoComplete} required aria-required="true" aria-invalid={Boolean(errors[field.name])} aria-describedby={errors[field.name] ? errorId : undefined} value={fields[field.name]} onChange={updateField} />
                  {errors[field.name] && <p id={errorId} className="mt-1 text-sm text-red-700" role="alert">{errors[field.name]}</p>}
                </div>
              );
            })}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="user-role">Role</label>
              <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-200" id="user-role" name="role" required aria-required="true" value={fields.role} onChange={updateField}>
                <option value="user">user</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-700" role="alert">{errors.role}</p>}
            </div>
            <div className="flex items-end">
              <button className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" type="submit">Create User</button>
            </div>
          </form>
          {errors.form && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{errors.form}</p>}
          {errors.success && <p className="mt-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900" role="status">{errors.success}</p>}
          <p className="mt-4 text-xs leading-5 text-slate-500">Demo only: account passwords are plain text in local browser storage. Do not use real passwords or sensitive data.</p>
        </section>
        <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="account-list-heading">
          <div className="border-b border-slate-200 px-5 py-5">
            <h2 id="account-list-heading" className="font-display text-xl font-bold text-slate-950">Accounts <span className="text-sm font-medium text-slate-500">({rows.length})</span></h2>
          </div>
          <div className="hidden grid-cols-[auto_1.2fr_1fr_auto_auto_auto] gap-5 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
            <span className="sr-only">Avatar</span><span>Display name</span><span>Username</span><span>Role</span><span>Created</span><span>Actions</span>
          </div>
          {rows.map((user) => <UserRow key={user.id} user={user} currentUserId={session.userId} onDelete={handleDelete} />)}
        </section>
      </main>
    </div>
  );
}
