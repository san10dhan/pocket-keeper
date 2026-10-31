import { test, expect } from '@playwright/test';

test.describe('Pocket-Keeper authentication', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/login\?/);
    await expect(page.getByRole('heading', { name: 'Sign in to your workspace' })).toBeVisible();

    await expect(page).toHaveURL(/returnUrl=%2Fdashboard/i);
  });

  test('renders the login form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Sign in to your workspace' })).toBeVisible();

    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Demo accounts' })).toBeVisible();
  });

  test('shows validation errors when submitting an empty form', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Enter a valid email address.')).toBeVisible();

    await expect(page.getByText('Password is required.')).toBeVisible();

    await expect(page).toHaveURL(/\/login$/);
  });

  test('shows an error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email address').fill('wrong@example.com');
    await page.getByLabel('Password').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('alert')).toContainText('The email or password is incorrect.');

    await expect(page).toHaveURL(/\/login$/);
  });

  test('admin can sign in and reach the dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email address').fill('admin@pocketkeeper.demo');
    await page.getByLabel('Password').fill('Admin@123!test');

    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('demo account button fills the login form', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /admin.*use account/i }).click();

    await expect(page.getByLabel('Email address')).toHaveValue('admin@pocketkeeper.demo');

    await expect(page.getByLabel('Password')).toHaveValue('Admin@123!test');
  });

  test('preserves a safe return URL after login', async ({ page }) => {
    await page.goto('/login?returnUrl=%2Fbelongings');

    await page.getByLabel('Email address').fill('admin@pocketkeeper.demo');
    await page.getByLabel('Password').fill('Admin@123!test');

    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/belongings$/);
  });

  test('does not redirect to an external URL after login', async ({ page }) => {
    await page.goto('/login?returnUrl=https%3A%2F%2Fexample.com');

    await page.getByLabel('Email address').fill('admin@pocketkeeper.demo');
    await page.getByLabel('Password').fill('Admin@123!test');

    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
