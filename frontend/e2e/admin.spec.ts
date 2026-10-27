import { expect, test } from '@playwright/test';

test('admin creates and deletes a post and manages accounts without removing the default admin', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.goto('/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Good to see you, Administrator.' })).toBeVisible();
  await expect(page.getByText('Total Posts')).toBeVisible();
  await expect(page.getByText('User-authored Posts')).toBeVisible();

  await page.getByRole('link', { name: 'Write New Post' }).click();
  await expect(page).toHaveURL(/\/write$/);
  await expect(page.getByLabel('Title')).toBeVisible();
  await expect(page.getByLabel('Content')).toBeVisible();
  await page.getByLabel('Title').fill('Admin E2E post');
  await page.getByLabel('Content').fill('Created from the admin journey and removed after confirmation.');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page).toHaveURL(/\/blog\/.+/);
  await expect(page.getByRole('heading', { name: 'Admin E2E post' })).toBeVisible();
  await expect(page.getByText('Created from the admin journey and removed after confirmation.')).toBeVisible();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe('Delete "Admin E2E post"? This cannot be undone.');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByText('Admin E2E post')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => {
    const posts = JSON.parse(window.localStorage.getItem('writespace_posts') || '[]');
    return posts.some((post: { title: string }) => post.title === 'Admin E2E post');
  })).toBe(false);
  await page.reload();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByText('Admin E2E post')).toHaveCount(0);

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL('/');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('link', { name: 'Manage Users' }).click();
  await expect(page).toHaveURL(/\/users$/);

  const builtInAdminDeleteButton = page.getByRole('button', { name: 'Default admin cannot be deleted.' });
  const builtInAdminRow = page.getByRole('article').filter({ has: builtInAdminDeleteButton });
  await expect(builtInAdminRow).toContainText('Administrator');
  await expect(builtInAdminRow).toContainText('@admin');
  await expect(builtInAdminDeleteButton).toBeDisabled();
  await page.getByLabel('Display Name').fill('Morgan Reed');
  await page.getByLabel('Username').fill('morgan');
  await page.getByLabel('Password').fill('demo-only');
  await page.getByLabel('Role').selectOption('user');
  await page.getByRole('button', { name: 'Create User' }).click();
  await expect(page.getByRole('status')).toHaveText('Account created successfully.');
  await expect(page.getByRole('article').filter({ hasText: 'Morgan Reed' }).locator('p').first()).toHaveText('Morgan Reed');
  await page.reload();
  const managedUserRow = page.getByRole('article').filter({ hasText: 'Morgan Reed' });
  await expect(managedUserRow).toContainText('@morgan');
  await expect(managedUserRow.getByRole('button', { name: 'Delete Morgan Reed' })).toBeEnabled();

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL('/');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Username').fill('morgan');
  await page.getByLabel('Password').fill('demo-only');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/blogs$/);

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL('/');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('link', { name: 'Manage Users' }).click();
  await expect(page).toHaveURL(/\/users$/);
  const accountDeleteButton = page.getByRole('button', { name: 'Delete Morgan Reed' });
  await expect(accountDeleteButton).toBeEnabled();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe('Delete the account for Morgan Reed? This cannot be undone.');
    await dialog.accept();
  });
  await accountDeleteButton.click();
  await expect(page.getByRole('status')).toHaveText('Account deleted.');
  await expect(page.getByRole('article').filter({ hasText: 'Morgan Reed' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('article').filter({ hasText: 'Morgan Reed' })).toHaveCount(0);
  const protectedAdminButton = page.getByRole('button', { name: 'Default admin cannot be deleted.' });
  const protectedAdminRow = page.getByRole('article').filter({ has: protectedAdminButton });
  await expect(protectedAdminRow).toContainText('Administrator');
  await expect(protectedAdminRow).toContainText('@admin');
  await expect(protectedAdminButton).toBeDisabled();

  expect(browserErrors).toEqual([]);
});

test('admin edits a persisted post written by another regular writer through visible links', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('writespace_posts', JSON.stringify([{
      id: 'regular-writer-admin-edit-e2e',
      title: 'A regular writer’s persisted post',
      content: 'Original content written by someone other than the administrator.',
      createdAt: '2025-01-15T12:00:00.000Z',
      authorId: 'e2e-regular-writer',
      authorName: 'E2E Regular Writer',
      authorRole: 'user',
    }]));
  });

  await page.goto('/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('link', { name: 'View all posts' }).click();
  await expect(page).toHaveURL(/\/blogs$/);

  const seededPostCard = page.getByRole('article').filter({ hasText: 'A regular writer’s persisted post' });
  await expect(seededPostCard).toContainText('E2E Regular Writer');
  await seededPostCard.getByRole('link', { name: /^Jan 15, 2025 A regular writer’s persisted post/ }).click();
  await expect(page).toHaveURL(/\/blog\/regular-writer-admin-edit-e2e$/);
  await expect(page.getByRole('heading', { name: 'A regular writer’s persisted post' })).toBeVisible();
  await expect(page.getByText('Original content written by someone other than the administrator.')).toBeVisible();
  await expect(page.getByRole('article').filter({ hasText: 'E2E Regular Writer' }).getByText('E2E Regular Writer', { exact: true }).last()).toBeVisible();

  await page.getByRole('link', { name: 'Edit', exact: true }).click();
  await expect(page).toHaveURL(/\/edit\/regular-writer-admin-edit-e2e$/);
  await page.getByLabel('Title').fill('Updated by the administrator');
  await page.getByLabel('Content').fill('Updated content saved by the administrator for the regular writer’s post.');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page).toHaveURL(/\/blog\/regular-writer-admin-edit-e2e$/);
  await expect(page.getByRole('heading', { name: 'Updated by the administrator' })).toBeVisible();
  await expect(page.getByText('Updated content saved by the administrator for the regular writer’s post.')).toBeVisible();
  await expect(page.locator('article').locator('span').filter({ hasText: 'E2E Regular Writer' }).last()).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_posts') || '[]')[0].title)).toBe('Updated by the administrator');

  await page.getByRole('link', { name: 'Back to All Posts' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  const updatedPostCard = page.getByRole('article').filter({ hasText: 'Updated by the administrator' });
  await expect(updatedPostCard).toContainText('Updated content saved by the administrator for the regular writer’s post.');
  await updatedPostCard.locator('a[href="/blog/regular-writer-admin-edit-e2e"]').click();
  await expect(page).toHaveURL(/\/blog\/regular-writer-admin-edit-e2e$/);
  await expect(page.getByRole('heading', { name: 'Updated by the administrator' })).toBeVisible();
  await expect(page.getByText('Updated content saved by the administrator for the regular writer’s post.')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_posts') || '[]'))).toEqual([
    expect.objectContaining({
      id: 'regular-writer-admin-edit-e2e',
      title: 'Updated by the administrator',
      content: 'Updated content saved by the administrator for the regular writer’s post.',
      authorId: 'e2e-regular-writer',
      authorName: 'E2E Regular Writer',
    }),
  ]);
  expect(browserErrors).toEqual([]);
});

test('regular users are redirected when /admin is their initial entry', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('writespace_session', JSON.stringify({
      userId: 'e2e-writer',
      username: 'writer',
      displayName: 'E2E Writer',
      role: 'user',
    }));
  });

  await page.goto('/admin');
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByRole('heading', { name: 'All Blogs' })).toBeVisible();
  expect(browserErrors).toEqual([]);
});