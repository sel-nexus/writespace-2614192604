import { expect, test } from '@playwright/test';

test('guest discovers WriteSpace, opens a saved preview, and reaches account entry points', async ({ page }, testInfo) => {
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.addInitScript(() => {
    localStorage.setItem('writespace_posts', JSON.stringify([{
      id: 'preview-post-1',
      title: 'A saved idea for later',
      content: 'A real preview from the local writing space.',
      createdAt: '2026-06-15T12:00:00.000Z',
      authorId: 'preview-author',
      authorName: 'Casey Writer',
    }]));
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /your thoughts\. your space/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Write Freely' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A saved idea for later' })).toBeVisible();
  await expect(page.getByText('A real preview from the local writing space.')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('discover-landing.png'), fullPage: true });
  await page.getByRole('button', { name: /A saved idea for later/ }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Sign in to WriteSpace' })).toBeVisible();
  await page.getByRole('link', { name: 'WriteSpace.' }).click();
  await expect(page).toHaveURL('/');
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await expect(page).toHaveURL(/\/register$/);
  expect(browserErrors).toEqual([]);
});
