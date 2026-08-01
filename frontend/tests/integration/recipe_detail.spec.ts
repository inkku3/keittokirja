import { test, expect } from '@playwright/test';

// Playwright spec: navigates to built frontend (assumes it is served at http://127.0.0.1:8001)
// and checks that recipe detail DOM matches legacy selectors and content.

test.describe('Recipe detail integration', () => {
  test('renders legacy DOM and shows recipe content', async ({ page }) => {
    const base = process.env.E2E_BASE_URL || 'http://127.0.0.1:8001';

    // Navigate to a known recipe page. Replace `smoke1` with an ID available in your test DB.
    await page.goto(`${base}/recipe/smoke1`, { waitUntil: 'networkidle' });

    // Ensure legacy IDs exist
    await expect(page.locator('#header')).toBeVisible();
    await expect(page.locator('#info')).toBeVisible();
    await expect(page.locator('#ingredients')).toBeVisible();
    await expect(page.locator('#instructions')).toBeVisible();

    // If an image exists, it should have id=image
    const img = page.locator('#image');
    if (await img.count() > 0) {
      await expect(img).toHaveAttribute('alt', /.+/);
    }
  });
});
