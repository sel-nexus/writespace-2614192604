import PropTypes from 'prop-types';

/** Return the PRD-specified static avatar for a role. */
export function getAvatar(role) {
  const isAdmin = role === 'admin';
  return (
    <span className={`inline-grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg text-white ${isAdmin ? 'bg-violet-600' : 'bg-indigo-500'}`} aria-hidden="true">
      {isAdmin ? '👑' : '📖'}
    </span>
  );
}

/** Render a role avatar with a screen-reader name when used independently. */
export default function Avatar({ role, displayName }) {
  return (
    <span className="inline-flex items-center gap-2">
      {getAvatar(role)}
      <span className="sr-only">{displayName || (role === 'admin' ? 'Administrator' : 'Writer')}</span>
    </span>
  );
}

Avatar.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']).isRequired,
  displayName: PropTypes.string,
};
