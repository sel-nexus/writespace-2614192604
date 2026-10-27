import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearSession, getPosts, getSession, getUsers, savePosts, saveUsers, setSession } from './storage.js';

/** Install a controllable browser storage object for one test. */
function useStorage(storage) {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: storage,
  });
}

/** Create a small Map-backed implementation of the browser storage contract. */
function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  useStorage(createMemoryStorage());
});

describe('local storage helpers', () => {
  it('returns empty collections and no session when keys are absent', () => {
    useStorage(createMemoryStorage());
    expect(getPosts()).toEqual([]);
    expect(getUsers()).toEqual([]);
    expect(getSession()).toBeNull();
  });

  it('reads valid collections and persists writes', () => {
    useStorage(createMemoryStorage());
    expect(savePosts([{ id: 'p1' }])).toBe(true);
    expect(saveUsers([{ id: 'u1' }])).toBe(true);
    expect(setSession({ userId: 'u1', role: 'user' })).toBe(true);
    expect(getPosts()).toEqual([{ id: 'p1' }]);
    expect(getUsers()).toEqual([{ id: 'u1' }]);
    expect(getSession()).toEqual({ userId: 'u1', role: 'user' });
  });

  it('falls back safely for malformed JSON and unexpected shapes', () => {
    const storage = createMemoryStorage();
    storage.setItem('writespace_posts', '{broken');
    storage.setItem('writespace_users', JSON.stringify({ id: 'not-a-list' }));
    storage.setItem('writespace_session', JSON.stringify(['not', 'an', 'object']));
    useStorage(storage);
    expect(getPosts()).toEqual([]);
    expect(getUsers()).toEqual([]);
    expect(getSession()).toBeNull();
  });

  it('falls back when localStorage access throws', () => {
    useStorage({ getItem: () => { throw new Error('storage blocked'); } });
    expect(getPosts()).toEqual([]);
    expect(getUsers()).toEqual([]);
    expect(getSession()).toBeNull();
  });

  it('rejects invalid write containers without persisting them', () => {
    useStorage(createMemoryStorage());
    expect(savePosts({ id: 'p1' })).toBe(false);
    expect(saveUsers(null)).toBe(false);
    expect(setSession([])).toBe(false);
  });

  it('reports write and clear failures instead of swallowing their outcome', () => {
    const storage = {
      getItem: () => null,
      setItem: () => { throw new Error('quota exceeded'); },
      removeItem: () => { throw new Error('storage blocked'); },
    };
    useStorage(storage);
    expect(savePosts([])).toBe(false);
    expect(setSession({ userId: 'u1' })).toBe(false);
    expect(clearSession()).toBe(false);
  });

  it('removes the session key on logout', () => {
    const storage = createMemoryStorage();
    useStorage(storage);
    setSession({ userId: 'u1' });
    expect(clearSession()).toBe(true);
    expect(getSession()).toBeNull();
  });
});
