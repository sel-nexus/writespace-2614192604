import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPosts, savePosts } from './storage.js';
import { canManagePost, createPost, deletePost, formatPostDate, getExcerpt, sortPostsNewest, updatePost } from './posts.js';

const owner = { userId: 'writer-1', displayName: 'Riley', role: 'user' };
const other = { userId: 'writer-2', displayName: 'Avery', role: 'user' };
const admin = { userId: 'admin', displayName: 'Administrator', role: 'admin' };
const samplePost = { id: 'post-1', title: 'A title', content: 'A body', createdAt: '2025-02-03T12:00:00.000Z', authorId: owner.userId, authorName: owner.displayName };

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('post utilities', () => {
  it('sorts newest first without mutating its input and places invalid dates last', () => {
    const posts = [samplePost, { ...samplePost, id: 'old', createdAt: '2024-01-01T00:00:00.000Z' }, { ...samplePost, id: 'bad', createdAt: 'not-a-date' }];
    expect(sortPostsNewest(posts).map((post) => post.id)).toEqual(['post-1', 'old', 'bad']);
    expect(posts[0].id).toBe('post-1');
  });

  it('returns an excerpt within the limit and handles invalid content', () => {
    expect(getExcerpt('short')).toBe('short');
    expect(getExcerpt('x'.repeat(125))).toBe(`${'x'.repeat(120)}…`);
    expect(getExcerpt(null)).toBe('');
  });

  it('formats valid dates and marks invalid dates clearly', () => {
    expect(formatPostDate('2025-02-03T12:00:00.000Z')).toMatch(/Feb 03, 2025/);
    expect(formatPostDate('bad')).toBe('Date unavailable');
  });

  it('allows only the author or admin to manage a post', () => {
    expect(canManagePost(samplePost, owner)).toBe(true);
    expect(canManagePost(samplePost, admin)).toBe(true);
    expect(canManagePost(samplePost, other)).toBe(false);
    expect(canManagePost(null, owner)).toBe(false);
  });

  it('creates a valid post with owner metadata and persists it', () => {
    const uuid = vi.spyOn(crypto, 'randomUUID').mockReturnValue('post-new');
    const result = createPost({ title: ' A new title ', content: ' A new body ', session: owner }, undefined, '2025-03-01T00:00:00.000Z');
    expect(uuid).toHaveBeenCalledOnce();
    expect(result).toEqual({ ok: true, post: { id: 'post-new', title: 'A new title', content: 'A new body', createdAt: '2025-03-01T00:00:00.000Z', authorId: owner.userId, authorName: owner.displayName } });
    expect(getPosts()).toEqual([result.post]);
  });

  it('preserves XSS-like title and content as inert plain-text values', () => {
    const title = '<img src=x onerror="alert(1)">';
    const content = '<script>alert("xss")</script><svg onload="alert(1)">';
    const result = createPost({ title, content, session: owner }, 'post-inert-xss');

    expect(result).toEqual({
      ok: true,
      post: { id: 'post-inert-xss', title, content, createdAt: expect.any(String), authorId: owner.userId, authorName: owner.displayName },
    });
    expect(getPosts()).toEqual([result.post]);
  });

  it('persists very large post titles and content without truncating them', () => {
    const title = `Large title ${'t'.repeat(10_000)}`;
    const content = `Large content ${'c'.repeat(100_000)}`;
    const result = createPost({ title, content, session: owner }, 'post-large-input');

    expect(result.ok).toBe(true);
    expect(result.post.title).toBe(title);
    expect(result.post.content).toBe(content);
    expect(getPosts()).toEqual([result.post]);
  });

  it('reports local persistence failure when creating a post', () => {
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
      if (key === 'writespace_posts') throw new Error('quota');
      return originalSetItem.call(this, key, value);
    });

    expect(createPost({ title: 'Title', content: 'Body', session: owner }, 'post-unsaved')).toEqual({
      ok: false,
      error: 'Unable to save your post. Check browser storage and try again.',
    });
    expect(getPosts()).toEqual([]);
  });

  it('rejects missing post fields or author context', () => {
    expect(createPost({ title: '', content: 'body', session: owner })).toMatchObject({ ok: false, error: expect.stringContaining('required') });
    expect(createPost({ title: 'title', content: 'body', session: null })).toMatchObject({ ok: false });
    expect(getPosts()).toEqual([]);
  });

  it('updates an owned post and verifies the persisted transition', () => {
    savePosts([samplePost]);
    const result = updatePost('post-1', { title: ' Revised ', content: 'New body' }, owner);
    expect(result).toEqual({ ok: true, post: { ...samplePost, title: 'Revised', content: 'New body' } });
    expect(getPosts()).toEqual([result.post]);
  });

  it('reports storage failure and preserves the stored post when updating an owned post', () => {
    savePosts([samplePost]);
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
      if (key === 'writespace_posts') throw new Error('quota');
      return originalSetItem.call(this, key, value);
    });

    expect(updatePost('post-1', { title: 'Revised', content: 'New body' }, owner)).toEqual({
      ok: false,
      error: 'Unable to save your changes. Check browser storage and try again.',
    });
    expect(getPosts()).toEqual([samplePost]);
  });

  it('rejects missing, unauthorized, and blank post updates without changing data', () => {
    savePosts([samplePost]);
    expect(updatePost('missing', { title: 'x', content: 'y' }, owner).error).toBe('Post not found.');
    expect(updatePost('post-1', { title: 'x', content: 'y' }, other).error).toBe('You cannot edit this post.');
    expect(updatePost('post-1', { title: '', content: '' }, owner).error).toBe('Title and content are required.');
    expect(getPosts()).toEqual([samplePost]);
  });

  it('allows administrators to edit another writer post', () => {
    savePosts([samplePost]);
    expect(updatePost('post-1', { title: 'Admin edit', content: 'Reviewed' }, admin).ok).toBe(true);
    expect(getPosts()[0].title).toBe('Admin edit');
  });

  it('deletes owner posts and reports missing or forbidden deletes', () => {
    savePosts([samplePost]);
    expect(deletePost('post-1', other).error).toBe('You cannot delete this post.');
    expect(deletePost('missing', owner).error).toBe('Post not found.');
    expect(getPosts()).toEqual([samplePost]);
    expect(deletePost('post-1', owner)).toEqual({ ok: true });
    expect(getPosts()).toEqual([]);
  });

  it('allows admin deletion and reports local persistence failure', () => {
    savePosts([samplePost]);
    expect(deletePost('post-1', admin)).toEqual({ ok: true });
    savePosts([samplePost]);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(deletePost('post-1', owner)).toMatchObject({ ok: false, error: 'Unable to delete this post. Check browser storage and try again.' });
    expect(getPosts()).toEqual([samplePost]);
  });
});
