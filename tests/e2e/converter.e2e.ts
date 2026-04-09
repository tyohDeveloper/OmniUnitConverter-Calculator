import { test, expect } from '@playwright/test';

test.describe('OmniUnit Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the converter page', async ({ page }) => {
    await expect(page).toHaveTitle(/OmniUnit/);
  });

  test('should display category sidebar', async ({ page }) => {
    await expect(page.getByText('Base Quantities')).toBeVisible();
    await expect(page.getByText('Mechanics')).toBeVisible();
  });

  test('should perform basic length conversion', async ({ page }) => {
    await page.getByText('Length').first().click();
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
  });

  test('should show Typography category in sidebar under Other', async ({ page }) => {
    await expect(page.getByText('Other')).toBeVisible();
    await expect(page.getByText('Typography')).toBeVisible();
  });

  test('should display typography units including Ligne and Didot Point when selected', async ({ page }) => {
    await page.getByText('Typography').first().click();
    await expect(page.getByText('Ligne')).toBeVisible();
    await expect(page.getByText('Didot Point')).toBeVisible();
    await expect(page.getByText('Agate')).toBeVisible();
  });
});
