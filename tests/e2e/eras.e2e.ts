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

  test('59 BCE shows the consulship of Caesar and Bibulus', async ({ page }) => {
    await page.getByTestId('input-era-year').fill('59');
    await page.getByTestId('select-era-ce-bce').click();
    await page.getByRole('option', { name: 'BCE' }).click();
    const consuls = page.getByTestId('text-era-value-roman-consuls');
    await expect(consuls).toContainText('Gaius Julius Caesar & Marcus Calpurnius Bibulus');
  });

  test('Roman consuls show a dash outside the attested range', async ({ page }) => {
    await expect(page.getByTestId('input-era-year')).toHaveValue('2026');
    await expect(page.getByTestId('text-era-value-roman-consuls')).toHaveText('—');
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

  test('Historical Periods shows regional sections with new civilizations', async ({ page }) => {
    for (const region of ['africa', 'middle_east', 'east_asia', 'mesoamerica', 'andean']) {
      await expect(page.getByTestId(`section-periods-region-${region}`)).toBeVisible();
    }
    await expect(page.getByTestId('section-periods-kush')).toBeVisible();
    await expect(page.getByTestId('section-periods-aztec')).toBeVisible();
    await expect(page.getByTestId('section-periods-inca')).toBeVisible();
  });

  test('highlights Mali, Aztec, and Inca periods for 1500 CE', async ({ page }) => {
    await page.getByTestId('input-era-year').fill('1500');
    await expect(page.getByTestId('row-period-mali-mali-empire')).toHaveClass(/text-accent/);
    await expect(page.getByTestId('row-period-aztec-aztec-empire-triple-alliance-')).toHaveClass(/text-accent/);
    await expect(page.getByTestId('row-period-inca-inca-empire')).toHaveClass(/text-accent/);
    await expect(page.getByTestId('row-period-inca-kingdom-of-cusco')).not.toHaveClass(/text-accent/);
  });
});

test.describe('Era name lookup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('tab-eras').click();
    await expect(page.getByTestId('input-era-name-lookup')).toBeVisible();
  });

  test('Meiji 33 resolves to 1900 CE and applies to the table', async ({ page }) => {
    await page.getByTestId('input-era-name-lookup').fill('Meiji 33');
    await expect(page.getByTestId('text-era-lookup-result')).toContainText('Meiji 33 = 1900 CE');
    await page.getByTestId('button-era-lookup-apply').click();
    await expect(page.getByTestId('input-era-year')).toHaveValue('1900');
    await expect(page.getByTestId('text-era-value-buddhist')).toContainText('2443');
  });

  test('diacritic-free kangxi 39 resolves to 1700 CE', async ({ page }) => {
    await page.getByTestId('input-era-name-lookup').fill('kangxi 39');
    await expect(page.getByTestId('text-era-lookup-result')).toContainText('Kāngxī 39 = 1700 CE');
  });

  test('native kanji input 明治 33 resolves to 1900 CE', async ({ page }) => {
    await page.getByTestId('input-era-name-lookup').fill('明治 33');
    await expect(page.getByTestId('text-era-lookup-result')).toContainText('Meiji 33 = 1900 CE');
  });

  test('no-space kanji input 明治33 resolves to 1900 CE', async ({ page }) => {
    await page.getByTestId('input-era-name-lookup').fill('明治33');
    await expect(page.getByTestId('text-era-lookup-result')).toContainText('Meiji 33 = 1900 CE');
  });

  test('no-space input with trailing 年 (明治33年) resolves to 1900 CE', async ({ page }) => {
    await page.getByTestId('input-era-name-lookup').fill('明治33年');
    await expect(page.getByTestId('text-era-lookup-result')).toContainText('Meiji 33 = 1900 CE');
  });

  test('no-space hanzi input 康熙39 resolves to 1700 CE', async ({ page }) => {
    await page.getByTestId('input-era-name-lookup').fill('康熙39');
    await expect(page.getByTestId('text-era-lookup-result')).toContainText('Kāngxī 39 = 1700 CE');
  });

  test('native hanzi input 康熙 39 resolves to 1700 CE', async ({ page }) => {
    await page.getByTestId('input-era-name-lookup').fill('康熙 39');
    await expect(page.getByTestId('text-era-lookup-result')).toContainText('Kāngxī 39 = 1700 CE');
  });

  test('autocomplete suggests era names while typing', async ({ page }) => {
    await page.getByTestId('input-era-name-lookup').fill('kei');
    await expect(page.getByTestId('list-era-lookup-suggestions')).toBeVisible();
    await page.getByTestId('option-era-lookup-japanese-keicho').click();
    await page.getByTestId('input-era-name-lookup').press('End');
    await page.keyboard.type('5');
    await expect(page.getByTestId('text-era-lookup-result')).toContainText('Keichō 5 = 1600 CE');
  });

  test('shows errors for out-of-range years and unknown names', async ({ page }) => {
    await page.getByTestId('input-era-name-lookup').fill('Meiji 46');
    await expect(page.getByTestId('text-era-lookup-out-of-range')).toBeVisible();
    await page.getByTestId('input-era-name-lookup').fill('Notanera 5');
    await expect(page.getByTestId('text-era-lookup-unknown')).toBeVisible();
  });
});

