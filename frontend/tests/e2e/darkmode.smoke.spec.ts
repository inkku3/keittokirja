import { test, expect } from '@playwright/test';

// Dark mode smoke e2e: toggle control persists across reloads
// Usage: set E2E_BASE_URL or PREVIEW_URL to the running frontend (defaults to http://127.0.0.1:5173)
const BASE = process.env.E2E_BASE_URL || process.env.PREVIEW_URL || 'http://127.0.0.1:5173';

test.describe('Dark mode smoke e2e', () => {
  test('toggle persists across reloads and updates body class and button text', async ({ page }) => {
    const base = BASE;

    await page.goto(base, { waitUntil: 'networkidle' });

    const toggle = page.locator('#toggleDark');
    await expect(toggle).toBeVisible();

    // read current body class and button text
    const initialHasDark = await page.evaluate(() => document.body.classList.contains('dark-mode'));
    const initialText = (await toggle.textContent())?.trim() ?? '';

    // legacy labels: when dark enabled the button shows "Vaalea tila" (light mode),
    // when dark disabled the button shows "Tumma tila" (dark mode)
    const labelWhenDarkOn = 'Vaalea tila';
    const labelWhenDarkOff = 'Tumma tila';

    // sanity: initial text should match expected label for initialHasDark
    if (initialHasDark) {
      await expect(toggle).toHaveText(new RegExp(labelWhenDarkOn));
    } else {
      await expect(toggle).toHaveText(new RegExp(labelWhenDarkOff));
    }

    // click to toggle
    await toggle.click();

    // expected post-toggle values
    const expectedHasDark = !initialHasDark;
    const expectedLabel = expectedHasDark ? labelWhenDarkOn : labelWhenDarkOff;

    // assert immediate effect
    await expect(page.locator('body')).toHaveClass(expectedHasDark ? /(^|\s)dark-mode(\s|$)/ : /^(?!.*dark-mode).*$/);
    await expect(toggle).toHaveText(new RegExp(expectedLabel));

    // assert localStorage key updated to 'true'/'false'
    const stored = await page.evaluate(() => localStorage.getItem('isDarkMode'));
    expect(stored).toBe(expectedHasDark ? 'true' : 'false');

    // reload and assert persistence
    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.locator('body')).toHaveClass(expectedHasDark ? /(^|\s)dark-mode(\s|$)/ : /^(?!.*dark-mode).*$/);
    await expect(page.locator('#toggleDark')).toHaveText(new RegExp(expectedLabel));
  });
});
