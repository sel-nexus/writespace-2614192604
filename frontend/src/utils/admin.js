import { getPosts, getUsers, saveUsers } from './storage.js';

/** Count the four distinct administrator dashboard metrics. */
export function getDashboardStats(posts = getPosts(), users = getUsers()) {
  const validUsers = Array.isArray(users) ? users : [];
  const validPosts = Array.isArray(posts) ? posts : [];
  const regularUserIds = new Set(validUsers.filter((user) => user.role === 'user').map((user) => user.id));
  return {
    totalPosts: validPosts.length,
    totalUsers: validUsers.length + 1,
    totalAdmins: validUsers.filter((user) => user.role === 'admin').length + 1,
    userAuthoredPosts: validPosts.filter((post) => regularUserIds.has(post.authorId)).length,
  };
}

/** Return the five newest posts for the administrator's activity panel. */
export function getRecentPosts(posts = getPosts()) {
  if (!Array.isArray(posts)) return [];
  return [...posts].sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt)).slice(0, 5);
}

/** Validate and store a new administrator-created account. */
export function createManagedUser({ displayName, username, password, role }) {
  const cleanName = String(displayName ?? '').trim();
  const cleanUsername = String(username ?? '').trim();
  const cleanPassword = String(password ?? '');
  const cleanRole = role === 'admin' ? 'admin' : role === 'user' ? 'user' : '';
  const errors = {};
  if (!cleanName) errors.displayName = 'Display name is required.';
  if (!cleanUsername) errors.username = 'Username is required.';
  if (!cleanPassword) errors.password = 'Password is required.';
  if (!cleanRole) errors.role = 'Choose a valid role.';
  const users = getUsers();
  if (cleanUsername && (cleanUsername.toLowerCase() === 'admin' || users.some((user) => user.username?.toLowerCase() === cleanUsername.toLowerCase()))) {
    errors.username = 'That username is already taken.';
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  const account = {
    id: crypto.randomUUID(),
    displayName: cleanName,
    username: cleanUsername,
    // Demo-only local app: never use real passwords or sensitive information.
    password: cleanPassword,
    role: cleanRole,
    createdAt: new Date().toISOString(),
  };
  if (!saveUsers([...users, account])) return { ok: false, errors: { form: 'Unable to save this account. Check browser storage and try again.' } };
  return { ok: true, account };
}

/** Determine whether a listed account may be deleted by this administrator. */
export function canDeleteUser(user, session) {
  if (!user || !session || user.id === 'admin' || user.username?.toLowerCase() === 'admin') return false;
  return user.id !== session.userId;
}

/** Remove a registered user only when the admin safeguard permits it. */
export function deleteManagedUser(userId, session) {
  const users = getUsers();
  const target = users.find((user) => user.id === userId);
  if (!target) return { ok: false, error: 'User not found.' };
  if (!canDeleteUser(target, session)) return { ok: false, error: 'This account cannot be deleted.' };
  if (!saveUsers(users.filter((user) => user.id !== userId))) return { ok: false, error: 'Unable to delete this account. Check browser storage and try again.' };
  return { ok: true };
}

/** Build the visible protected representation of the hard-coded administrator. */
export function getBuiltInAdmin() {
  return { id: 'admin', displayName: 'Administrator', username: 'admin', role: 'admin', createdAt: null, builtIn: true };
}
