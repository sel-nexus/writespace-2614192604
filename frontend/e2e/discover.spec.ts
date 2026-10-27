import { expect, test } from '@playwright/test';

test('guest discovers WriteSpace and reaches account entry points', async ({ page }) => {
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: /your thoughts\. your space/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Write Freely' })).toBeVisible();
  await expect(page.getByText('No posts yet - check back soon!')).toBeVisible();
  await page.getByRole('link', { name: 'Start Reading' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/');
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await expect(page).toHaveURL(/\/register$/);
  expect(browserErrors).toEqual([]);
});