test.describe('Native-script era display (ja/zh)', () => {
  async function switchLanguage(page: import('@playwright/test').Page, lang: string) {
    await page.getByTestId('select-language').click();
    await page.getByRole('option', { name: lang, exact: true }).click();
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('tab-eras').click();
    await expect(page.getByTestId('input-era-year')).toBeVisible();
  });

  test('ja: 1900 shows 明治 (Meiji) and 光緒 (Guāngxù) in the results table', async ({ page }) => {
    await switchLanguage(page, 'ja');
    await page.getByTestId('input-era-year').fill('1900');
    await expect(page.getByTestId('text-era-value-japanese')).toContainText('明治 (Meiji) 33');
    await expect(page.getByTestId('text-era-value-chinese')).toContainText('光緒 (Guāngxù) 26');
  });

  test('zh: 1900 shows native script era names', async ({ page }) => {
    await switchLanguage(page, 'zh');
    await page.getByTestId('input-era-year').fill('1900');
    await expect(page.getByTestId('text-era-value-japanese')).toContainText('明治 (Meiji) 33');
    await expect(page.getByTestId('text-era-value-chinese')).toContainText('光緒 (Guāngxù) 26');
  });

  test('ja: lookup result and suggestions include native script', async ({ page }) => {
    await switchLanguage(page, 'ja');
    await page.getByTestId('input-era-name-lookup').fill('Meiji 33');
    await expect(page.getByTestId('text-era-lookup-result')).toContainText('明治 (Meiji) 33 = 1900');
    await page.getByTestId('input-era-name-lookup').fill('kei');
    await expect(page.getByTestId('list-era-lookup-suggestions')).toBeVisible();
    await expect(page.getByTestId('option-era-lookup-japanese-keicho')).toContainText('慶長 (Keichō)');
  });

  test('en: results table stays romanized-only', async ({ page }) => {
    await page.getByTestId('input-era-year').fill('1900');
    const jp = page.getByTestId('text-era-value-japanese');
    await expect(jp).toContainText('Meiji 33');
    await expect(jp).not.toContainText('明治');
    const cn = page.getByTestId('text-era-value-chinese');
    await expect(cn).toContainText('Guāngxù 26');
    await expect(cn).not.toContainText('光緒');
  });

  test('de: results table stays romanized-only', async ({ page }) => {
    await switchLanguage(page, 'de');
    await page.getByTestId('input-era-year').fill('1900');
    await expect(page.getByTestId('text-era-value-japanese')).toContainText('Meiji 33');
    await expect(page.getByTestId('text-era-value-japanese')).not.toContainText('明治');
  });
});

test.describe('Hijri date converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('tab-eras').click();
    await expect(page.getByTestId('card-hijri-date')).toBeVisible();
  });

  test('Gregorian to Hijri: 11 March 2024 = 1 Ramadan 1445 AH', async ({ page }) => {
    await page.getByTestId('input-greg-day').fill('11');
    await page.getByTestId('select-greg-month').click();
    await page.getByRole('option', { name: 'March' }).click();
    await page.getByTestId('input-greg-year').fill('2024');
    await expect(page.getByTestId('input-hijri-day')).toHaveValue('1');
    await expect(page.getByTestId('select-hijri-month')).toContainText('Ramadan');
    await expect(page.getByTestId('input-hijri-year')).toHaveValue('1445');
  });

  test('Hijri to Gregorian: 1 Muharram 1447 AH = 27 June 2025', async ({ page }) => {
    await page.getByTestId('input-hijri-day').fill('1');
    await page.getByTestId('select-hijri-month').click();
    await page.getByRole('option', { name: 'Muharram' }).click();
    await page.getByTestId('input-hijri-year').fill('1447');
    await expect(page.getByTestId('input-greg-day')).toHaveValue('27');
    await expect(page.getByTestId('select-greg-month')).toContainText('June');
    await expect(page.getByTestId('input-greg-year')).toHaveValue('2025');
  });

  test('rejects an invalid Gregorian date (31 February)', async ({ page }) => {
    await page.getByTestId('select-greg-month').click();
    await page.getByRole('option', { name: 'February' }).click();
    await page.getByTestId('input-greg-day').fill('31');
    await expect(page.getByTestId('text-hijri-date-invalid')).toBeVisible();
  });

  test('rejects Hijri day 30 in a 29-day month', async ({ page }) => {
    await page.getByTestId('input-hijri-year').fill('1447');
    await page.getByTestId('select-hijri-month').click();
    await page.getByRole('option', { name: 'Safar' }).click();
    await page.getByTestId('input-hijri-day').fill('30');
    await expect(page.getByTestId('text-hijri-date-invalid')).toBeVisible();
  });
});
