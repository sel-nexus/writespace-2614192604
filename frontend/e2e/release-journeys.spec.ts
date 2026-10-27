import { expect, test } from '@playwright/test';

async function captureInterfaceEvidence(page, name, testInfo) {
  const tree = await page.locator('body').ariaSnapshot();
  const html = await page.locator('body').evaluate((body) => body.outerHTML);
  const styles = await page.evaluate(() => {
    const selectors = ['body', 'header', 'main h1', 'main h2', 'main button', 'main a', 'main section'];
    return Object.fromEntries(selectors.map((selector) => {
      const element = document.querySelector(selector);
      if (!element) return [selector, null];
      const computed = getComputedStyle(element);
      return [selector, {
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        borderColor: computed.borderColor,
        borderRadius: computed.borderRadius,
        padding: computed.padding,
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
      }];
    }));
  });
  await testInfo.attach(`${name}-accessibility.txt`, { body: tree, contentType: 'text/plain' });
  await testInfo.attach(`${name}-html.txt`, { body: html, contentType: 'text/plain' });
  await testInfo.attach(`${name}-computed-styles.json`, { body: JSON.stringify(styles, null, 2), contentType: 'application/json' });
  await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
}

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
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Write', exact: true }).click();
  await page.getByLabel('Title').fill('A retained thought');
  await page.getByLabel('Content').fill('First thought.\nA second line.');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page.getByRole('heading', { name: 'A retained thought' })).toBeVisible();
  await expect(page.getByText('First thought.\nA second line.')).toBeVisible();
  await captureInterfaceEvidence(page, 'writer-post-desktop', test.info());
  await page.reload();
  await expect(page.getByRole('heading', { name: 'A retained thought' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to All Posts' }).click();
  await expect(page.getByRole('link', { name: /Oct .* A retained thought/ })).toBeVisible();
  await page.getByRole('link', { name: /Oct .* A retained thought/ }).click();
  await expect(page.getByRole('heading', { name: 'A retained thought' })).toBeVisible();
  await expect(page.getByText('First thought.\nA second line.')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_posts')))).toEqual([
    expect.objectContaining({ title: 'A retained thought', content: 'First thought.\nA second line.', authorName: 'Riley Harper' }),
  ]);
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
  await captureInterfaceEvidence(page, 'public-desktop', test.info());
  await expect(page.getByRole('link', { name: 'Get Started', exact: true })).toHaveAttribute('href', '/register');
  expect(browserErrors).toEqual([]);
});

test('guest is redirected to login when entering a protected writing route', async ({ page }) => {
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  await page.goto('/write');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Sign in to WriteSpace' })).toBeVisible();
  await expect(page.getByLabel('Title')).toHaveCount(0);
  expect(browserErrors).toEqual([]);
});

test('authenticated navigation collapses and operates at mobile viewport', async ({ page }) => {
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Users' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Users' }).click();
  await expect(page).toHaveURL(/\/users$/);
  await expect(page.getByRole('heading', { name: 'Manage Users' })).toBeVisible();
  await captureInterfaceEvidence(page, 'admin-users-mobile', test.info());
  expect(browserErrors).toEqual([]);
});
