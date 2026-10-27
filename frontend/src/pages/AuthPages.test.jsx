import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage.jsx';
import RegisterPage from './RegisterPage.jsx';

/** Render authentication pages with visible route destinations for assertions. */
function renderAuth(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/blogs" element={<h1>Blogs home</h1>} />
        <Route path="/admin" element={<h1>Admin home</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => window.localStorage.clear());

describe('authentication pages', () => {
  it('shows labeled login inputs and exposes inline errors for invalid credentials', async () => {
    const user = userEvent.setup();
    renderAuth('/login');
    expect(screen.getByLabelText('Username')).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'incorrect');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid username or password.');
    expect(screen.queryByRole('heading', { name: 'Admin home' })).not.toBeInTheDocument();
  });

  it('routes the built-in administrator to the administrator home', async () => {
    const user = userEvent.setup();
    renderAuth('/login');
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'admin');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByRole('heading', { name: 'Admin home' })).toBeInTheDocument();
  });

  it('associates registration errors with required labels and rejects mismatches', async () => {
    const user = userEvent.setup();
    renderAuth('/register');
    for (const name of ['Display Name', 'Username', 'Password', 'Confirm Password']) {
      expect(screen.getByLabelText(name)).toHaveAttribute('aria-required', 'true');
    }
    await user.type(screen.getByLabelText('Display Name'), 'New Writer');
    await user.type(screen.getByLabelText('Username'), 'newwriter');
    await user.type(screen.getByLabelText('Password'), 'one');
    await user.type(screen.getByLabelText('Confirm Password'), 'two');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByText('Passwords do not match.')).toHaveAttribute('role', 'alert');
    expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('registers a user and routes to blogs, then routes an existing session away from auth pages', async () => {
    const user = userEvent.setup();
    renderAuth('/register');
    await user.type(screen.getByLabelText('Display Name'), 'New Writer');
    await user.type(screen.getByLabelText('Username'), 'newwriter');
    await user.type(screen.getByLabelText('Password'), 'demo-pass');
    await user.type(screen.getByLabelText('Confirm Password'), 'demo-pass');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(await screen.findByRole('heading', { name: 'Blogs home' })).toBeInTheDocument();
    cleanup();
    renderAuth('/login');
    expect(await screen.findByRole('heading', { name: 'Blogs home' })).toBeInTheDocument();
  });
});
