import { expect, test } from '@playwright/test';

test('registration, writer login and invalid credentials use local storage sessions', async ({ page }) => {
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
  await expect(page.getByText('Blogs')).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/blogs$/);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_session')).username)).toBe('riley');

  await page.evaluate(() => localStorage.clear());
  await page.goto('/login');
  await page.getByLabel('Username').fill('unknown');
  await page.getByLabel('Password').fill('wrong');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('alert')).toHaveText('Invalid username or password.');
  expect(browserErrors).toEqual([]);
});
