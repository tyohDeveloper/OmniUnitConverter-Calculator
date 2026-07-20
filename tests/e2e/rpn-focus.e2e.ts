import { test, expect } from '@playwright/test';

test.describe('RPN X register focus behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('RPN section: X input auto-focuses and stays focused after Enter', async ({ page }) => {
    await page.getByTestId('tab-rpn').click();
    const xInput = page.getByTestId('rpn-x-input');
    await expect(xInput).toBeVisible();
    await expect(xInput).toBeFocused();

    await xInput.fill('5');
    await xInput.press('Enter');

    // Still in edit mode with real keyboard focus — no click needed.
    await expect(xInput).toBeFocused();

    // Typing immediately replaces the selected text.
    await page.keyboard.type('7');
    await expect(xInput).toHaveValue('7');

    // Clicking elsewhere commits the new value via blur.
    await page.getByRole('heading', { name: 'RPN Calculator' }).click();
    await expect(page.getByTestId('text-rpn-x-value')).toHaveText('7');
  });

  test('RPN section: Enter does not double-commit unchanged text on blur', async ({ page }) => {
    await page.getByTestId('tab-rpn').click();
    const xInput = page.getByTestId('rpn-x-input');
    // Seed X with 5 first so the undo history has a non-empty stack.
    await xInput.fill('5');
    await xInput.press('Enter');
    await expect(xInput).toBeFocused();

    // Type 42 and commit via Enter.
    await page.keyboard.type('42');
    await xInput.press('Enter');
    await expect(xInput).toBeFocused();

    // Blur without further typing — value stays 42, no re-commit.
    await page.getByRole('heading', { name: 'RPN Calculator' }).click();
    await expect(page.getByTestId('text-rpn-x-value')).toHaveText('42');

    // A single undo restores the pre-42 stack (only one commit happened —
    // a blur double-commit would need two undos to get back to 5).
    await page.getByTestId('button-rpn-undo').click();
    await expect(page.getByTestId('text-rpn-x-value')).toHaveText('5');
  });

  test('RPN section: simulated WebKit blur right after Enter keeps X editable', async ({ page }) => {
    // iOS WebKit's Done key fires a native blur immediately after the Enter
    // keydown, before the requestAnimationFrame refocus can run. Playwright's
    // WebKit browser cannot run in this environment (missing system libs on
    // NixOS), so we simulate that exact sequence: dispatch Enter and blur
    // synchronously in the same task.
    await page.getByTestId('tab-rpn').click();
    const xInput = page.getByTestId('rpn-x-input');
    await expect(xInput).toBeFocused();

    await xInput.fill('5');
    await xInput.press('Enter');
    await expect(xInput).toBeFocused();

    await page.keyboard.type('42');
    await xInput.evaluate((el: HTMLInputElement) => {
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
      );
      // Simulate the Done-key blur that lands before the rAF refocus.
      el.blur();
    });

    // The input must stay mounted, regain focus, and the value must have
    // committed exactly once.
    await expect(xInput).toBeFocused();
    await expect(xInput).toHaveValue('42');

    // Typing immediately replaces the selected text (edit mode intact).
    await page.keyboard.type('7');
    await expect(xInput).toHaveValue('7');

    // Blur elsewhere commits 7; a single undo restores 42 (proving the
    // simulated-WebKit Enter committed once, not zero or twice).
    await page.getByRole('heading', { name: 'RPN Calculator' }).click();
    await expect(page.getByTestId('text-rpn-x-value')).toHaveText('7');
    await page.getByTestId('button-rpn-undo').click();
    await expect(page.getByTestId('text-rpn-x-value')).toHaveText('42');
  });

  test('Converter section: X register does not grab focus; FROM field keeps focus', async ({ page }) => {
    await page.getByTestId('tab-converter').click();
    // X register shows as a static display, not an input.
    await expect(page.getByTestId('rpn-x-input')).toHaveCount(0);

    const fromInput = page.getByTestId('input-value');
    await fromInput.click();
    await fromInput.fill('123');
    await expect(fromInput).toBeFocused();

    // Editing X requires an explicit click; Enter commits and hands focus
    // back to the FROM value input.
    const xField = page.getByTestId('rpn-x-field');
    if (await xField.count()) {
      await xField.click();
      const xInput = page.getByTestId('rpn-x-input');
      await expect(xInput).toBeFocused();
      await xInput.fill('9');
      await xInput.press('Enter');
      await expect(page.getByTestId('rpn-x-input')).toHaveCount(0);
      await expect(fromInput).toBeFocused();
    }
  });

  test('Custom section: X register requires explicit click; Enter focuses VALUE input', async ({ page }) => {
    await page.getByTestId('tab-custom').click();
    await expect(page.getByTestId('rpn-x-input')).toHaveCount(0);
    const xField = page.getByTestId('rpn-x-field');
    if (await xField.count()) {
      await xField.click();
      const xInput = page.getByTestId('rpn-x-input');
      await expect(xInput).toBeFocused();
      await xInput.fill('4');
      await xInput.press('Enter');
      await expect(page.getByTestId('rpn-x-input')).toHaveCount(0);
      await expect(page.getByTestId('custom-input-value')).toBeFocused();

      // Escape still exits edit mode without committing.
      await xField.click();
      await expect(page.getByTestId('rpn-x-input')).toBeFocused();
      await page.getByTestId('rpn-x-input').press('Escape');
      await expect(page.getByTestId('rpn-x-input')).toHaveCount(0);
    }
  });
});
