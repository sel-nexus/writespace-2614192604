import { expect, test } from '@playwright/test';

test('role-aware writer journey persists content and reloads direct routes', async ({ page }) => {
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
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByText('No blogs yet. Be the first to write one!')).toBeVisible();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Write' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Write' }).click();
  await page.getByLabel('Title').fill('A retained thought');
  await page.getByLabel('Content').fill('First thought.\nA second line.');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page.getByRole('heading', { name: 'A retained thought' })).toBeVisible();
  await expect(page.getByText('First thought.\nA second line.')).toBeVisible();
  const postPath = new URL(page.url()).pathname;
  await page.reload();
  await expect(page.getByRole('heading', { name: 'A retained thought' })).toBeVisible();
  await page.goto(postPath);
  await expect(page.getByRole('heading', { name: 'A retained thought' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_posts')).length)).toBe(1);
  expect(browserErrors).toEqual([]);
});

test('public product disclosure is available without signing in', async ({ page }) => {
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /your thoughts\. your space/i })).toBeVisible();
  await expect(page.getByText(/local demo|browser/i).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get Started' })).toHaveAttribute('href', '/register');
  expect(browserErrors).toEqual([]);
});

test('authenticated navigation collapses and operates at mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Users' })).toBeVisible();
});
