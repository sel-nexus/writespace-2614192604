const POSTS_KEY = 'writespace_posts';
const USERS_KEY = 'writespace_users';
const SESSION_KEY = 'writespace_session';

/** Read a JSON value without allowing malformed local data to break a page. */
function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Persist a JSON-compatible value and report whether storage accepted it. */
function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Return all saved posts, or an empty list when stored data is invalid. */
export function getPosts() {
  const posts = readJson(POSTS_KEY, []);
  return Array.isArray(posts) ? posts : [];
}

/** Save a post list after validating its container shape. */
export function savePosts(posts) {
  if (!Array.isArray(posts)) return false;
  return writeJson(POSTS_KEY, posts);
}

/** Return all registered users, or an empty list when stored data is invalid. */
export function getUsers() {
  const users = readJson(USERS_KEY, []);
  return Array.isArray(users) ? users : [];
}

/** Save registered users after validating their container shape. */
export function saveUsers(users) {
  if (!Array.isArray(users)) return false;
  return writeJson(USERS_KEY, users);
}

/** Return the active session when it has the expected object shape. */
export function getSession() {
  const session = readJson(SESSION_KEY, null);
  return session && typeof session === 'object' && !Array.isArray(session) ? session : null;
}

/** Persist a session object and report whether storage accepted it. */
export function setSession(session) {
  if (!session || typeof session !== 'object' || Array.isArray(session)) return false;
  return writeJson(SESSION_KEY, session);
}

/** Remove the active session and report storage availability. */
export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}
