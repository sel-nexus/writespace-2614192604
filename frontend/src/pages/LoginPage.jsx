import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { login, getHomePath } from '../utils/auth.js';
import { getSession } from '../utils/storage.js';

/** Render the demo login form and persist the resulting local session. */
export default function LoginPage() {
  const navigate = useNavigate();
  const existingSession = getSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (existingSession) return <Navigate to={getHomePath(existingSession)} replace />;

  function handleSubmit(event) {
    event.preventDefault();
    const result = login(username, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(getHomePath(result.session), { replace: true });
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-white bg-white p-8 shadow-xl shadow-indigo-100 sm:p-10" aria-labelledby="login-heading">
        <Link className="font-display text-xl font-bold text-slate-900" to="/">WriteSpace<span className="text-indigo-600">.</span></Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-indigo-700">Welcome back</p>
        <h1 id="login-heading" className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950">Sign in to WriteSpace</h1>
        <p className="mt-3 leading-6 text-slate-600">Use a local demo account to continue reading and writing.</p>
        <p className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900">Demo administrator: <strong>admin</strong> / <strong>admin</strong>. Do not use real passwords.</p>
        <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="login-username">Username</label>
            <input className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-shadow focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-200" id="login-username" name="username" autoComplete="username" required aria-required="true" value={username} onChange={(event) => setUsername(event.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="login-password">Password</label>
            <input className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-shadow focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-200" id="login-password" name="password" type="password" autoComplete="current-password" required aria-required="true" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          <button className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" type="submit">Login</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">New to WriteSpace? <Link className="font-semibold text-indigo-700 underline underline-offset-4" to="/register">Register</Link></p>
      </section>
    </main>
  );
}
