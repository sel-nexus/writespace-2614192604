import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getHomePath, registerUser } from '../utils/auth.js';
import { getSession } from '../utils/storage.js';

/** Render validated registration for browser-local regular-user accounts. */
export default function RegisterPage() {
  const navigate = useNavigate();
  const existingSession = getSession();
  const [fields, setFields] = useState({ displayName: '', username: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  if (existingSession) return <Navigate to={getHomePath(existingSession)} replace />;

  function updateField(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '', form: '' }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = registerUser(fields);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    navigate('/blogs', { replace: true });
  }

  const inputs = [
    { name: 'displayName', label: 'Display Name', type: 'text', autocomplete: 'name' },
    { name: 'username', label: 'Username', type: 'text', autocomplete: 'username' },
    { name: 'password', label: 'Password', type: 'password', autocomplete: 'new-password' },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', autocomplete: 'new-password' },
  ];

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-white bg-white p-8 shadow-xl shadow-indigo-100 sm:p-10" aria-labelledby="register-heading">
        <Link className="font-display text-xl font-bold text-slate-900" to="/">WriteSpace<span className="text-indigo-600">.</span></Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-indigo-700">Start writing</p>
        <h1 id="register-heading" className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950">Create your account</h1>
        <p className="mt-3 leading-6 text-slate-600">Your local demo account can read and publish posts in this browser.</p>
        <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
          {inputs.map((input) => {
            const errorId = `register-${input.name}-error`;
            return (
              <div key={input.name}>
                <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor={`register-${input.name}`}>{input.label}</label>
                <input className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-shadow focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-200" id={`register-${input.name}`} name={input.name} type={input.type} autoComplete={input.autocomplete} required aria-required="true" aria-invalid={Boolean(errors[input.name])} aria-describedby={errors[input.name] ? errorId : undefined} value={fields[input.name]} onChange={updateField} />
                {errors[input.name] && <p id={errorId} className="mt-1 text-sm text-red-700" role="alert">{errors[input.name]}</p>}
              </div>
            );
          })}
          <p className="text-xs leading-5 text-slate-500">Demo only: passwords are stored in plain text in this browser. Never use a real password or sensitive information.</p>
          {errors.form && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{errors.form}</p>}
          <button className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" type="submit">Create Account</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link className="font-semibold text-indigo-700 underline underline-offset-4" to="/login">Login</Link></p>
      </section>
    </main>
  );
}
