import PropTypes from 'prop-types';
import Avatar from './Avatar.jsx';
import { formatPostDate } from '../utils/posts.js';

/** Render a responsive registered or built-in account row and delete state. */
export default function UserRow({ user, currentUserId, onDelete }) {
  const isDefault = Boolean(user.builtIn || user.id === 'admin' || user.username?.toLowerCase() === 'admin');
  const isSelf = !isDefault && user.id === currentUserId;
  const disabled = isDefault || isSelf;
  const reason = isDefault ? 'Default admin cannot be deleted.' : isSelf ? 'You cannot delete your own account.' : '';

  return (
    <article className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-slate-100 px-4 py-4 last:border-0 sm:grid-cols-[auto_1.2fr_1fr_auto_auto_auto] sm:gap-5">
      <Avatar role={user.role} displayName={user.displayName} />
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-900">{user.displayName}</p>
        <p className="truncate text-sm text-slate-500 sm:hidden">@{user.username}</p>
      </div>
      <p className="hidden text-sm text-slate-600 sm:block">@{user.username}</p>
      <span className={`rounded-full px-3 py-1 text-center text-xs font-semibold ${user.role === 'admin' ? 'bg-violet-100 text-violet-800' : 'bg-indigo-100 text-indigo-800'}`}>{user.role === 'admin' ? 'Admin' : 'user'}</span>
      <p className="hidden text-sm text-slate-500 sm:block">{user.createdAt ? formatPostDate(user.createdAt) : 'Built-in account'}</p>
      <button className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={disabled} title={reason || undefined} aria-label={disabled ? reason : `Delete ${user.displayName}`} onClick={() => onDelete(user)}>
        Delete
      </button>
    </article>
  );
}

UserRow.propTypes = {
  user: PropTypes.shape({ id: PropTypes.string.isRequired, displayName: PropTypes.string.isRequired, username: PropTypes.string.isRequired, role: PropTypes.oneOf(['admin', 'user']).isRequired, createdAt: PropTypes.string, builtIn: PropTypes.bool }).isRequired,
  currentUserId: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};
