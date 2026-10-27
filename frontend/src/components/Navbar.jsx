import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { clearSession } from '../utils/storage.js';

/** Render authenticated role navigation with a mobile menu and logout action. */
export default function Navbar({ session }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const links = session.role === 'admin'
    ? [{ to: '/blogs', label: 'All Blogs' }, { to: '/write', label: 'Write' }, { to: '/admin', label: 'Dashboard' }, { to: '/users', label: 'Users' }]
    : [{ to: '/blogs', label: 'All Blogs' }, { to: '/write', label: 'Write' }];

  function logout() {
    if (clearSession()) navigate('/', { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3" aria-label="Main navigation">
        <Link className="font-display text-xl font-bold text-slate-900" to="/">WriteSpace<span className="text-indigo-600">.</span></Link>
        <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 sm:hidden" type="button" aria-expanded={menuOpen} aria-controls="member-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? 'Close' : 'Menu'}
        </button>
        <div id="member-navigation" className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-2 border-b border-slate-200 bg-white p-4 shadow-md sm:static sm:flex sm:flex-row sm:items-center sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${isActive ? 'bg-indigo-100 text-indigo-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
              {link.label}
            </NavLink>
          ))}
          <div className="flex items-center gap-2 border-t border-slate-100 pt-3 sm:ml-3 sm:border-0 sm:pt-0">
            <Avatar role={session.role} displayName={session.displayName} />
            <span className="max-w-28 truncate text-sm font-medium text-slate-700">{session.displayName}</span>
            <button className="ml-auto rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 sm:ml-1" type="button" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>
    </header>
  );
}

Navbar.propTypes = {
  session: PropTypes.shape({ role: PropTypes.oneOf(['admin', 'user']).isRequired, displayName: PropTypes.string.isRequired }).isRequired,
};
