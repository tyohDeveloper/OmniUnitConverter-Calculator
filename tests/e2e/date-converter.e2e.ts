import { test, expect } from '@playwright/test';

test.describe('Date converter category', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByText('Date', { exact: true }).first().click();
  });

  test('shows the date pane with calendar inputs', async ({ page }) => {
    await expect(page.getByTestId('select-date-calendar')).toBeVisible();
    await expect(page.getByTestId('input-date-year')).toBeVisible();
    await expect(page.getByTestId('select-date-month')).toBeVisible();
    await expect(page.getByTestId('input-date-day')).toBeVisible();
    await expect(page.getByTestId('select-date-target-calendar')).toBeVisible();
  });

  test('converts a Gregorian date to Buddhist calendar', async ({ page }) => {
    await page.getByTestId('input-date-year').fill('2023');
    await page.getByTestId('input-date-day').fill('2');
    await page.getByTestId('select-date-month').click();
    await page.getByTestId('option-date-month-9').click();
    await page.getByTestId('select-date-target-calendar').click();
    await page.getByTestId('option-date-target-buddhist').click();
    await expect(page.getByTestId('text-date-result')).toContainText('2566');
  });

  test('shows the all-calendars list', async ({ page }) => {
    await page.getByTestId('input-date-year').fill('2024');
    await page.getByTestId('input-date-day').fill('29');
    await page.getByTestId('select-date-month').click();
    await page.getByTestId('option-date-month-2').click();
    await expect(page.getByTestId('row-date-all-hebrew')).toBeVisible();
    await expect(page.getByTestId('row-date-all-persian')).toBeVisible();
    await expect(page.getByTestId('row-date-all-islamic')).toBeVisible();
    await expect(page.getByTestId('row-date-all-islamic-rgsa')).toBeVisible();
  });

  test('shows an inline error for an invalid date', async ({ page }) => {
    await page.getByTestId('input-date-year').fill('2023');
    await page.getByTestId('input-date-day').fill('30');
    await page.getByTestId('select-date-month').click();
    await page.getByTestId('option-date-month-2').click();
    await expect(page.getByTestId('text-date-error')).toBeVisible();
  });

  test('date category is excluded from comparison-mode categories', async ({ page }) => {
    await expect(page.getByTestId('select-from-unit')).not.toBeVisible();
  });
});
