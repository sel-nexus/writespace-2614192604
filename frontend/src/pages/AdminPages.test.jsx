import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminDashboard from './AdminDashboard.jsx';
import UserManagement from './UserManagement.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { getUsers, savePosts, saveUsers, setSession } from '../utils/storage.js';

const admin = { userId: 'admin', username: 'admin', displayName: 'Administrator', role: 'admin' };
const writer = { userId: 'writer-1', username: 'writer', displayName: 'Riley Harper', role: 'user' };
const registered = { id: 'writer-1', username: 'writer', displayName: 'Riley Harper', password: 'demo', role: 'user', createdAt: '2025-01-02T00:00:00.000Z' };

/** Render both admin routes and their role-gated targets. */
function renderAdmin(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
        <Route path="/blogs" element={<h1>Blogs home</h1>} />
        <Route path="/login" element={<h1>Login destination</h1>} />
        <Route path="/write" element={<h1>Write destination</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('administrator pages', () => {
  it('redirects guests to login and regular users away from admin routes', async () => {
    renderAdmin('/admin');
    expect(await screen.findByRole('heading', { name: 'Login destination' })).toBeInTheDocument();
    cleanup();
    setSession(writer);
    renderAdmin('/users');
    expect(await screen.findByRole('heading', { name: 'Blogs home' })).toBeInTheDocument();
  });

  it('displays the distinct statistics and five newest posts with shortcuts', () => {
    setSession(admin);
    saveUsers([registered, { ...registered, id: 'admin-two', username: 'admin-two', role: 'admin' }]);
    savePosts(Array.from({ length: 6 }, (_, index) => ({ id: `post-${index}`, title: `Post ${index}`, content: `Content ${index}`, createdAt: `2025-02-0${index + 1}T00:00:00.000Z`, authorId: index < 3 ? 'writer-1' : 'admin', authorName: index < 3 ? 'Riley Harper' : 'Administrator' })));
    renderAdmin('/admin');
    expect(screen.getByText('Total Posts')).toBeInTheDocument();
    expect(screen.getByLabelText('6 Total Posts')).toBeInTheDocument();
    expect(screen.getByLabelText('3 Total Users')).toBeInTheDocument();
    expect(screen.getByLabelText('2 Total Admins')).toBeInTheDocument();
    expect(screen.getByLabelText('3 User-authored Posts')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Write New Post' })).toHaveAttribute('href', '/write');
    expect(screen.getByRole('link', { name: 'Manage Users' })).toHaveAttribute('href', '/users');
    expect(screen.getByRole('heading', { name: 'Post 5' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Post 1' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Post 0' })).not.toBeInTheDocument();
  });

  it('confirms admin post deletion and removes it only after confirmation', async () => {
    const user = userEvent.setup();
    setSession(admin);
    savePosts([{ id: 'p1', title: 'A draft', content: 'Text', createdAt: '2025-01-01T00:00:00.000Z', authorId: writer.userId, authorName: writer.displayName }]);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderAdmin('/admin');
    await user.click(screen.getByRole('button', { name: 'Delete A draft' }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(screen.getByRole('heading', { name: 'A draft' })).toBeInTheDocument();
    confirm.mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Delete A draft' }));
    expect(await screen.findByText('No posts yet. Create the first one for this local space.')).toBeInTheDocument();
  });

  it('shows protected built-in row and blocks self-deletion', () => {
    setSession({ ...admin, userId: 'writer-1' });
    saveUsers([registered]);
    renderAdmin('/users');
    expect(screen.getAllByRole('button', { name: 'Default admin cannot be deleted.' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Default admin cannot be deleted.' })).toHaveAttribute('title', 'Default admin cannot be deleted.');
    expect(screen.getByRole('button', { name: 'You cannot delete your own account.' })).toHaveAttribute('title', 'You cannot delete your own account.');
    expect(screen.getByRole('button', { name: 'Default admin cannot be deleted.' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'You cannot delete your own account.' })).toBeDisabled();
  });

  it('creates a role-selected account and reports duplicate form submissions', async () => {
    const user = userEvent.setup();
    setSession(admin);
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-account-id');
    renderAdmin('/users');
    await user.type(screen.getByLabelText('Display Name'), 'Morgan Reed');
    await user.type(screen.getByLabelText('Username'), 'morgan');
    await user.type(screen.getByLabelText('Password'), 'demo-only');
    await user.selectOptions(screen.getByLabelText('Role'), 'admin');
    await user.click(screen.getByRole('button', { name: 'Create User' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Account created successfully.');
    expect(getUsers()[0]).toMatchObject({ id: 'new-account-id', displayName: 'Morgan Reed', username: 'morgan', role: 'admin' });
    expect(screen.getAllByText('Morgan Reed').length).toBeGreaterThan(0);
    await user.type(screen.getByLabelText('Display Name'), 'Other');
    await user.type(screen.getByLabelText('Username'), 'MORGAN');
    await user.type(screen.getByLabelText('Password'), 'demo-only');
    await user.click(screen.getByRole('button', { name: 'Create User' }));
    expect(screen.getByText('That username is already taken.')).toBeInTheDocument();
    expect(getUsers()).toHaveLength(1);
  });

  it('deletes eligible registered users only after confirmation', async () => {
    const user = userEvent.setup();
    setSession(admin);
    saveUsers([registered]);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderAdmin('/users');
    await user.click(screen.getByRole('button', { name: 'Delete Riley Harper' }));
    expect(getUsers()).toEqual([registered]);
    confirm.mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Delete Riley Harper' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Account deleted.');
    expect(getUsers()).toEqual([]);
  });
});
