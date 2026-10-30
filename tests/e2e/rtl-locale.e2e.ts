import { test, expect } from '@playwright/test';

// C-41 (engineering-standards 1.0.1.0): layout stays LTR under an RTL
// locale; numerals render Latin by default and switch only through the
// numeral preference, which is independent of language (C-42).
// Closes exception E-7.
test.describe('RTL locale (ar)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('select-language').click();
    await page.getByRole('option', { name: 'ar', exact: true }).click();
    await expect(page.getByText('الطول')).toBeVisible(); // "Length" in Arabic: locale applied
  });

  test('layout direction stays LTR while text runs are Arabic', async ({ page }) => {
    const dir = await page.evaluate(() => getComputedStyle(document.documentElement).direction);
    expect(dir).toBe('ltr');
    // Arabic text itself renders right-to-left within its run (bidi), which is
    // the browser's job; the layout container is what the rule constrains.
    const navDir = await page.locator('nav').first().evaluate((el) => getComputedStyle(el).direction);
    expect(navDir).toBe('ltr');
  });

  test('numerals are Latin by default and switch only via the numeral preference', async ({ page }) => {
    await page.getByText('الطول').first().click();
    const input = page.getByTestId('input-value');
    await input.fill('1234.5');
    await input.press('Tab');
    const result = page.getByTestId('display-result');
    await expect(result).not.toHaveText('');
    await expect(result).toHaveText(/[0-9]/);
    await expect(result).not.toHaveText(/[٠-٩]/);

    await page.getByTestId('select-number-format').click();
    await page.getByRole('option', { name: /Traditional|تقليدي/ }).click();
    await expect(result).toHaveText(/[٠-٩]/);
  });
});
