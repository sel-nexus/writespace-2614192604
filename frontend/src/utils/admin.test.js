import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getUsers, saveUsers } from './storage.js';
import { canDeleteUser, createManagedUser, deleteManagedUser, getBuiltInAdmin, getDashboardStats, getRecentPosts } from './admin.js';

const adminSession = { userId: 'admin', username: 'admin', displayName: 'Administrator', role: 'admin' };
const registeredUser = { id: 'u-1', username: 'writer', displayName: 'Writer', password: 'demo', role: 'user', createdAt: '2025-01-01T00:00:00.000Z' };

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('administrator operations', () => {
  it('counts users, admins, all posts and user-authored posts distinctly', () => {
    const users = [registeredUser, { ...registeredUser, id: 'a-1', username: 'admin2', role: 'admin' }];
    const posts = [
      { id: 'p1', authorId: 'u-1' },
      { id: 'p2', authorId: 'admin' },
      { id: 'p3', authorId: 'a-1' },
    ];
    expect(getDashboardStats(posts, users)).toEqual({ totalPosts: 3, totalUsers: 3, totalAdmins: 2, userAuthoredPosts: 1 });
  });

  it('handles empty and malformed inputs safely', () => {
    expect(getDashboardStats(null, null)).toEqual({ totalPosts: 0, totalUsers: 1, totalAdmins: 1, userAuthoredPosts: 0 });
    expect(getRecentPosts(null)).toEqual([]);
  });

  it('returns at most five newest posts without mutating input', () => {
    const posts = Array.from({ length: 7 }, (_, index) => ({ id: `p${index}`, createdAt: `2025-01-0${index + 1}T00:00:00.000Z` }));
    expect(getRecentPosts(posts).map((post) => post.id)).toEqual(['p6', 'p5', 'p4', 'p3', 'p2']);
    expect(posts[0].id).toBe('p0');
  });

  it('validates required fields, role choice, and built-in username uniqueness', () => {
    expect(createManagedUser({ displayName: '', username: '', password: '', role: '' }).errors).toEqual({
      displayName: 'Display name is required.', username: 'Username is required.', password: 'Password is required.', role: 'Choose a valid role.',
    });
    expect(createManagedUser({ displayName: 'Admin', username: 'admin', password: 'x', role: 'user' }).errors.username).toBe('That username is already taken.');
  });

  it('creates user and admin accounts with UUID, timestamp and persistence', () => {
    const uuid = vi.spyOn(crypto, 'randomUUID').mockReturnValueOnce('new-user').mockReturnValueOnce('new-admin');
    const user = createManagedUser({ displayName: 'New writer', username: 'newwriter', password: 'demo', role: 'user' });
    const second = createManagedUser({ displayName: 'Second admin', username: 'secondadmin', password: 'demo', role: 'admin' });
    expect(uuid).toHaveBeenCalledTimes(2);
    expect(user.account).toMatchObject({ id: 'new-user', role: 'user', username: 'newwriter' });
    expect(second.account).toMatchObject({ id: 'new-admin', role: 'admin', username: 'secondadmin' });
    expect(Number.isNaN(Date.parse(user.account.createdAt))).toBe(false);
    expect(getUsers()).toHaveLength(2);
  });

  it('rejects duplicate names case-insensitively and preserves existing data', () => {
    saveUsers([registeredUser]);
    const result = createManagedUser({ displayName: 'Other', username: 'WRITER', password: 'demo', role: 'user' });
    expect(result.errors.username).toBe('That username is already taken.');
    expect(getUsers()).toEqual([registeredUser]);
  });

  it('does not allow deleting the built-in account or the active session account', () => {
    expect(getBuiltInAdmin()).toMatchObject({ id: 'admin', builtIn: true, username: 'admin' });
    expect(canDeleteUser(getBuiltInAdmin(), adminSession)).toBe(false);
    saveUsers([registeredUser]);
    expect(canDeleteUser(registeredUser, { userId: 'u-1', role: 'admin' })).toBe(false);
    expect(deleteManagedUser('u-1', { userId: 'u-1', role: 'admin' })).toMatchObject({ ok: false, error: 'This account cannot be deleted.' });
    expect(getUsers()).toEqual([registeredUser]);
  });

  it('deletes an eligible account and verifies persistent state', () => {
    saveUsers([registeredUser]);
    expect(canDeleteUser(registeredUser, adminSession)).toBe(true);
    expect(deleteManagedUser('u-1', adminSession)).toEqual({ ok: true });
    expect(getUsers()).toEqual([]);
  });

  it('reports missing targets and local storage failures', () => {
    expect(deleteManagedUser('missing', adminSession)).toMatchObject({ ok: false, error: 'User not found.' });
    saveUsers([registeredUser]);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(deleteManagedUser('u-1', adminSession)).toMatchObject({ ok: false, error: 'Unable to delete this account. Check browser storage and try again.' });
    expect(getUsers()).toEqual([registeredUser]);
  });
});
