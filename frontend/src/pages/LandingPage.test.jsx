import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage.jsx';
import { savePosts } from '../utils/storage.js';

/** Render the page in an isolated router for route assertions. */
function renderLanding(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<h1>Login destination</h1>} />
        <Route path="/register" element={<h1>Register destination</h1>} />
        <Route path="/blog/:id" element={<h1>Post destination</h1>} />
        <Route path="/blogs" element={<h1>Blogs destination</h1>} />
        <Route path="/admin" element={<h1>Admin destination</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('LandingPage', () => {
  it('shows public content, guest navigation, feature cards and empty latest state', () => {
    renderLanding();
    expect(screen.getByRole('heading', { name: /your thoughts\. your space/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toHaveAccessibleName('Main navigation');
    expect(screen.getByRole('navigation', { name: 'Main navigation' }).querySelector('a[href="/login"]')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Get Started' })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('heading', { name: 'Write Freely' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Private & Local' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Instant & Fast' })).toBeInTheDocument();
    expect(screen.getByText('No posts yet - check back soon!')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Footer navigation' })).toBeInTheDocument();
  });

  it('routes guest calls to action and latest navigation to the right screens', async () => {
    const user = userEvent.setup();
    renderLanding();
    await user.click(screen.getByRole('link', { name: 'Start Reading' }));
    expect(screen.getByRole('heading', { name: 'Login destination' })).toBeInTheDocument();
    cleanup();
    renderLanding();
    await user.click(screen.getByRole('link', { name: 'Get Started Free' }));
    expect(screen.getByRole('heading', { name: 'Register destination' })).toBeInTheDocument();
    cleanup();
    renderLanding();
    await user.click(screen.getAllByRole('link', { name: 'All Blogs' })[0]);
    expect(screen.getByRole('heading', { name: 'Login destination' })).toBeInTheDocument();
  });

  it('renders only three newest local post previews and directs guests to login', async () => {
    savePosts([
      { id: 'old', title: 'Older note', content: 'Earlier idea', createdAt: '2023-01-01T00:00:00.000Z' },
      { id: 'newest', title: 'Newest note', content: 'Fresh idea', createdAt: '2025-01-03T00:00:00.000Z' },
      { id: 'middle', title: 'Middle note', content: 'Another idea', createdAt: '2025-01-02T00:00:00.000Z' },
      { id: 'second', title: 'Second note', content: 'One more idea', createdAt: '2025-01-01T00:00:00.000Z' },
    ]);
    renderLanding();
    expect(screen.getByRole('heading', { name: 'Newest note' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Middle note' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Second note' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Older note' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /newest note/i }));
    expect(screen.getByRole('heading', { name: 'Login destination' })).toBeInTheDocument();
  });

  it('gracefully renders malformed post previews and preserves links for valid posts', async () => {
    window.localStorage.setItem('writespace_session', JSON.stringify({ userId: 'u-1', role: 'user', username: 'writer', displayName: 'Writer' }));
    savePosts([
      { id: 'non-string-content', title: 'Missing words', content: { unexpected: true }, createdAt: '2025-01-03T00:00:00.000Z' },
      { id: 'missing-content', title: 'No content field', createdAt: '2025-01-02T00:00:00.000Z' },
      { id: 'valid', title: 'Valid note', content: 'Readable preview', createdAt: '2025-01-01T00:00:00.000Z' },
    ]);

    renderLanding();

    expect(screen.getByRole('heading', { name: 'Missing words' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No content field' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Valid note' })).toBeInTheDocument();
    expect(screen.getByText('Readable preview')).toBeInTheDocument();
    expect(screen.queryByText('No posts yet - check back soon!')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /valid note/i }));
    expect(screen.getByRole('heading', { name: 'Post destination' })).toBeInTheDocument();
  });

  it('routes signed-in calls to action to the blogs and role dashboard', () => {
    window.localStorage.setItem('writespace_session', JSON.stringify({ userId: 'u-1', role: 'user', username: 'writer', displayName: 'Writer' }));
    renderLanding();
    expect(screen.getByRole('link', { name: 'Start Reading' })).toHaveAttribute('href', '/blogs');
    expect(screen.getByRole('link', { name: 'Go to Dashboard' })).toHaveAttribute('href', '/blogs');
    expect(screen.getByText('Welcome, Writer')).toBeInTheDocument();
  });
});
