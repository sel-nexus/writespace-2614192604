import { Link } from 'react-router-dom';

/** Render the public header with guest or session-aware actions. */
export default function PublicNavbar({ session = null }) {
  const homePath = session?.role === 'admin' ? '/admin' : '/blogs';
  const displayName = session?.displayName || session?.username;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4" aria-label="Main navigation">
        <Link className="font-display text-xl font-bold tracking-tight text-slate-900" to="/">
          WriteSpace<span className="text-brand-indigo">.</span>
        </Link>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden text-sm font-medium text-slate-600 sm:inline">Welcome, {displayName}</span>
              <Link className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to={homePath}>
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to="/login">
                Login
              </Link>
              <Link className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to="/register">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

PublicNavbar.propTypes = {};
