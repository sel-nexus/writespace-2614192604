import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getUsers, getSession, saveUsers } from './storage.js';
import { getHomePath, login, registerUser } from './auth.js';

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('local demo authentication', () => {
  it('logs in the built-in administrator and stores a role session', () => {
    const result = login('admin', 'admin');
    expect(result.ok).toBe(true);
    expect(result.session).toMatchObject({ userId: 'admin', role: 'admin', displayName: 'Administrator' });
    expect(getSession()).toEqual(result.session);
    expect(getHomePath(result.session)).toBe('/admin');
  });

  it('rejects incorrect built-in or empty credentials without setting a session', () => {
    expect(login('admin', 'wrong')).toEqual({ ok: false, error: 'Invalid username or password.' });
    expect(login('', '')).toEqual({ ok: false, error: 'Invalid username or password.' });
    expect(getSession()).toBeNull();
  });

  it('logs in a registered writer case-insensitively and never exposes their password in session', () => {
    saveUsers([{ id: 'u-1', displayName: 'A Writer', username: 'writer', password: 'demo-pass', role: 'user' }]);
    const result = login('WRITER', 'demo-pass');
    expect(result.ok).toBe(true);
    expect(result.session).toEqual({ userId: 'u-1', username: 'writer', displayName: 'A Writer', role: 'user' });
    expect(result.session).not.toHaveProperty('password');
    expect(getHomePath(result.session)).toBe('/blogs');
  });

  it('rejects an unknown user, wrong password, and malformed role', () => {
    saveUsers([
      { id: 'u-1', displayName: 'Writer', username: 'writer', password: 'secret', role: 'user' },
      { id: 'u-2', username: 'strange', password: 'secret', role: 'owner' },
    ]);
    expect(login('writer', 'bad').ok).toBe(false);
    expect(login('missing', 'secret').ok).toBe(false);
    expect(login('strange', 'secret').ok).toBe(false);
  });

  it('validates all registration fields, matching passwords and reserved username', () => {
    expect(registerUser({ displayName: '', username: '', password: '', confirmPassword: '' }).errors).toEqual({
      displayName: 'Display name is required.',
      username: 'Username is required.',
      password: 'Password is required.',
      confirmPassword: 'Confirm password is required.',
    });
    expect(registerUser({ displayName: 'Writer', username: 'admin', password: 'x', confirmPassword: 'y' }).errors).toMatchObject({
      username: 'That username is already taken.',
      confirmPassword: 'Passwords do not match.',
    });
  });

  it('creates a regular user with UUID, timestamp and persisted session', () => {
    const uuid = vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-user-id');
    const result = registerUser({ displayName: ' New Writer ', username: 'newwriter', password: 'demo', confirmPassword: 'demo' });
    expect(result.ok).toBe(true);
    expect(uuid).toHaveBeenCalledOnce();
    expect(result.user).toMatchObject({ id: 'new-user-id', displayName: 'New Writer', username: 'newwriter', role: 'user', password: 'demo' });
    expect(Number.isNaN(Date.parse(result.user.createdAt))).toBe(false);
    expect(getUsers()).toEqual([result.user]);
    expect(getSession()).toEqual(result.session);
  });

  it('rejects duplicate usernames case-insensitively without changing saved users', () => {
    const original = [{ id: 'u-1', username: 'writer', displayName: 'Writer', password: 'demo', role: 'user' }];
    saveUsers(original);
    const result = registerUser({ displayName: 'Other', username: 'WRITER', password: 'demo', confirmPassword: 'demo' });
    expect(result.ok).toBe(false);
    expect(result.errors.username).toBe('That username is already taken.');
    expect(getUsers()).toEqual(original);
  });

  it('reports local storage write errors during registration and login', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(registerUser({ displayName: 'Writer', username: 'writer', password: 'demo', confirmPassword: 'demo' })).toMatchObject({
      ok: false,
      errors: { form: 'Unable to save this account. Check browser storage and try again.' },
    });
    expect(login('admin', 'admin')).toMatchObject({ ok: false, error: 'Unable to save your session. Check browser storage and try again.' });
  });
});
