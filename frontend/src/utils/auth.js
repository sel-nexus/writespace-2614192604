import { getUsers, saveUsers, setSession } from './storage.js';

/** Validate the local demo login and save the matching session. */
export function login(username, password) {
  const normalizedName = String(username ?? '').trim();
  if (!normalizedName || !password) {
    return { ok: false, error: 'Invalid username or password.' };
  }

  let session;
  if (normalizedName === 'admin' && password === 'admin') {
    session = {
      userId: 'admin',
      username: 'admin',
      displayName: 'Administrator',
      role: 'admin',
    };
  } else {
    const user = getUsers().find((entry) => entry.username?.toLowerCase() === normalizedName.toLowerCase() && entry.password === password);
    if (!user || !['user', 'admin'].includes(user.role)) {
      return { ok: false, error: 'Invalid username or password.' };
    }
    session = {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    };
  }

  if (!setSession(session)) {
    return { ok: false, error: 'Unable to save your session. Check browser storage and try again.' };
  }
  return { ok: true, session };
}

/** Validate and persist a local regular-user account without secure-password claims. */
export function registerUser({ displayName, username, password, confirmPassword }) {
  const errors = {};
  const cleanName = String(displayName ?? '').trim();
  const cleanUsername = String(username ?? '').trim();
  const cleanPassword = String(password ?? '');
  if (!cleanName) errors.displayName = 'Display name is required.';
  if (!cleanUsername) errors.username = 'Username is required.';
  if (!cleanPassword) errors.password = 'Password is required.';
  if (!String(confirmPassword ?? '')) errors.confirmPassword = 'Confirm password is required.';
  else if (cleanPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';

  const users = getUsers();
  if (cleanUsername && (cleanUsername.toLowerCase() === 'admin' || users.some((user) => user.username?.toLowerCase() === cleanUsername.toLowerCase()))) {
    errors.username = 'That username is already taken.';
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  const user = {
    id: crypto.randomUUID(),
    displayName: cleanName,
    username: cleanUsername,
    // Demo-only local app: never use real passwords or sensitive information.
    password: cleanPassword,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  if (!saveUsers([...users, user])) {
    return { ok: false, errors: { form: 'Unable to save this account. Check browser storage and try again.' } };
  }

  const session = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
  if (!setSession(session)) {
    return { ok: false, errors: { form: 'Account saved, but the session could not be saved. Please log in.' } };
  }
  return { ok: true, user, session };
}

/** Return the first route available to the current role. */
export function getHomePath(session) {
  return session?.role === 'admin' ? '/admin' : '/blogs';
}

/** Check whether a stored object is a supported local session. */
export function isValidSession(session) {
  return Boolean(session && typeof session.userId === 'string' && ['admin', 'user'].includes(session.role));
}
