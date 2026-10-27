import { getPosts, savePosts } from './storage.js';

const POSTS_UPDATED_EVENT = 'writespace:posts-updated';

/** Notify mounted views after a successful post mutation. */
function notifyPostsUpdated() {
  window.dispatchEvent(new Event(POSTS_UPDATED_EVENT));
}

/** Subscribe a mounted view to successful same-tab post mutations. */
export function subscribeToPostsUpdated(listener) {
  window.addEventListener(POSTS_UPDATED_EVENT, listener);
  return () => window.removeEventListener(POSTS_UPDATED_EVENT, listener);
}

/** Return posts newest-first while placing invalid timestamps after valid dates. */
export function sortPostsNewest(posts) {
  return [...posts].sort((first, second) => {
    const firstDate = Date.parse(first.createdAt);
    const secondDate = Date.parse(second.createdAt);
    const safeFirst = Number.isNaN(firstDate) ? Number.NEGATIVE_INFINITY : firstDate;
    const safeSecond = Number.isNaN(secondDate) ? Number.NEGATIVE_INFINITY : secondDate;
    return safeSecond - safeFirst;
  });
}

/** Return a plain-text preview capped at the requested character length. */
export function getExcerpt(content, limit = 120) {
  const text = typeof content === 'string' ? content : '';
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

/** Format a stored timestamp for readable post metadata. */
export function formatPostDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

/** Allow post management for the author or an administrator. */
export function canManagePost(post, session) {
  return Boolean(post && session && (session.role === 'admin' || post.authorId === session.userId));
}

/** Create a post with stable ownership metadata and persist it locally. */
export function createPost({ title, content, session }, id = crypto.randomUUID(), createdAt = new Date().toISOString()) {
  const cleanTitle = String(title ?? '').trim();
  const cleanContent = String(content ?? '').trim();
  if (!cleanTitle || !cleanContent || !session?.userId || !session?.displayName) {
    return { ok: false, error: 'Title, content, and a signed-in author are required.' };
  }
  const post = { id, title: cleanTitle, content: cleanContent, createdAt, authorId: session.userId, authorName: session.displayName };
  if (!savePosts([...getPosts(), post])) return { ok: false, error: 'Unable to save your post. Check browser storage and try again.' };
  return { ok: true, post };
}

/** Replace an existing post only when the session may manage it. */
export function updatePost(postId, changes, session) {
  const posts = getPosts();
  const existing = posts.find((post) => post.id === postId);
  if (!existing) return { ok: false, error: 'Post not found.' };
  if (!canManagePost(existing, session)) return { ok: false, error: 'You cannot edit this post.' };
  const title = String(changes.title ?? '').trim();
  const content = String(changes.content ?? '').trim();
  if (!title || !content) return { ok: false, error: 'Title and content are required.' };
  const updated = { ...existing, title, content };
  const nextPosts = posts.map((post) => post.id === postId ? updated : post);
  if (!savePosts(nextPosts)) return { ok: false, error: 'Unable to save your changes. Check browser storage and try again.' };
  notifyPostsUpdated();
  return { ok: true, post: updated };
}

/** Delete a post only when the session may manage it. */
export function deletePost(postId, session) {
  const posts = getPosts();
  const existing = posts.find((post) => post.id === postId);
  if (!existing) return { ok: false, error: 'Post not found.' };
  if (!canManagePost(existing, session)) return { ok: false, error: 'You cannot delete this post.' };
  if (!savePosts(posts.filter((post) => post.id !== postId))) return { ok: false, error: 'Unable to delete this post. Check browser storage and try again.' };
  notifyPostsUpdated();
  return { ok: true };
}
