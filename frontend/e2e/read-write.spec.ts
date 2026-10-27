import { expect, test } from '@playwright/test';

test('writer registers, publishes, reads, edits and deletes an owned post', async ({ page }) => {
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.goto('/register');
  await page.getByLabel('Display Name').fill('Riley Harper');
  await page.getByLabel('Username', { exact: true }).fill('riley');
  await page.getByLabel('Password', { exact: true }).fill('demo-pass');
  await page.getByLabel('Confirm Password').fill('demo-pass');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.getByRole('link', { name: 'Write a Post' }).click();
  await page.getByLabel('Title').fill('A post worth keeping');
  await page.getByLabel('Content').fill('First paragraph.\nSecond paragraph.');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page.getByRole('heading', { name: 'A post worth keeping' })).toBeVisible();
  await expect(page.getByText('First paragraph.\nSecond paragraph.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'A post worth keeping' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to All Posts' }).click();
  await expect(page.getByRole('heading', { name: 'A post worth keeping' })).toBeVisible();
  await page.getByRole('link', { name: 'Edit A post worth keeping' }).click();
  await page.getByLabel('Title').fill('An updated post');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByRole('heading', { name: 'An updated post' })).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByRole('heading', { name: 'No blogs yet. Be the first to write one!' })).toBeVisible();
  expect(browserErrors).toEqual([]);
});
