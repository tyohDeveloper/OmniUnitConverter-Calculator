import { test, expect } from '@playwright/test';

test.describe('Dates/Eras tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('tab-eras').click();
    await expect(page.getByTestId('input-era-year')).toBeVisible();
  });

  test('shows all-schemes table for the default year 2026', async ({ page }) => {
    await expect(page.getByTestId('input-era-year')).toHaveValue('2026');
    await expect(page.getByTestId('table-era-results')).toBeVisible();
    await expect(page.getByTestId('text-era-value-buddhist')).toContainText('2569');
    await expect(page.getByTestId('text-era-value-holocene')).toContainText('12026');
    await expect(page.getByTestId('text-era-value-japanese')).toContainText('Reiwa 8');
  });

  test('BCE toggle converts 44 BCE to AUC 710 with ±1 indicator', async ({ page }) => {
    await page.getByTestId('input-era-year').fill('44');
    await page.getByTestId('select-era-ce-bce').click();
    await page.getByRole('option', { name: 'BCE' }).click();
    await expect(page.getByTestId('text-era-astro')).toContainText('44 BCE');
    const auc = page.getByTestId('text-era-value-auc');
    await expect(auc).toContainText('710');
    await expect(auc).toContainText('±1');
  });

  test('accepts negative astronomical year input directly', async ({ page }) => {
    await page.getByTestId('input-era-year').fill('-43');
    await expect(page.getByTestId('text-era-astro')).toContainText('44 BCE');
    await expect(page.getByTestId('text-era-value-auc')).toContainText('710');
  });

  test('rejects non-numeric year input with an error message', async ({ page }) => {
    await page.getByTestId('input-era-year').fill('abc');
    await expect(page.getByTestId('text-era-invalid')).toBeVisible();
    await expect(page.getByTestId('table-era-results')).not.toBeVisible();
  });

  test('highlights Tang Dynasty in Historical Periods for 700 CE', async ({ page }) => {
    await page.getByTestId('input-era-year').fill('700');
    const tangRow = page.getByTestId('row-period-china-tang-dynasty');
    await expect(tangRow).toBeVisible();
    await expect(tangRow).toHaveClass(/text-accent/);
    const hanRow = page.getByTestId('row-period-china-han-dynasty');
    await expect(hanRow).not.toHaveClass(/text-accent/);
  });
});
