import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Home from './Home.jsx';
import ReadBlog from './ReadBlog.jsx';
import WriteBlog from './WriteBlog.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { getPosts, savePosts, setSession } from '../utils/storage.js';

const writer = { userId: 'writer-1', username: 'riley', displayName: 'Riley Harper', role: 'user' };
const otherWriter = { userId: 'writer-2', username: 'avery', displayName: 'Avery Lane', role: 'user' };
const admin = { userId: 'admin', username: 'admin', displayName: 'Administrator', role: 'admin' };
const ownPost = { id: 'own-1', title: 'Riley note', content: 'First line\nSecond line', createdAt: '2025-03-01T00:00:00.000Z', authorId: writer.userId, authorName: writer.displayName };
const otherPost = { id: 'other-1', title: 'Avery note', content: 'Another writer idea', createdAt: '2025-02-01T00:00:00.000Z', authorId: otherWriter.userId, authorName: otherWriter.displayName };

/** Render writer routes and visible targets for route transitions. */
function renderBlog(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/blogs" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/blog/:id" element={<ProtectedRoute><ReadBlog /></ProtectedRoute>} />
        <Route path="/write" element={<ProtectedRoute><WriteBlog /></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute><WriteBlog /></ProtectedRoute>} />
        <Route path="/login" element={<h1>Login destination</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('writer blog pages', () => {
  it('redirects guests from blog list to login', async () => {
    renderBlog('/blogs');
    expect(await screen.findByRole('heading', { name: 'Login destination' })).toBeInTheDocument();
  });

  it('shows empty state and a write action for a signed-in user', () => {
    setSession(writer);
    renderBlog('/blogs');
    expect(screen.getByRole('heading', { name: 'No blogs yet. Be the first to write one!' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Write your first post' })).toHaveAttribute('href', '/write');
  });

  it('lists newest posts first with author metadata and edit only for owned posts', () => {
    setSession(writer);
    savePosts([otherPost, ownPost]);
    renderBlog('/blogs');
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual(['Riley note', 'Avery note']);
    expect(screen.getAllByText('Riley Harper').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Edit Riley note' })).toHaveAttribute('href', '/edit/own-1');
    expect(screen.queryByRole('link', { name: 'Edit Avery note' })).not.toBeInTheDocument();
  });

  it('renders full post content with line breaks and omits unauthorized actions', () => {
    setSession(writer);
    savePosts([otherPost]);
    renderBlog('/blog/other-1');
    expect(screen.getByRole('heading', { name: 'Avery note' })).toBeInTheDocument();
    expect(screen.getByText('Another writer idea')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to All Posts' })).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown post id', () => {
    setSession(writer);
    renderBlog('/blog/missing');
    expect(screen.getByRole('heading', { name: 'Post not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to All Posts' })).toHaveAttribute('href', '/blogs');
  });

  it('creates a post, saves author and session metadata, and renders the detail page', async () => {
    const user = userEvent.setup();
    setSession(writer);
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('created-post');
    renderBlog('/write');
    await user.type(screen.getByLabelText('Title'), 'A fresh thought');
    await user.type(screen.getByLabelText('Content'), 'Words worth keeping');
    expect(screen.getByText('19 characters')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Publish Post' }));
    expect(await screen.findByRole('heading', { name: 'A fresh thought' })).toBeInTheDocument();
    expect(getPosts()[0]).toMatchObject({ id: 'created-post', authorId: writer.userId, authorName: writer.displayName, title: 'A fresh thought', content: 'Words worth keeping' });
  });

  it('validates required title and content and keeps the form in place', async () => {
    const user = userEvent.setup();
    setSession(writer);
    renderBlog('/write');
    await user.click(screen.getByRole('button', { name: 'Publish Post' }));
    expect(screen.getByText('Title is required.')).toHaveAttribute('role', 'alert');
    expect(screen.getByText('Content is required.')).toHaveAttribute('role', 'alert');
    expect(getPosts()).toEqual([]);
  });

  it('allows only owner or admin to edit and persists owner edits', async () => {
    const user = userEvent.setup();
    setSession(writer);
    savePosts([ownPost]);
    renderBlog('/edit/own-1');
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Updated Riley note');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByRole('heading', { name: 'Updated Riley note' })).toBeInTheDocument();
    expect(getPosts()[0].title).toBe('Updated Riley note');
    cleanup();
    setSession(otherWriter);
    renderBlog('/edit/own-1');
    expect(await screen.findByRole('heading', { name: /all blogs/i })).toBeInTheDocument();
  });

  it('confirms delete before removing an owned post', async () => {
    const user = userEvent.setup();
    setSession(writer);
    savePosts([ownPost]);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderBlog('/blog/own-1');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(getPosts()).toEqual([ownPost]);
    confirm.mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('heading', { name: 'All Blogs' })).toBeInTheDocument();
    expect(getPosts()).toEqual([]);
  });

  it('lets admin access other writers edits', async () => {
    const user = userEvent.setup();
    setSession(admin);
    savePosts([otherPost]);
    renderBlog('/edit/other-1');
    expect(screen.getByDisplayValue('Avery note')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Admin revised');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByRole('heading', { name: 'Admin revised' })).toBeInTheDocument();
  });
});
