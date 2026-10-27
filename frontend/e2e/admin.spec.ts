import { expect, test } from '@playwright/test';

test('admin reviews dashboard, creates an account, and sees protected default admin row', async ({ page }) => {
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  await page.goto('/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText('Total Posts')).toBeVisible();
  await expect(page.getByText('User-authored Posts')).toBeVisible();
  await page.getByRole('link', { name: 'Manage Users' }).click();
  await expect(page).toHaveURL(/\/users$/);
  await expect(page.getByText('Default admin cannot be deleted.')).toBeDisabled();
  await page.getByLabel('Display Name').fill('Morgan Reed');
  await page.getByLabel('Username').fill('morgan');
  await page.getByLabel('Password').fill('demo-only');
  await page.getByLabel('Role').selectOption('user');
  await page.getByRole('button', { name: 'Create User' }).click();
  await expect(page.getByRole('status')).toHaveText('Account created successfully.');
  await expect(page.getByText('Morgan Reed')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Morgan Reed')).toBeVisible();
  await page.evaluate(() => localStorage.setItem('writespace_session', JSON.stringify({ userId: 'user-id', username: 'morgan', displayName: 'Morgan Reed', role: 'user' })));
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/blogs$/);
  expect(browserErrors).toEqual([]);
});
